#include "indexer.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <filesystem> 

using namespace std;

Indexer::Indexer() {
    cout << "Object created\n";
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
    
    cout << "Index built for " << docId << " documents.\n";
}