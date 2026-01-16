import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import SellerDashboard from './SellerDashboard'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard'

const Dashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const userData = await authAPI.getMe(token)
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user:', error)
        localStorage.removeItem('token')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if user is admin (you can adjust this logic based on your user model)
  const isAdmin = user.is_admin || user.is_staff || user.is_superuser

  // Render appropriate dashboard
  if (isAdmin) {
    return <AdminDashboard />
  }

  if (user.is_seller) {
    return <SellerDashboard />
  }

  return <UserDashboard />
}

export default Dashboard
