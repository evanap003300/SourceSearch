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
}

export const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, error }) => {
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
        <div className="empty-state">
          <svg
            className="empty-icon"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <h3 className="empty-title">No Results Found</h3>
          <p className="empty-message">
            No files found containing "<span className="query-highlight">{searchResults.query}</span>"
          </p>
          <p className="empty-suggestion">Try a different search term or check your indexed directory.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">
          Search Results for "<span className="query-highlight">{searchResults.query}</span>"
        </h2>
        <div className="results-count">
          <span className="count-number">{searchResults.count}</span>
          <span className="count-label">{searchResults.count === 1 ? 'file' : 'files'} found</span>
        </div>
      </div>

      <div className="results-list">
        {searchResults.results.slice(0, 10).map((result, index) => (
          <div key={index} className="result-item">
            <div className="result-number">{index + 1}</div>
            <div className="result-content">
              <div className="result-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              </div>
              <div className="result-details">
                <div className="result-filename">{result}</div>
              </div>
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
