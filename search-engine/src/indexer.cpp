#include "indexer.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <filesystem>
#include <cstdint> 

using namespace std;

Indexer::Indexer() {
   
}

string Indexer::getFileContent(const string& fileName) {
    ifstream file(fileName);

    if (!file.is_open()) {
        cerr << "Error opening the file!\n";
        return "";
    }

    string fileContents((istreambuf_iterator<char>(file)), 
                            istreambuf_iterator<char>());
    
    file.close();

    return fileContents;
}

unordered_map<string, int> Indexer::getFrequencies(const string& text) {
    stringstream ss(text);
    unordered_map<string, int> frequencies;

    string word;
    while (ss >> word) {
        frequencies[word]++;
    }

    return frequencies;
}

void Indexer::buildIndex(const string& directory) {
    int docId = 0;

    for (const auto& entry : filesystem::directory_iterator(directory)) {
        if (entry.is_regular_file()) {
            string path = entry.path().string();
            manifest_[docId] = path;

            string content = getFileContent(path);
            if (content.empty()) {
                continue;
            }

            stringstream ss(content);
            string word;
            while (ss >> word) {
                inverted_index[word][docId]++;
            }

            docId++;
        }
    }

}

void Indexer::saveIndexToFile(const std::string& filename) {
    ofstream file(filename, ios::binary);
    if (!file.is_open()) {
        cerr << "Error opening file for writing: " << filename << endl;
        return;
    }

    // Write number of words in the index
    uint32_t numWords = inverted_index.size();
    file.write(reinterpret_cast<const char*>(&numWords), sizeof(uint32_t));

    // Write each word and its posting list
    for (const auto& wordEntry : inverted_index) {
        const string& word = wordEntry.first;
        const auto& postingList = wordEntry.second;

        // Write word length and word
        uint32_t wordLen = word.length();
        file.write(reinterpret_cast<const char*>(&wordLen), sizeof(uint32_t));
        file.write(word.c_str(), wordLen);

        // Write number of documents for this word
        uint32_t numDocs = postingList.size();
        file.write(reinterpret_cast<const char*>(&numDocs), sizeof(uint32_t));

        // Write each document ID and frequency
        for (const auto& docEntry : postingList) {
            int docId = docEntry.first;
            int frequency = docEntry.second;
            file.write(reinterpret_cast<const char*>(&docId), sizeof(int));
            file.write(reinterpret_cast<const char*>(&frequency), sizeof(int));
        }
    }

    file.close();
    cout << "Index saved to " << filename << endl;
}

void Indexer::loadIndexFromFile(const std::string& filename) {
    ifstream file(filename, ios::binary);
    if (!file.is_open()) {
        cerr << "Error opening file for reading: " << filename << endl;
        return;
    }

    // Clear existing index
    inverted_index.clear();

    // Read number of words
    uint32_t numWords;
    file.read(reinterpret_cast<char*>(&numWords), sizeof(uint32_t));

    // Read each word and its posting list
    for (uint32_t i = 0; i < numWords; ++i) {
        // Read word length and word
        uint32_t wordLen;
        file.read(reinterpret_cast<char*>(&wordLen), sizeof(uint32_t));

        string word(wordLen, '\0');
        file.read(&word[0], wordLen);

        // Read number of documents for this word
        uint32_t numDocs;
        file.read(reinterpret_cast<char*>(&numDocs), sizeof(uint32_t));

        // Read each document ID and frequency
        for (uint32_t j = 0; j < numDocs; ++j) {
            int docId;
            int frequency;
            file.read(reinterpret_cast<char*>(&docId), sizeof(int));
            file.read(reinterpret_cast<char*>(&frequency), sizeof(int));
            inverted_index[word][docId] = frequency;
        }
    }

    file.close();
    cout << "Index loaded from " << filename << endl;
}

void Indexer::saveManifestToFile(const std::string& filename) {
    ofstream file(filename, ios::binary);
    if (!file.is_open()) {
        cerr << "Error opening file for writing: " << filename << endl;
        return;
    }

    // Write number of documents
    uint32_t numDocs = manifest_.size();
    file.write(reinterpret_cast<const char*>(&numDocs), sizeof(uint32_t));

    // Write each document ID and path
    for (const auto& entry : manifest_) {
        int docId = entry.first;
        const string& path = entry.second;

        // Write document ID
        file.write(reinterpret_cast<const char*>(&docId), sizeof(int));

        // Write path length and path
        uint32_t pathLen = path.length();
        file.write(reinterpret_cast<const char*>(&pathLen), sizeof(uint32_t));
        file.write(path.c_str(), pathLen);
    }

    file.close();
    cout << "Manifest saved to " << filename << endl;
}

void Indexer::loadManifestFromFile(const std::string& filename) {
    ifstream file(filename, ios::binary);
    if (!file.is_open()) {
        cerr << "Error opening file for reading: " << filename << endl;
        return;
    }

    // Clear existing manifest
    manifest_.clear();

    // Read number of documents
    uint32_t numDocs;
    file.read(reinterpret_cast<char*>(&numDocs), sizeof(uint32_t));

    // Read each document ID and path
    for (uint32_t i = 0; i < numDocs; ++i) {
        int docId;
        file.read(reinterpret_cast<char*>(&docId), sizeof(int));

        // Read path length and path
        uint32_t pathLen;
        file.read(reinterpret_cast<char*>(&pathLen), sizeof(uint32_t));

        string path(pathLen, '\0');
        file.read(&path[0], pathLen);

        manifest_[docId] = path;
    }

    file.close();
    cout << "Manifest loaded from " << filename << endl;
}