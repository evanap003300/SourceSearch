#include "fileFunctions.h"
#include <fstream>
#include <iostream>
#include <sstream> 

using namespace std;

fileFunctions::fileFunctions() {
    cout << "Object created\n";
}

string fileFunctions::getFileContent(const string& fileName) {
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

unordered_map<string, int> fileFunctions::getFrequencies(const string& text) {
    stringstream ss(text);
    unordered_map<string, int> frequencies;

    string word;
    while (ss >> word) {
        frequencies[word]++;
    }

    return frequencies;
}