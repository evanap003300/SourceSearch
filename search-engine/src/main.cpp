#include "indexer.h"
#include "searcher.h"
#include <iostream>
#include <vector>
#include <string>
#include <filesystem>

int main(int argc, char* argv[]) {
    // Check if directory and query arguments are provided
    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <directory_path> <search_query>" << std::endl;
        return 1;
    }

    std::string directory = argv[1];
    std::string query = argv[2];

    // Build the index
    Indexer myIndexer;
    myIndexer.buildIndex(directory);

    const auto& completed_index = myIndexer.getIndex();
    const auto& manifest = myIndexer.getManifest();

    // Create searcher and perform search
    Searcher mySearcher(completed_index, manifest);
    std::vector<std::string> file_paths = mySearcher.search(query);

    // Output results as JSON with just filenames
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