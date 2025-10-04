#include "fileFunctions.h"
#include <string> 
#include <iostream>

using namespace std;

int main() {
    fileFunctions ff;
    
    cout << "\n=== Test 1: Reading a file ===\n";
    string content = ff.getFileContent("../../backend/crawler/python_code/3b1b_manim___main__.py");
    
    if (content.empty()) {
        cout << "File is empty or couldn't be read.\n";
    } else {
        cout << "File content:\n" << content << "\n";
    }
    
    cout << "\n=== Test 2: Getting word frequencies ===\n";
    unordered_map<string, int> frequencies = ff.getFrequencies(content);
    
    cout << "Word frequencies:\n";
    for (const auto& pair : frequencies) {
        cout << pair.first << ": " << pair.second << "\n";
    }
    
    cout << "\n=== Test 3: Testing with sample text ===\n";
    string sampleText = "hello world hello C++ world";
    unordered_map<string, int> sampleFreq = ff.getFrequencies(sampleText);
    
    cout << "Sample text frequencies:\n";
    for (const auto& pair : sampleFreq) {
        cout << pair.first << ": " << pair.second << "\n";
    }
    
    return 0;
}