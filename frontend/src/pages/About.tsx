import { useNavigate } from 'react-router-dom'
import './About.css'

export const About = () => {
  const navigate = useNavigate()

  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About SourceSearch</h1>
        <p className="about-description">
          A modern, blazing-fast code search engine designed to help developers find what they need, when they need it.
        </p>
        <p className="about-description">
          Built with cutting-edge technology to provide lightning-fast search results across your entire codebase.
        </p>

        <button
          onClick={() => navigate('/')}
          className="about-back-button"
        >
          Back to Search
        </button>
      </div>
    </div>
  )
}
