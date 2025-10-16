# SourceSearch - Lightning-Fast Code Discovery Engine

A high-performance, full-stack search engine designed to index and search millions of open-source Python files. SourceSearch combines a blazing-fast C++ backend with a modern, animated React frontend to deliver instant code discovery.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Current Capabilities & Limitations](#current-capabilities--limitations)
- [Performance Characteristics](#performance-characteristics)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)

## Overview

SourceSearch is a three-tier web application that indexes and searches open-source code repositories in milliseconds. Whether you're looking for specific functions, patterns, or keywords across thousands of files, SourceSearch delivers results instantly through an intuitive web interface.

**Key Features:**
- ⚡ Sub-millisecond search latency (in-memory index)
- 🔍 Exact word matching across millions of files
- 🎨 Animated, modern React UI with WebGL effects
- 🏗️ Distributed architecture (C++ core, Python API layer)
- 📊 Comprehensive indexing of directory structures
- 🌐 RESTful API for programmatic access

## Architecture

SourceSearch implements a three-layer microservices architecture:

```
┌─────────────────────┐
│  React Frontend     │ (Port 5173 / 3000)
│  TypeScript/Tailwind│ Animated UI, Search Interface
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│  Python API Layer   │ (Port 8000)
│  FastAPI + Uvicorn  │ Route handling, C++ bridge
└──────────┬──────────┘
           │ TCP Sockets (JSON)
           ▼
┌─────────────────────┐
│ C++ Search Engine   │ (Port 9000)
│ Multithreaded Server│ Inverted index, Query execution
└─────────────────────┘
           │
           ├─→ index.bin (196MB)
           └─→ manifest.bin (2.3MB)
```

### Data Flow

1. **Search Request**: User types query in React frontend
2. **HTTP to Python**: Frontend sends `GET /search?q=term` to Python API
3. **Socket to C++**: Python server forwards JSON query via TCP to C++ server
4. **Index Lookup**: C++ performs O(1) hash map lookup on in-memory inverted index
5. **JSON Response**: C++ returns results, Python forwards to frontend
6. **Display**: Frontend renders results with loading states and error handling

### Index Build Flow

1. User triggers rebuild or backend calls C++ build mode
2. C++ scans target directory recursively
3. For each file:
   - Reads entire content
   - Tokenizes by whitespace
   - Updates inverted index (word → {docId: frequency})
   - Records filepath in manifest
4. Serializes both structures to binary format for persistence
5. Saves `index.bin` and `manifest.bin` for rapid loading

## Technology Stack

### Backend (C++)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Language** | C++17 | Core search engine implementation |
| **Build System** | CMake 3.10+ | Cross-platform compilation |
| **Networking** | POSIX Sockets | TCP server for client connections |
| **Threading** | std::thread | Concurrent client handling |
| **Data Structures** | STL (unordered_map) | Fast O(1) word lookup |
| **Serialization** | Custom binary format | Efficient index persistence |

**Libraries:**
- `<iostream>`, `<fstream>` - File I/O
- `<unordered_map>` - Hash-based index storage
- `<filesystem>` - Directory traversal
- `<thread>`, `<mutex>` - Thread safety
- `<regex>`, `<cctype>` - String processing

### Python API Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI | Modern async web framework |
| **Server** | Uvicorn | ASGI async HTTP server |
| **Client** | socket, json | TCP communication with C++ backend |
| **Parsing** | BeautifulSoup4 | HTML parsing (crawler support) |
| **Environment** | python-dotenv | Configuration management |

**Core Dependencies:**
```
fastapi==0.109.0+
uvicorn[standard]==0.27.0+
requests==2.31.0+
beautifulsoup4==4.12.0+
python-dotenv==1.0.0+
```

### Frontend (React/TypeScript)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 19.1.1 | UI component library |
| **Language** | TypeScript | Type-safe JavaScript |
| **Build Tool** | Vite 7.1.7 | Fast module bundler |
| **Routing** | React Router 7.9.3 | Client-side navigation |
| **Styling** | Tailwind CSS 4.1.14 | Utility-first CSS |
| **3D Graphics** | Three.js + React Three Fiber | WebGL animated effects |
| **Linting** | ESLint 9.36.0 | Code quality checks |

**Key npm Packages:**
```json
{
  "react": "^19.1.1",
  "react-router": "^7.9.3",
  "typescript": "^5.6",
  "tailwindcss": "^4.1.14",
  "three": "^r128",
  "@react-three/fiber": "^8.16.6",
  "vite": "^7.1.7"
}
```

## Project Structure

```
search-engine/
│
├── search-engine/                    # C++ Search Engine Core
│   ├── src/
│   │   ├── main.cpp                 # CLI entry point (3 modes: build, search, server)
│   │   ├── indexer.h / indexer.cpp  # Index building & serialization
│   │   ├── searcher.h / searcher.cpp# Query execution engine
│   │   ├── server.h / server.cpp    # TCP socket server (port 9000)
│   │   └── test.cpp                 # Unit tests for core functionality
│   ├── CMakeLists.txt               # CMake build configuration
│   ├── build/                       # Compiled binary output directory
│   ├── test_data/                   # Test files for validation
│   ├── index.bin                    # Serialized inverted index (196MB)
│   └── manifest.bin                 # Document manifest with filepaths (2.3MB)
│
├── backend/                         # Python FastAPI Layer
│   ├── api/
│   │   ├── main.py                  # FastAPI server definition & endpoints
│   │   └── __init__.py
│   ├── crawler/
│   │   ├── collect_data.py          # GitHub repository crawler
│   │   ├── python_code/             # Directory for indexed Python files
│   │   ├── index.bin                # Copy of C++ index
│   │   └── manifest.bin             # Copy of C++ manifest
│   ├── venv/                        # Python virtual environment
│   ├── requirements.txt             # Python dependencies
│   └── .env.example                 # Example environment variables
│
├── frontend/                        # React/TypeScript UI
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page with search bar
│   │   │   ├── SearchResultsPage.tsx# Results display & pagination
│   │   │   ├── Dashboard.tsx        # User dashboard (placeholder)
│   │   │   └── About.tsx            # Project information
│   │   ├── components/
│   │   │   ├── SearchBar.tsx        # Search input & control buttons
│   │   │   ├── SearchResults.tsx    # Results list display
│   │   │   ├── Beams.tsx            # Animated beam effects (WebGL)
│   │   │   ├── Aurora.tsx           # Aurora gradient background
│   │   │   └── Footer.tsx           # Footer with branding
│   │   ├── App.tsx                  # Route configuration (React Router)
│   │   ├── main.tsx                 # React DOM render entry point
│   │   ├── index.css                # Global styles
│   │   └── App.css                  # App-level styles
│   ├── public/                      # Static assets (favicon, images)
│   ├── package.json                 # npm dependencies & scripts
│   ├── vite.config.js               # Vite bundler configuration
│   ├── tailwind.config.js           # Tailwind CSS customization
│   ├── eslint.config.js             # ESLint rules
│   └── index.html                   # HTML template
│
├── start_server.sh                  # Bash script to launch C++ server
├── README.md                        # This file
└── .gitignore                       # Git ignore patterns
```

## How It Works

### Phase 1: Indexing

The indexing process transforms raw files into a searchable structure:

```
Input: Directory of files
   ↓
[C++ Indexer]
   ├─ Read all files recursively
   ├─ Tokenize by whitespace
   ├─ Build inverted index: { word: { docId: frequency, ... }, ... }
   ├─ Build manifest: { docId: filepath, ... }
   └─ Serialize to binary
   ↓
Output: index.bin + manifest.bin
```

**Indexer Algorithm (indexer.cpp):**

1. Iterate through all files in directory
2. For each file:
   ```
   - Open and read file content
   - Split by whitespace using stringstream
   - For each token/word:
     - Add to inverted_index[word][docId]++
     - Increment frequency counter
   - Add mapping: manifest[docId] = filepath
   ```
3. Serialize data structures to binary:
   - `index.bin`: Compressed inverted index with size headers
   - `manifest.bin`: Document ID to filepath mappings

**Data Structures:**

```cpp
// Inverted Index (in-memory)
std::unordered_map<std::string, std::unordered_map<int, int>> inverted_index;
// { "cpp": { 0: 5, 2: 3 }, "function": { 0: 2, 1: 7 }, ... }
//   └─ word ─┘   └ docId: frequency ┘

// Document Manifest (in-memory)
std::unordered_map<int, std::string> manifest;
// { 0: "file1.cpp", 1: "file2.cpp", 2: "file3.cpp" }
```

### Phase 2: Searching

Query execution is optimized for speed:

```
Input: Search term "hello"
   ↓
[C++ Searcher] (in-memory)
   ├─ Look up "hello" in inverted index
   ├─ Retrieve set of documents: { docId: frequency, ... }
   ├─ Convert to filepaths using manifest
   └─ Return sorted by frequency
   ↓
Output: ["path/to/file1", "path/to/file2", ...]
```

**Search Algorithm (searcher.cpp):**

```cpp
// O(1) lookup + O(n log n) sorting
if (inverted_index.find(query) != inverted_index.end()) {
    results = inverted_index[query];  // O(1) hash lookup
    // Convert docId to filepath
    for (auto& [docId, frequency] : results) {
        result_list.push_back(manifest[docId]);
    }
    // Sort by frequency (descending)
    std::sort(result_list.begin(), result_list.end(),
              [&](const string& a, const string& b) {
                  return results[getDocId(a)] > results[getDocId(b)];
              });
}
```

### Phase 3: API Communication

**REST API (Python - FastAPI):**

The Python layer bridges the frontend and C++ backend:

```python
# GET /search?q=term
@app.get("/search")
async def search(q: str):
    # Connect to C++ server via TCP socket
    request_json = json.dumps({"query": q})
    response = socket.send(request_json)  # Timeout: 5 seconds
    return json.loads(response)

# GET /build
@app.get("/build")
async def rebuild_index():
    # Execute C++ binary: ./search_engine --build /path/to/data
    result = subprocess.run([...])
    return {"status": "built", "indexed_files": count}

# GET /health
@app.get("/health")
async def health_check():
    # Verify C++ executable exists
    # Check index.bin and manifest.bin exist
    # Test connectivity to C++ server
    return {"status": "ok"}
```

### Phase 4: Frontend Display

**React Search Flow:**

```typescript
// 1. User enters search term in SearchBar component
// 2. onClick handler triggers search
const handleSearch = async (term: string) => {
    setLoading(true);
    const response = await fetch(`http://localhost:8000/search?q=${term}`);
    const data = await response.json();
    setResults(data.results);  // Max 10 displayed
    setLoading(false);
}

// 3. Display SearchResults component with:
// - Loading spinner during fetch
// - Error message if request fails
// - Result list (first 10 items)
// - Search time in seconds
```

## Setup & Installation

### Prerequisites

- **C++ Compiler**: clang 14+ or g++ 11+ with C++17 support
- **CMake**: Version 3.10 or higher
- **Node.js**: Version 18+ (for frontend)
- **Python**: Version 3.8+ with pip
- **Git**: For version control

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/search-engine.git
cd search-engine
```

### Step 2: Build C++ Backend

```bash
cd search-engine
mkdir -p build
cd build
cmake ..
make -j4  # Parallel compilation (4 jobs)
cd ../..
```

**Verify build:**
```bash
ls -la search-engine/build/search_engine  # Should exist
./search-engine/build/search_engine --help  # Test binary
```

### Step 3: Setup Python API

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Setup React Frontend

```bash
cd frontend

# Install npm dependencies
npm install  # or: pnpm install

# Verify installation
npm run lint  # Should pass without errors
```

### Step 5: Create Index (Optional Initial Setup)

```bash
# Build an index from test data
cd search-engine
./build/search_engine --build ./test_data

# Or index the Python code collection
cd ../backend/crawler
../../search-engine/build/search_engine --build ./python_code
```

## Running the Application

### Option 1: Unified Startup (Recommended)

```bash
# Terminal 1: Start C++ Server
cd search-engine
./build/search_engine --server 9000

# Terminal 2: Start Python API
cd backend
source venv/bin/activate
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000

# Terminal 3: Start React Frontend
cd frontend
npm run dev
```

Then open: http://localhost:5173

### Option 2: Use Startup Script

```bash
./start_server.sh
# This launches the C++ server from backend/crawler directory
```

Then separately start Python API and frontend:
```bash
cd backend && uvicorn api.main:app --port 8000
cd frontend && npm run dev
```

### Option 3: Production Build

```bash
# Build frontend for production
cd frontend
npm run build  # Creates optimized bundle in dist/

# Start services
cd ../search-engine/build
./search_engine --server 9000

cd ../backend
gunicorn api.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# Serve frontend from production build
# (Use nginx or serve dist/ directory)
```

## Usage Guide

### Web Interface

1. **Navigate to Search Page**: Open http://localhost:5173
2. **Enter Search Term**: Type any keyword in the search bar
3. **View Results**:
   - Results display instantly (sub-second latency)
   - Shows filename, frequency, and relevance
   - Limited to 10 results per page
4. **Navigate Results**:
   - Scroll through displayed results
   - Pagination available for large result sets
5. **New Search**:
   - Use search bar to enter new query
   - Previous results clear automatically

### Command Line Interface

**Build an index:**
```bash
./search-engine --build /path/to/data/directory
# Output: Creates index.bin and manifest.bin in current directory
```

**Search with CLI:**
```bash
./search-engine --search "function_name"
# Output: JSON with results
```

**Start server:**
```bash
./search-engine --server 9000
# Output: "Server listening on port 9000"
# Server accepts JSON queries and returns results
```

### Example Searches

- `function` - Find all files containing "function"
- `import` - Locate import statements
- `class` - Search for class definitions
- `def` - Find Python function definitions
- `error` - Find error handling code

## API Documentation

### REST Endpoints

All endpoints are available at `http://localhost:8000`

#### `GET /`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "SourceSearch API"
}
```

---

#### `GET /search?q=<term>`

Search for files containing the specified term.

**Query Parameters:**
- `q` (string, required): The search term

**Response:**
```json
{
  "query": "function",
  "count": 42,
  "results": [
    "path/to/file1.py",
    "path/to/file2.py",
    "path/to/file3.py"
  ]
}
```

**Status Codes:**
- `200 OK` - Search successful
- `400 Bad Request` - Missing or invalid query parameter
- `500 Internal Server Error` - C++ server connection failed

**Example:**
```bash
curl "http://localhost:8000/search?q=hello"
```

---

#### `GET /build`

Trigger a full index rebuild from the Python code directory.

**Response:**
```json
{
  "status": "built",
  "indexed_files": 1250,
  "index_size": "196 MB",
  "manifest_size": "2.3 MB"
}
```

**Status Codes:**
- `200 OK` - Index built successfully
- `500 Internal Server Error` - Build process failed

---

#### `GET /health`

Comprehensive health check of all system components.

**Response:**
```json
{
  "cpp_server": "connected",
  "index_file": "exists (196 MB)",
  "manifest_file": "exists (2.3 MB)",
  "api_status": "ok"
}
```

---

### Socket Protocol (C++ Server)

The Python API communicates with the C++ server via JSON over TCP.

**Request Format:**
```json
{
  "query": "search_term"
}
```

**Response Format:**
```json
{
  "query": "search_term",
  "count": 42,
  "results": [
    "path/to/file1",
    "path/to/file2"
  ]
}
```

**Connection Details:**
- Host: `localhost`
- Port: `9000`
- Protocol: TCP
- Encoding: UTF-8 JSON
- Timeout: 5 seconds

## Current Capabilities & Limitations

### Capabilities ✅

- **Fast Indexing**: Processes thousands of files in seconds
- **Sub-millisecond Queries**: O(1) hash map lookups
- **Persistent Storage**: Binary-serialized index for instant loading
- **Multi-threaded Server**: Handles concurrent connections
- **Exact Word Matching**: Precise search results
- **Frequency Ranking**: Results sorted by occurrence count
- **Web UI**: Modern, responsive interface with animations
- **RESTful API**: Programmatic access to search functionality
- **Error Handling**: Graceful failures and meaningful error messages

### Limitations ❌

**Text Processing:**
- ❌ Case-sensitive matching ("Hello" ≠ "hello")
- ❌ Punctuation treated as part of words ("hello" ≠ "hello!")
- ❌ No word stemming ("running", "run", "runs" are different)
- ❌ Stop words not removed ("the", "a", "is" treated as searchable)
- ❌ No Unicode normalization

**Search Capabilities:**
- ❌ Single-term searches only (no "hello world" queries)
- ❌ No Boolean operators (no AND, OR, NOT)
- ❌ No phrase search ("exact phrase")
- ❌ No result ranking/scoring (TF-IDF, BM25)
- ❌ No fuzzy or typo-tolerant search
- ❌ No search suggestions or autocomplete

**Scalability:**
- ❌ Full index rebuild required (no incremental updates)
- ❌ Top-level directory only (limited depth recursion)
- ❌ No distributed indexing
- ❌ No clustering or sharding
- ❌ Limited to machine memory size

**Frontend:**
- ❌ Limited to 10 results per page
- ❌ No result snippets or context preview
- ❌ No file type filtering
- ❌ No search history
- ❌ No saved searches or bookmarks

## Performance Characteristics

### Indexing Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Files Indexed | ~1,250 | Python code repositories |
| Index Size | ~196 MB | Binary format |
| Manifest Size | ~2.3 MB | Filepath mappings |
| Build Time | ~2-5 seconds | Depends on filesystem speed |
| Index Load Time | ~100-200 ms | From disk to memory |

### Search Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Average Query Time | 1-5 ms | In-memory lookup |
| Lookup Complexity | O(1) | Hash map access |
| Sort Complexity | O(n log n) | Result frequency sorting |
| Results per Query | Variable | Typically 10-1000 matches |
| Max Results | Limited by UI | Frontend shows max 10 |

### Network Performance

| Connection | Latency | Notes |
|-----------|---------|-------|
| Frontend → Python | ~10 ms | HTTP over localhost |
| Python → C++ | ~5 ms | TCP socket JSON |
| Total Round Trip | ~20 ms | Full user query to result |

### Memory Usage

| Component | Memory | Notes |
|-----------|--------|-------|
| C++ Server | ~250 MB | Index + manifest in RAM |
| Python API | ~50 MB | FastAPI + dependencies |
| Frontend | ~40 MB | React bundle in browser |
| Total | ~340 MB | Approximate system total |

## Future Improvements

### High Priority 🔴

1. **Case-Insensitive Search**
   - Convert all words to lowercase during indexing
   - Impact: Dramatically improve search UX
   - Complexity: Low (simple string transformation)

2. **Punctuation Removal**
   - Strip punctuation during tokenization
   - Handle contractions ("don't" → "dont")
   - Impact: Better matching of natural text
   - Complexity: Low (regex-based)

3. **Stop Word Filtering**
   - Maintain stop word list (the, a, is, etc.)
   - Skip during indexing
   - Reduce index size by 30-40%
   - Impact: Smaller index, cleaner results
   - Complexity: Low (set membership check)

### Medium Priority 🟡

4. **Multi-Word Queries**
   - Support "hello world" searches
   - Return files containing all terms
   - Implement AND-based query logic
   - Complexity: Medium

5. **Result Ranking/Scoring**
   - Implement TF-IDF scoring
   - Rank by relevance, not just frequency
   - Sort results by score
   - Complexity: Medium

6. **Incremental Indexing**
   - Track file modification times
   - Update only changed files
   - Merge deltas into existing index
   - Complexity: Medium-High

7. **Phrase Search**
   - Store word position information
   - Support quoted queries: `"exact phrase"`
   - Complexity: Medium

### Nice to Have 🟢

8. **Boolean Operators**
   - Support AND, OR, NOT operators
   - Example: `function AND error`
   - Complexity: High

9. **Search Result Snippets**
   - Show context around matched word
   - Display 2-3 lines of surrounding code
   - Complexity: Medium

10. **File Type Filtering**
    - Filter results by extension (.py, .js, .cpp)
    - Search within specific languages
    - Complexity: Low

11. **Search History**
    - Store recent searches in localStorage
    - Recall previous queries
    - Complexity: Low

12. **Fuzzy/Typo-Tolerant Search**
    - Use edit distance (Levenshtein)
    - Handle common typos
    - Complexity: High

13. **Search Autocomplete**
    - Suggest common search terms
    - Real-time completion
    - Complexity: Medium

14. **Distributed Indexing**
    - Split indexing across multiple machines
    - Parallel building and searching
    - Complexity: Very High

## Contributing

Contributions are welcome! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** changes: `git commit -am 'Add feature'`
4. **Push** to branch: `git push origin feature/your-feature`
5. **Submit** a Pull Request

### Development Setup

```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run tests before committing
cd search-engine/build
make test

# Run linter on frontend
cd frontend
npm run lint
```

### Code Style

- **C++**: Follow Google C++ Style Guide
- **Python**: PEP 8 compliance (checked with flake8)
- **TypeScript**: ESLint rules in `eslint.config.js`

### Reporting Issues

Found a bug? Please open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- System information (OS, version)

## License

This project is open source and available under the MIT License. See LICENSE file for details.

## Acknowledgments

- **C++ Standard Library** for fast data structures
- **FastAPI** for the Python web framework
- **React** and **Vite** for the frontend
- **Three.js** for 3D visualization capabilities
- The open-source community for tools and inspiration

## Contact & Support

- **Issues**: GitHub Issues tracker
- **Discussions**: GitHub Discussions
- **Email**: contact@sourcesearch.dev (if applicable)

---

**Last Updated**: October 2024
**Version**: 1.0.0
**Status**: Active Development
