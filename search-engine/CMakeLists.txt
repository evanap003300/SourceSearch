cmake_minimum_required(VERSION 3.10)
project(SearchEngine)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add source files
add_executable(search_engine
    src/main.cpp
    src/indexer.cpp
    src/searcher.cpp
    src/server.cpp
)

# Include directories
target_include_directories(search_engine PRIVATE src)

# Link threading library
target_link_libraries(search_engine PRIVATE pthread)
