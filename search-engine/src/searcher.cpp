#include "searcher.h"
#include <iostream>

Searcher::Searcher(
    const std::unordered_map<std::string, std::unordered_map<int, int>>& index,
    const std::unordered_map<int, std::string>& manifest
)
    : index_(index), manifest_(manifest) {}

std::vector<std::string> Searcher::search(const std::string& searchTerm) {
    std::vector<std::string> results;
    auto it = index_.find(searchTerm);
    if (it != index_.end()) {
        const auto& doc_map = it->second;
        for (const auto& pair : doc_map) {
            int doc_id = pair.first;
            if (manifest_.count(doc_id)) {
                results.push_back(manifest_.at(doc_id));
            }
        }
    }
    return results;
}