#include "indexer.h"
#include "searcher.h"
#include "server.h"
#include <iostream>
#include <vector>
#include <string>
#include <filesystem>

void printUsage(const char* programName) {
    std::cout << "Search Engine - Build, Search, and Server Modes" << std::endl;
    std::cout << std::endl;
    std::cout << "Usage:" << std::endl;
    std::cout << "  Build Mode:  " << programName << " --build <directory_path>" << std::endl;
    std::cout << "  Search Mode: " << programName << " --search <search_query>" << std::endl;
    std::cout << "  Server Mode: " << programName << " --server [port]" << std::endl;
    std::cout << std::endl;
    std::cout << "Options:" << std::endl;
    std::cout << "  --build <directory_path>    Build the inverted index from a directory and save to disk" << std::endl;
    std::cout << "  --search <search_query>     Search using pre-built index (loads index.bin and manifest.bin)" << std::endl;
    std::cout << "  --server [port]             Start persistent server listening on port (default: 9000)" << std::endl;
    std::cout << std::endl;
    std::cout << "Binary files created/used:" << std::endl;
    std::cout << "  index.bin       - Binary file containing the inverted index" << std::endl;
    std::cout << "  manifest.bin    - Binary file containing the document manifest" << std::endl;
}

int main(int argc, char* argv[]) {
    // Check if at least 2 arguments are provided
    if (argc < 2) {
        printUsage(argv[0]);
        return 1;
    }

    std::string mode = argv[1];

    // BUILD MODE
    if (mode == "--build") {
        if (argc < 3) {
            std::cerr << "Error: --build requires a directory path" << std::endl;
            std::cout << std::endl;
            printUsage(argv[0]);
            return 1;
        }

        std::string directory = argv[2];

        // Verify directory exists
        if (!std::filesystem::is_directory(directory)) {
            std::cerr << "Error: '" << directory << "' is not a valid directory" << std::endl;
            return 1;
        }

        std::cout << "Building index from directory: " << directory << std::endl;

        // Build the index
        Indexer indexer;
        indexer.buildIndex(directory);

        // Save index and manifest to binary files
        indexer.saveIndexToFile("index.bin");
        indexer.saveManifestToFile("manifest.bin");

        std::cout << "Build completed successfully!" << std::endl;
        std::cout << "Index and manifest have been saved to index.bin and manifest.bin" << std::endl;

        return 0;
    }

    // SEARCH MODE
    else if (mode == "--search") {
        if (argc < 3) {
            std::cerr << "Error: --search requires a search query" << std::endl;
            std::cout << std::endl;
            printUsage(argv[0]);
            return 1;
        }

        std::string query = argv[2];

        // Check if binary index files exist
        if (!std::filesystem::exists("index.bin") || !std::filesystem::exists("manifest.bin")) {
            std::cerr << "Error: Pre-built index files not found (index.bin or manifest.bin)" << std::endl;
            std::cerr << "Please run with --build mode first to create the index." << std::endl;
            return 1;
        }

        std::cout << "Loading pre-built index..." << std::endl;

        // Load the index and manifest from binary files
        Indexer indexer;
        indexer.loadIndexFromFile("index.bin");
        indexer.loadManifestFromFile("manifest.bin");

        const auto& completed_index = indexer.getIndex();
        const auto& manifest = indexer.getManifest();

        // Create searcher and perform search
        Searcher searcher(completed_index, manifest);
        std::vector<std::string> file_paths = searcher.search(query);

        // Output results as JSON
        std::cout << "{" << std::endl;
        std::cout << "  \"query\": \"" << query << "\"," << std::endl;
        std::cout << "  \"count\": " << file_paths.size() << "," << std::endl;
        std::cout << "  \"results\": [" << std::endl;

        for (size_t i = 0; i < file_paths.size(); ++i) {
            // Extract just the filename from the full path
            std::filesystem::path path(file_paths[i]);
            std::string filename = path.filename().string();

            std::cout << "    \"" << filename << "\"";
            if (i < file_paths.size() - 1) {
                std::cout << ",";
            }
            std::cout << std::endl;
        }

        std::cout << "  ]" << std::endl;
        std::cout << "}" << std::endl;

        return 0;
    }

    // SERVER MODE
    else if (mode == "--server") {
        int port = 9000;  // Default port

        // Parse optional port argument
        if (argc >= 3) {
            try {
                port = std::stoi(argv[2]);
                if (port < 1 || port > 65535) {
                    std::cerr << "Error: Port must be between 1 and 65535" << std::endl;
                    return 1;
                }
            } catch (const std::exception& e) {
                std::cerr << "Error: Invalid port number: " << argv[2] << std::endl;
                return 1;
            }
        }

        std::cout << "Starting search engine server..." << std::endl;

        // Create and start server
        Server server(port);
        int result = server.start("index.bin", "manifest.bin");

        return result;
    }

    // INVALID MODE
    else {
        std::cerr << "Error: Unknown mode '" << mode << "'" << std::endl;
        std::cout << std::endl;
        printUsage(argv[0]);
        return 1;
    }
}