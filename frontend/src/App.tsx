import { useState } from 'react'
import './App.css'
import { SearchBar } from './components/SearchBar'
import { SearchResults } from './components/SearchResults'

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
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />
      <SearchResults searchResults={searchResults} error={error} />
    </div>
  )
}

export default App
