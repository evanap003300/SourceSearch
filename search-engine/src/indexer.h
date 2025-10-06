#ifndef INDEXER_H
#define INDEXER_H

#include <string>
#include <unordered_map>

class Indexer {
public:
    Indexer(); 

    // Seralization of files
    void saveIndexToFile(const std::string& filename);
    void loadIndexFromFile(const std::string& filename);

    // Build the index
    void buildIndex(const std::string& directory);

    // Getters
    const std::unordered_map<std::string, std::unordered_map<int, int>>& getIndex() const { return inverted_index; }
    const std::unordered_map<int, std::string>& getManifest() const { return manifest_; }

private:
    // Helper functions
    std::string getFileContent(const std::string& fileName); 
    std::unordered_map<std::string, int> getFrequencies(const std::string& text);

    std::unordered_map<std::string, std::unordered_map<int, int>> inverted_index;
    std::unordered_map<int, std::string> manifest_;
};

#endif