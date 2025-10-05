import React from 'react'
import './SearchBar.css'

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: (e: React.FormEvent) => void
  loading: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  loading
}) => {
  return (
    <div className="search-bar-container">
      <div className="brand">
        <h1 className="brand-name">SourceSearch</h1>
        <p className="brand-tagline">Lightning-fast code discovery</p>
      </div>

      <form onSubmit={onSearch} className="search-form">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            width="20"
            height="20"
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
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search through your codebase..."
            className="search-input"
            disabled={loading}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button type="submit" className="search-button" disabled={loading || !query.trim()}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>
    </div>
  )
}
