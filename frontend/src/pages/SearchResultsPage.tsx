import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchResults } from '../components/SearchResults'
import CodeViewer from '../components/CodeViewer'
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

  // CodeViewer state
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false)
  const [selectedFilename, setSelectedFilename] = useState<string>('')
  const [codeContent, setCodeContent] = useState<string>('')
  const [isLoadingCode, setIsLoadingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)

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

  const handleResultClick = async (filename: string) => {
    console.log('SearchResultsPage: handleResultClick called with filename:', filename)
    setSelectedFilename(filename)
    setIsCodeViewerOpen(true)
    setIsLoadingCode(true)
    setCodeError(null)
    setCodeContent('')

    try {
      const url = `http://localhost:8000/api/v1/code?filename=${encodeURIComponent(filename)}`
      console.log('Fetching from URL:', url)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Received code data:', data)
      setCodeContent(data.content)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load code'
      console.error('Error fetching code:', errorMsg, err)
      setCodeError(errorMsg)
    } finally {
      setIsLoadingCode(false)
    }
  }

  const handleCloseCodeViewer = () => {
    setIsCodeViewerOpen(false)
    setCodeContent('')
    setCodeError(null)
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
            <SearchResults
              searchResults={searchResults}
              error={error}
              searchTime={searchTime}
              onResultClick={handleResultClick}
            />
          )}
        </div>
      </main>

      {/* Code Viewer Modal */}
      <CodeViewer
        isOpen={isCodeViewerOpen}
        onClose={handleCloseCodeViewer}
        filename={selectedFilename}
        content={codeContent}
        isLoading={isLoadingCode}
        error={codeError}
      />
    </div>
  )
}
