from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import subprocess
import json
import os
import socket
import time

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

# Default directory containing Python code to index
DEFAULT_SOURCE_DIR = os.path.join(
    os.path.dirname(__file__),
    "../crawler/python_code"
)

# Directory where binary index files are stored
INDEX_DIR = os.path.join(
    os.path.dirname(__file__),
    "../crawler"
)

# Binary index file paths
INDEX_FILE = os.path.join(INDEX_DIR, "index.bin")
MANIFEST_FILE = os.path.join(INDEX_DIR, "manifest.bin")

# C++ Server configuration
CPP_SERVER_HOST = "127.0.0.1"
CPP_SERVER_PORT = 9000
CPP_SERVER_TIMEOUT = 5  # seconds

def query_cpp_server(query: str) -> dict:
    """
    Send a search query to the C++ server via socket connection.

    Args:
        query: The search query term

    Returns:
        Dictionary with search results

    Raises:
        HTTPException: If connection fails or server is unavailable
    """
    try:
        # Create socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(CPP_SERVER_TIMEOUT)

        # Connect to C++ server
        sock.connect((CPP_SERVER_HOST, CPP_SERVER_PORT))

        # Prepare JSON request
        request = json.dumps({"query": query})

        # Send request to server
        sock.sendall(request.encode() + b'\n')

        # Receive response
        response = b''
        while True:
            try:
                chunk = sock.recv(4096)
                if not chunk:
                    break
                response += chunk
            except socket.timeout:
                break

        sock.close()

        # Parse response
        if not response:
            raise HTTPException(
                status_code=500,
                detail="C++ server returned empty response"
            )

        # Decode and parse JSON
        response_str = response.decode('utf-8').strip()
        search_results = json.loads(response_str)

        return search_results

    except socket.timeout:
        raise HTTPException(
            status_code=504,
            detail="C++ server connection timed out"
        )
    except ConnectionRefusedError:
        raise HTTPException(
            status_code=503,
            detail="C++ server is not running. Start it with: ./search-engine/build/search_engine --server"
        )
    except socket.error as e:
        raise HTTPException(
            status_code=500,
            detail=f"Connection error with C++ server: {str(e)}"
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON response from C++ server: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Search Engine API", "status": "running"}

@app.get("/search", response_model=dict)
async def search(q: str = Query(..., description="Search query term")):
    """
    Search endpoint that connects to the C++ server

    Connects to the persistent C++ server running on localhost:9000 for fast searching.
    The server loads the index once and keeps it in memory for instant lookups.

    Args:
        q: The search query term

    Returns:
        Dictionary with search results containing:
        - query: The search term
        - results: List of file paths matching the query
        - count: Number of results
    """
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter 'q' cannot be empty")

    # Query the C++ server
    search_results = query_cpp_server(q)

    return search_results

@app.get("/build", response_model=dict)
async def build_index():
    """
    Build endpoint that creates the binary index files from source directory

    Scans DEFAULT_SOURCE_DIR for Python files and builds binary index files
    (index.bin and manifest.bin) for fast searching.

    Returns:
        Dictionary with build status containing:
        - status: "success" or "failed"
        - message: Description of the build result
        - index_file: Path to created index.bin
        - manifest_file: Path to created manifest.bin
    """
    # Check if C++ executable exists
    if not os.path.exists(CPP_EXECUTABLE):
        raise HTTPException(
            status_code=500,
            detail="Search engine executable not found. Please build the C++ code first."
        )

    # Check if source directory exists
    if not os.path.exists(DEFAULT_SOURCE_DIR):
        raise HTTPException(
            status_code=400,
            detail=f"Source directory not found: {DEFAULT_SOURCE_DIR}"
        )

    try:
        abs_executable = os.path.abspath(CPP_EXECUTABLE)
        abs_source_dir = os.path.abspath(DEFAULT_SOURCE_DIR)

        print(f"Building index from: {abs_source_dir}")
        print(f"Binary files will be saved to: {INDEX_DIR}")

        # Execute the C++ search program in --build mode
        result = subprocess.run(
            [abs_executable, "--build", abs_source_dir],
            capture_output=True,
            text=True,
            timeout=600,  # Build can take longer
            cwd=INDEX_DIR  # Set working directory for binary file output
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Build execution failed: {result.stderr}"
            )

        # Verify files were created
        if not os.path.exists(INDEX_FILE) or not os.path.exists(MANIFEST_FILE):
            raise HTTPException(
                status_code=500,
                detail="Build completed but index files were not created"
            )

        # Get file sizes for info
        index_size = os.path.getsize(INDEX_FILE)
        manifest_size = os.path.getsize(MANIFEST_FILE)

        return {
            "status": "success",
            "message": "Index built successfully",
            "index_file": INDEX_FILE,
            "manifest_file": MANIFEST_FILE,
            "index_size_bytes": index_size,
            "manifest_size_bytes": manifest_size,
            "build_output": result.stdout
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Build request timed out (> 10 minutes)")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint that verifies all components are ready"""
    cpp_exists = os.path.exists(CPP_EXECUTABLE)
    index_exists = os.path.exists(INDEX_FILE)
    manifest_exists = os.path.exists(MANIFEST_FILE)
    source_exists = os.path.exists(DEFAULT_SOURCE_DIR)

    # Check if C++ server is running
    server_running = False
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((CPP_SERVER_HOST, CPP_SERVER_PORT))
        server_running = result == 0
        sock.close()
    except Exception:
        pass

    all_ready = cpp_exists and index_exists and manifest_exists and server_running

    return {
        "status": "healthy" if all_ready else "degraded",
        "cpp_executable_found": cpp_exists,
        "cpp_executable_path": CPP_EXECUTABLE,
        "index_file_found": index_exists,
        "index_file_path": INDEX_FILE,
        "manifest_file_found": manifest_exists,
        "manifest_file_path": MANIFEST_FILE,
        "source_directory_found": source_exists,
        "source_directory_path": DEFAULT_SOURCE_DIR,
        "cpp_server_running": server_running,
        "cpp_server_address": f"{CPP_SERVER_HOST}:{CPP_SERVER_PORT}",
        "ready_for_search": all_ready,
        "notes": "To start the server, run: ./search-engine/build/search_engine --server" if not server_running else ""
    }
