import { useState } from 'react'
import './App.css'

interface SearchResult {
  query: string
  results: string[]
  count: number
}

function App() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data: SearchResult = await response.json()
      setSearchResults(data)
    } catch (err) {
      setError('Failed to fetch search results. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="search-container">
        <h1>Search Engine</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query..."
            className="search-input"
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {searchResults && (
          <div className="results-container">
            <h2>Results for "{searchResults.query}" ({searchResults.count} found)</h2>
            <div className="results-list">
              {searchResults.results.slice(0, 10).map((result, index) => (
                <div key={index} className="result-item">
                  <span className="result-number">{index + 1}.</span>
                  <span className="result-path">{result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
