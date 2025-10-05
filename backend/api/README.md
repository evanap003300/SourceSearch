# Search Engine API

FastAPI backend endpoint for the search engine.

## Setup

### 1. Build the C++ Search Engine

First, build the C++ search engine executable:

```bash
cd ../../search-engine
mkdir -p build
cd build
cmake ..
make
```

This will create the `search_engine` executable in `search-engine/build/`.

### 2. Install Python Dependencies

```bash
cd ../../backend
pip install -r requirements.txt
```

### 3. Run the API Server

```bash
cd backend/api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### GET /search

Search for files containing a specific term.

**Parameters:**
- `q` (required): The search query term

**Example:**
```bash
curl "http://localhost:8000/search?q=requests"
```

**Response:**
```json
{
  "query": "requests",
  "count": 5,
  "results": [
    "path/to/file1.py",
    "path/to/file2.py"
  ]
}
```

### GET /health

Check the health status of the API and verify the C++ executable is available.

**Example:**
```bash
curl "http://localhost:8000/health"
```

### GET /

Root endpoint returning API information.

## Development

The API automatically calls the C++ search engine executable and returns results in JSON format.

To test the search directly with the C++ executable:
```bash
cd ../../search-engine/build
./search_engine "your_search_term"
```
