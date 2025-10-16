#include "server.h"
#include <iostream>
#include <sstream>
#include <cstring>
#include <filesystem>
#include <csignal>
#include <thread>
#include <mutex>

// POSIX socket headers
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

// Global variable for signal handling
static Server* global_server = nullptr;
static std::mutex server_mutex;

void signalHandler(int signum) {
    if (global_server) {
        std::cout << "\nReceived signal " << signum << ". Shutting down gracefully..." << std::endl;
        global_server->stop();
    }
}

Server::Server(int port) : port_(port), server_socket_(-1), running_(false), searcher_(nullptr) {}

Server::~Server() {
    stop();
}

int Server::initializeSocket() {
    // Create server socket
    server_socket_ = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket_ < 0) {
        std::cerr << "Error: Failed to create socket" << std::endl;
        return 1;
    }

    // Set socket to reuse address
    int reuse = 1;
    if (setsockopt(server_socket_, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse)) < 0) {
        std::cerr << "Error: Failed to set socket options" << std::endl;
        close(server_socket_);
        return 1;
    }

    // Bind socket to port
    struct sockaddr_in server_addr;
    std::memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    server_addr.sin_port = htons(port_);

    if (bind(server_socket_, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        std::cerr << "Error: Failed to bind socket to port " << port_ << std::endl;
        close(server_socket_);
        return 1;
    }

    // Listen for incoming connections
    if (listen(server_socket_, 5) < 0) {
        std::cerr << "Error: Failed to listen on socket" << std::endl;
        close(server_socket_);
        return 1;
    }

    return 0;
}

std::string Server::parseJsonQuery(const std::string& json_request) {
    // Simple JSON parsing to extract "query" value
    // Expected format: {"query":"search_term"}

    size_t query_pos = json_request.find("\"query\"");
    if (query_pos == std::string::npos) {
        return "";
    }

    // Find the colon after "query"
    size_t colon_pos = json_request.find(':', query_pos);
    if (colon_pos == std::string::npos) {
        return "";
    }

    // Find the opening quote
    size_t quote_start = json_request.find('\"', colon_pos);
    if (quote_start == std::string::npos) {
        return "";
    }

    // Find the closing quote
    size_t quote_end = json_request.find('\"', quote_start + 1);
    if (quote_end == std::string::npos) {
        return "";
    }

    return json_request.substr(quote_start + 1, quote_end - quote_start - 1);
}

std::string Server::processQuery(const std::string& query) {
    if (!searcher_ || query.empty()) {
        return "{\"error\":\"Invalid query\"}";
    }

    // Perform search
    std::vector<std::string> results = searcher_->search(query);

    // Build JSON response
    std::stringstream json;
    json << "{";
    json << "\"query\":\"" << query << "\",";
    json << "\"count\":" << results.size() << ",";
    json << "\"results\":[";

    for (size_t i = 0; i < results.size(); ++i) {
        // Extract just the filename from the full path
        std::filesystem::path path(results[i]);
        std::string filename = path.filename().string();

        json << "\"" << filename << "\"";
        if (i < results.size() - 1) {
            json << ",";
        }
    }

    json << "]}";

    return json.str();
}

void Server::handleConnection(int client_socket) {
    const int BUFFER_SIZE = 4096;
    char buffer[BUFFER_SIZE];

    // Receive data from client
    std::memset(buffer, 0, BUFFER_SIZE);
    ssize_t bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);

    if (bytes_received < 0) {
        std::cerr << "Error: Failed to receive data from client" << std::endl;
        close(client_socket);
        return;
    }

    std::string request(buffer);

    // Parse query from JSON
    std::string query = parseJsonQuery(request);

    // Process query and generate response
    std::string response = processQuery(query);

    // Add newline to response
    response += "\n";

    // Send response to client
    if (send(client_socket, response.c_str(), response.length(), 0) < 0) {
        std::cerr << "Error: Failed to send response to client" << std::endl;
    }

    close(client_socket);
}

int Server::start(const std::string& indexFile, const std::string& manifestFile) {
    // Check if binary index files exist
    if (!std::filesystem::exists(indexFile) || !std::filesystem::exists(manifestFile)) {
        std::cerr << "Error: Pre-built index files not found (" << indexFile << " or " << manifestFile << ")" << std::endl;
        std::cerr << "Please run with --build mode first to create the index." << std::endl;
        return 1;
    }

    std::cout << "Loading index files..." << std::endl;

    // Load index and manifest
    try {
        indexer_.loadIndexFromFile(indexFile);
        indexer_.loadManifestFromFile(manifestFile);
    } catch (const std::exception& e) {
        std::cerr << "Error: Failed to load index: " << e.what() << std::endl;
        return 1;
    }

    // Create searcher with loaded data
    const auto& index = indexer_.getIndex();
    const auto& manifest = indexer_.getManifest();
    searcher_ = new Searcher(index, manifest);

    std::cout << "Index loaded successfully with " << index.size() << " terms and "
              << manifest.size() << " documents." << std::endl;

    // Initialize socket
    if (initializeSocket() != 0) {
        return 1;
    }

    running_ = true;

    // Set up signal handlers for graceful shutdown
    std::lock_guard<std::mutex> lock(server_mutex);
    global_server = this;
    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);

    std::cout << "Server started on 127.0.0.1:" << port_ << std::endl;
    std::cout << "Listening for incoming connections..." << std::endl;
    std::cout << "Press Ctrl+C to shutdown." << std::endl;

    // Main server loop
    while (running_) {
        struct sockaddr_in client_addr;
        socklen_t client_addr_len = sizeof(client_addr);

        // Accept incoming connection
        int client_socket = accept(server_socket_, (struct sockaddr*)&client_addr, &client_addr_len);

        if (client_socket < 0) {
            if (running_) {  // Only print error if we're still running
                std::cerr << "Error: Failed to accept connection" << std::endl;
            }
            continue;
        }

        // Handle connection in a separate thread
        std::thread(&Server::handleConnection, this, client_socket).detach();
    }

    return 0;
}

void Server::stop() {
    running_ = false;

    // Close server socket
    if (server_socket_ >= 0) {
        close(server_socket_);
        server_socket_ = -1;
    }

    // Clean up searcher
    if (searcher_) {
        delete searcher_;
        searcher_ = nullptr;
    }

    std::cout << "Server stopped." << std::endl;
}
