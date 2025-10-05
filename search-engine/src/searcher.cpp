#include "searcher.h"
#include <iostream>

Searcher::Searcher(const std::unordered_map<std::string, std::unordered_map<int, int>>& index)
    : inverted_index_(index) {}

std::vector<int> Searcher::search(const std::string& searchTerm) {
    std::vector<int> results;

    auto it = inverted_index_.find(searchTerm);

    if (it != inverted_index_.end()) {
        const auto& doc_map = it->second;
        
        for (const auto& pair : doc_map) {
            results.push_back(pair.first);
        }
    }
    
    return results;
}