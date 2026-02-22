import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react'
import { authAPI } from '../services/api'

const Profile = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  })
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
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Update user profile (you'll need to implement this API endpoint)
      // await authAPI.updateProfile(token, formData)
      
      setUser({ ...user, ...formData })
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6">
      <div className="max-w-2xl lg:max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm truncate">{user.email}</p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.first_name || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.last_name || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+880 1234567890"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.phone || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your full address"
                />
              ) : (
                <div className="flex items-start gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">{user.address || 'Not set'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Total Orders', value: '0' },
            { label: 'Total Spent', value: '৳0' },
            { label: 'Wishlist', value: '0' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-3 sm:p-5 text-center">
              <div className="text-xl sm:text-3xl font-bold text-emerald-600">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile
