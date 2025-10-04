#ifndef FILEFUNCTIONS_H
#define FILEFUNCTIONS_H

#include <string>
#include <unordered_map>

class fileFunctions {
public:
    fileFunctions(); 
    std::string getFileContent(const std::string& fileName); 
    std::unordered_map<std::string, int> getFrequencies(const std::string& text);
};

#endif