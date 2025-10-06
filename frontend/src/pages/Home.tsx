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
      <button
        onClick={() => navigate('/about')}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          zIndex: 10,
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '400',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: 'white',
          borderRadius: '9999px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        About
      </button>
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
