import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchResults } from '../components/SearchResults'
import './SearchResultsPage.css'

interface SearchResult {
  query: string
  results: string[]
  count: number
  search_time?: number
}

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(query)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState<number>(0)

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setError(null)
    const startTime = performance.now()

    try {
      const response = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(searchTerm)}`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data: SearchResult = await response.json()
      const endTime = performance.now()
      const timeTaken = (endTime - startTime) / 1000 // Convert to seconds

      setSearchTime(data.search_time || timeTaken)
      setSearchResults(data)
    } catch (err) {
      setError('Failed to fetch search results. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <div className="search-results-page">
      <header className="search-header">
        <div className="search-header-content">
          <div className="logo-section" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <h1 className="logo-text">SourceSearch</h1>
          </div>

          <form onSubmit={handleSearch} className="header-search-form">
            <div className="header-search-wrapper">
              <svg
                className="header-search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search millions of open-source Python files..."
                className="header-search-input"
                disabled={loading}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="header-clear-button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              <button type="submit" className="header-search-button" disabled={loading || !searchQuery.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </form>

          <div className="header-buttons">
            <button
              type="button"
              className="header-about-button"
              onClick={() => navigate('/about')}
            >
              About
            </button>
            <button
              type="button"
              className="header-dashboard-button"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="search-results-main">
        <div className="results-wrapper">
          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Searching...</p>
            </div>
          ) : (
            <SearchResults searchResults={searchResults} error={error} searchTime={searchTime} />
          )}
        </div>
      </main>
    </div>
  )
}
