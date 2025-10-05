#include "indexer.h"
#include "searcher.h"
#include <iostream>
#include <vector>
#include <string>

int main(int argc, char* argv[]) {
    // Check if query argument is provided
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <search_query>" << std::endl;
        return 1;
    }

    std::string query = argv[1];

    // Build the index
    Indexer myIndexer;
    myIndexer.buildIndex("../../backend/crawler/python_code");

    const auto& completed_index = myIndexer.getIndex();
    const auto& manifest = myIndexer.getManifest();

    // Create searcher and perform search
    Searcher mySearcher(completed_index, manifest);
    std::vector<std::string> file_paths = mySearcher.search(query);

    // Output results as JSON
    std::cout << "{" << std::endl;
    std::cout << "  \"query\": \"" << query << "\"," << std::endl;
    std::cout << "  \"count\": " << file_paths.size() << "," << std::endl;
    std::cout << "  \"results\": [" << std::endl;

    for (size_t i = 0; i < file_paths.size(); ++i) {
        std::cout << "    \"" << file_paths[i] << "\"";
        if (i < file_paths.size() - 1) {
            std::cout << ",";
        }
        std::cout << std::endl;
    }

    std::cout << "  ]" << std::endl;
    std::cout << "}" << std::endl;

    return 0;
}