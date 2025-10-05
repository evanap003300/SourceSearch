#ifndef SEARCHER_H
#define SEARCHER_H

#include <string>
#include <vector>
#include <unordered_map>

class Searcher {
public:
    Searcher(const std::unordered_map<std::string, std::unordered_map<int, int>>& index);
    std::vector<int> search(const std::string& searchTerm);

private:
    const std::unordered_map<std::string, std::unordered_map<int, int>>& inverted_index_;
};

#endif