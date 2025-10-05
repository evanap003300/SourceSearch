from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import subprocess
import json
import os

app = FastAPI(title="Search Engine API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the C++ search executable
CPP_EXECUTABLE = os.path.join(
    os.path.dirname(__file__),
    "../../search-engine/build/search_engine"
)

# Default directory to search
DEFAULT_SEARCH_DIR = os.path.join(
    os.path.dirname(__file__),
    "../crawler/python_code"
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Search Engine API", "status": "running"}

@app.get("/search", response_model=dict)
async def search(q: str = Query(..., description="Search query term")):
    """
    Search endpoint that executes the C++ search engine

    Args:
        q: The search query term

    Returns:
        Dictionary with search results containing:
        - query: The search term
        - results: List of file paths matching the query
    """
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter 'q' cannot be empty")

    # Check if C++ executable exists
    if not os.path.exists(CPP_EXECUTABLE):
        raise HTTPException(
            status_code=500,
            detail=f"Search engine executable not found. Please build the C++ code first."
        )

    try:
        # Execute the C++ search program with the directory and query as arguments
        # Use absolute paths to avoid any ambiguity
        abs_search_dir = os.path.abspath(DEFAULT_SEARCH_DIR)
        abs_executable = os.path.abspath(CPP_EXECUTABLE)

        result = subprocess.run(
            [abs_executable, abs_search_dir, q],
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Search execution failed: {result.stderr}"
            )

        # Parse the JSON output from C++ program
        try:
            search_results = json.loads(result.stdout)
        except json.JSONDecodeError:
            # Fallback if C++ doesn't output JSON yet
            # Parse the plain text output
            lines = result.stdout.strip().split('\n')
            file_paths = [line.strip().lstrip('- ') for line in lines if line.strip() and line.strip().startswith('-')]
            search_results = {
                "query": q,
                "results": file_paths,
                "count": len(file_paths)
            }

        return search_results

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Search request timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    cpp_exists = os.path.exists(CPP_EXECUTABLE)
    return {
        "status": "healthy" if cpp_exists else "degraded",
        "cpp_executable_found": cpp_exists,
        "cpp_executable_path": CPP_EXECUTABLE
    }
