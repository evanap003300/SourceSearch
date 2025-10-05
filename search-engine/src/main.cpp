#include "indexer.h"
#include "searcher.h"
#include <iostream>
#include <vector>

int main() {
    Indexer myIndexer;
    myIndexer.buildIndex("../../backend/crawler/python_code");
    
    const auto& completed_index = myIndexer.getIndex();
    const auto& manifest = myIndexer.getManifest();

    Searcher mySearcher(completed_index, manifest);
    
    std::string query = "requests";
    std::vector<std::string> file_paths = mySearcher.search(query);

    if (!file_paths.empty()) {
        std::cout << "\nTerm '" << query << "' found in the following files:" << std::endl;
        for (const auto& path : file_paths) {
            std::cout << "  - " << path << std::endl;
        }
    } else {
        std::cout << "\nTerm '" << query << "' was not found in the index." << std::endl;
    }
    
    return 0;
}