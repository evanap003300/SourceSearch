#include <fstream>
#include <string> 
#include <iostream>

using namespace std;

int main() {
    cout << "hello world";

    ifstream inputFile("hello.txt");

    if (!inputFile.is_open()) {
        cerr << "Error opening the file!" << endl;
        return 1;
    }

    string line;
    
    while (getline(inputFile, line)) {
        cout << "Read line: " << line << std::endl;
    }

    inputFile.close();
    return 0;
}
