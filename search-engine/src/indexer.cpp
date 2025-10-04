#include <fstream>
#include <string> 
#include <iostream>

using namespace std;

int main() {
    ifstream inputFile("../../backend/crawler/python_code/3b1b_manim___main__.py");

    if (!inputFile.is_open()) {
        cerr << "Error opening the file!" << endl;
        return 1;
    }

    string line;
    
    while (getline(inputFile, line)) {
        cout << line << endl;
    }

    inputFile.close();
    return 0;
}
