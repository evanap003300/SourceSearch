#ifndef SERVER_H
#define SERVER_H

#include "indexer.h"
#include "searcher.h"
#include <string>
#include <unordered_map>
#include <vector>

class Server {
public:
    Server(int port = 9000);
    ~Server();

    // Start the server and load the index
    // Returns 0 on success, non-zero on error
    int start(const std::string& indexFile = "index.bin",
              const std::string& manifestFile = "manifest.bin");

    // Stop the server gracefully
    void stop();

private:
    int port_;
    int server_socket_;
    bool running_;

    Indexer indexer_;
    Searcher* searcher_;

    // Server initialization
    int initializeSocket();

    // Connection handling
    void handleConnection(int client_socket);

    // JSON processing
    std::string processQuery(const std::string& query);
    std::string parseJsonQuery(const std::string& json_request);
};

#endif // SERVER_H
