import { useNavigate } from 'react-router-dom'
import Aurora from '../components/Aurora'
import './Dashboard.css'

export const Dashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="dashboard-container">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>  
        <Aurora
          colorStops={["#7cff67", "#b19eef", "#5227ff"]}
          blend={0.8}
          amplitude={0.8}
          speed={1}
        />
      </div>
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to your dashboard</p>

        <button
          onClick={() => navigate('/')}
          className="back-button"
        >
          Back to Search
        </button>
      </div>
    </div>
  )
}
