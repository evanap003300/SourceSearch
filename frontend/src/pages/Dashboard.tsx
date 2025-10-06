import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

export const Dashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="dashboard-container">
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
