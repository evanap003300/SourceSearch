import { useState } from 'react'
import './App.css'
import Beams from './components/Beams'
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
    <div className="app" style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      <div className="content" style={{ position: 'relative', zIndex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />
        <SearchResults searchResults={searchResults} error={error} />
      </div>
    </div>
  )
}

export default App
