import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Beams from '../components/Beams'
import { SearchBar } from '../components/SearchBar'

export const Home = () => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    navigate(`/search?q=${encodeURIComponent(query)}`)
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
      </div>
    </div>
  )
}
