import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { User, Lock, CreditCard, Save, Eye, EyeOff } from 'lucide-react'

type LocalSettings = {
  marketing_emails: boolean
  order_updates: boolean
}

const SETTINGS_KEY = 'userSettings'

const Settings = () => {
  const navigate = useNavigate()
  const [me, setMe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'payout'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const [settings, setSettings] = useState<LocalSettings>({
    marketing_emails: false,
    order_updates: true,
  })

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [payoutData, setPayoutData] = useState({
    bank_name: '',
    account_holder: '',
    account_number: '',
    routing_number: '',
    mobile_banking: '',
  })

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      setIsLoading(true)
      try {
        const data = await authAPI.getMe(token)
        setMe(data)
        
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
        })

        const raw = localStorage.getItem(SETTINGS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          setSettings({
            marketing_emails: Boolean(parsed.marketing_emails),
            order_updates: parsed.order_updates === false ? false : true,
          })
        }
      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [navigate])

  const displayName = useMemo(() => {
    if (!me) return ''
    return (me.full_name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username || 'User').trim()
  }, [me])

  const onSaveProfile = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      await authAPI.updateProfile(token, profileData)
      const updated = await authAPI.getMe(token)
      setMe(updated)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  const onChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setIsSaving(true)
    setMessage(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      await authAPI.changePassword(token, passwordData.current_password, passwordData.new_password)
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' })
    } finally {
      setIsSaving(false)
    }
  }

  const onSavePayout = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      await authAPI.updatePayoutInfo(token, payoutData)
      setMessage({ type: 'success', text: 'Payout information saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save payout info' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="text-sm font-medium text-emerald-700">Account Settings</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences for {displayName}.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
              activeTab === 'password'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('payout')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
              activeTab === 'payout'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payout Info
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="+880 1XXX-XXXXXX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={onSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={onChangePassword}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  {isSaving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payout' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payout Information</h2>
            <p className="text-sm text-gray-600 mb-6">Add your bank account or mobile banking details to receive payouts from sales.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={payoutData.bank_name}
                  onChange={(e) => setPayoutData({...payoutData, bank_name: e.target.value})}
                  placeholder="e.g., Dutch Bangla Bank, Brac Bank"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={payoutData.account_holder}
                  onChange={(e) => setPayoutData({...payoutData, account_holder: e.target.value})}
                  placeholder="Full name as per bank account"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={payoutData.account_number}
                    onChange={(e) => setPayoutData({...payoutData, account_number: e.target.value})}
                    placeholder="Bank account number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
                  <input
                    type="text"
                    value={payoutData.routing_number}
                    onChange={(e) => setPayoutData({...payoutData, routing_number: e.target.value})}
                    placeholder="Bank routing number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Mobile Banking (Alternative)</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Banking Number</label>
                  <input
                    type="text"
                    value={payoutData.mobile_banking}
                    onChange={(e) => setPayoutData({...payoutData, mobile_banking: e.target.value})}
                    placeholder="bKash/Nagad/Rocket number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={onSavePayout}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Payout Info'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
