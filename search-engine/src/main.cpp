#include "indexer.h"
#include "searcher.h"
#include <iostream>
#include <vector>

int main() {
    Indexer myIndexer;
    myIndexer.buildIndex("python_code");
    
    const auto& completed_index = myIndexer.getIndex();

    Searcher mySearcher(completed_index);

    std::string query = "requests";
    std::vector<int> doc_ids = mySearcher.search(query);

    if (!doc_ids.empty()) {
        std::cout << "\nTerm '" << query << "' found in document IDs: ";
        for (int id : doc_ids) {
            std::cout << id << " ";
        }
        std::cout << '\n';
    } else {
        std::cout << "\nTerm '" << query << "' was not found in the index.\n";
    }
    
    return 0;
}