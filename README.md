This is a basic search engine with three components:

  Backend (C++)

  - Indexer (indexer.cpp): Scans a directory, reads all files, and creates an
  inverted index (word → documents map)
  - Searcher (searcher.cpp): Takes a single search term and returns documents
  containing that word
  - Main (main.cpp): CLI tool that builds the index and outputs JSON results

  Frontend (React/TypeScript)

  - Simple search UI that calls a backend API at localhost:8000
  - Displays up to 10 search results

  How It Works

  1. Reads all files in a directory
  2. Builds an inverted index: { "word": { docId: frequency } }
  3. Searches for exact word matches
  4. Returns list of matching filenames

  ---
  What's Next: Key Improvements

  1. Text Processing & Tokenization

  - Convert to lowercase for case-insensitive search
  - Remove punctuation (currently "hello" ≠ "hello!")
  - Stem words ("running" → "run")
  - Remove stop words ("the", "a", "is")

  2. Better Search

  - Multi-word queries ("hello world")
  - Boolean operators (AND, OR, NOT)
  - Phrase search ("exact phrase")
  - Ranking/scoring (TF-IDF, BM25)

  3. Scalability

  - Persist index to disk (currently rebuilds on each run)
  - Handle large files (stream processing)
  - Support nested directories (currently only top-level)
  - Add incremental indexing (update without full rebuild)

  4. Missing Backend Server

  - Frontend expects REST API at port 8000
  - Need to add HTTP server (Crow, Boost.Beast, or similar)
  - Add /search?q=term endpoint

  5. Error Handling

  - Handle non-text files gracefully
  - Better error messages
  - Input validation

  6. Features

  - Search result snippets (show context)
  - File type filtering
  - Search history
  - Pagination (currently limited to 10 results in frontend)

  The most critical next step is adding the HTTP server to connect your C++ backend
   to the React frontend, followed by improving text normalization (lowercase,
  punctuation) for better search quality.