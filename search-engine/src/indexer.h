#ifndef INDEXER_H
#define INDEXER_H

#include <string>
#include <unordered_map>

class Indexer {
public:
    Indexer(); 
    std::string getFileContent(const std::string& fileName); 
    std::unordered_map<std::string, int> getFrequencies(const std::string& text);
    void buildIndex(const std::string& directory);
    const auto& getIndex() const { return inverted_index; }

private:
    std::unordered_map<std::string, std::unordered_map<int, int>> inverted_index;
};

#endif