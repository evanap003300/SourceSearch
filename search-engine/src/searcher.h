#ifndef SEARCHER_H
#define SEARCHER_H

#include <string>
#include <vector>
#include <unordered_map>

class Searcher {
public:
    Searcher(
        const std::unordered_map<std::string, std::unordered_map<int, int>>& index,
        const std::unordered_map<int, std::string>& manifest
    );

    std::vector<std::string> search(const std::string& searchTerm);

private:
    const std::unordered_map<std::string, std::unordered_map<int, int>>& index_;
    const std::unordered_map<int, std::string>& manifest_;
};

#endif