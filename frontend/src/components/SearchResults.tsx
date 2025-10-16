import React from 'react'
import './SearchResults.css'

interface SearchResult {
  query: string
  results: string[]
  count: number
}

interface SearchResultsProps {
  searchResults: SearchResult | null
  error: string | null
  searchTime?: number
  onResultClick?: (filename: string) => void
}

export const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, error, searchTime = 0, onResultClick }) => {
  const handleResultClick = (result: string) => {
    console.log('Result clicked:', result);
    if (onResultClick) {
      console.log('Calling onResultClick with filename:', result);
      onResultClick(result);
    }
  };

  if (error) {
    return (
      <div className="results-container">
        <div className="error-card">
          <svg
            className="error-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 className="error-title">Search Error</h3>
          <p className="error-message">{error}</p>
        </div>
      </div>
    )
  }

  if (!searchResults) {
    return null
  }

  if (searchResults.count === 0) {
    return (
      <div className="results-container">
        <div className="empty-state-modal">
          <div className="empty-state-backdrop"></div>
          <div className="empty-state-content">
            <h2 className="empty-title">No Results Found</h2>

            <p className="empty-message">
              We couldn't find any files matching "<span className="query-highlight">{searchResults.query}</span>"
            </p>

            <div className="empty-tips">
              <p className="empty-tips-label">Try these alternatives:</p>
              <ul className="empty-tips-list">
                <li>Check the spelling of your search term</li>
                <li>Use fewer or more general keywords</li>
                <li>Try searching for related terms</li>
                <li>Verify your indexed directory contains files</li>
              </ul>
            </div>

            <button className="empty-action-button" onClick={() => window.location.href = '/'}>
              Start a New Search
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      <div className="results-stats">
        <p className="results-info">Found {searchResults.count} results ({searchTime.toFixed(2)} seconds)</p>
      </div>

      <div className="results-list">
        {searchResults.results.slice(0, 10).map((result, index) => (
          <div key={index} className="result-item" onClick={() => handleResultClick(result)} style={{ cursor: 'pointer' }}>
            <div className="result-content">
              <div className="result-header">
                <div className="result-favicon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div className="result-url">{result}</div>
              </div>
              <h3 className="result-title">{result.split('/').pop() || result}</h3>
              <p className="result-snippet">
                File path: {result}
              </p>
            </div>
          </div>
        ))}
      </div>

      {searchResults.count > 10 && (
        <div className="results-footer">
          <p className="results-note">
            Showing 10 of {searchResults.count} results
          </p>
        </div>
      )}
    </div>
  )
}
