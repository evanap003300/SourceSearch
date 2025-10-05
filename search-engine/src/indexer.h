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
    const auto& getManifest() const { return manifest_; }

private:
    std::unordered_map<std::string, std::unordered_map<int, int>> inverted_index;
    std::unordered_map<int, std::string> manifest_;
};

#endif