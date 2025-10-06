import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { About } from './pages/About'
import { Dashboard } from './pages/Dashboard'
import { Home } from './pages/Home'
import { SearchResultsPage } from './pages/SearchResultsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
