import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

type LocalSettings = {
  marketing_emails: boolean
  order_updates: boolean
}

const SETTINGS_KEY = 'userSettings'

const Settings = () => {
  const navigate = useNavigate()
  const [me, setMe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [settings, setSettings] = useState<LocalSettings>({
    marketing_emails: false,
    order_updates: true,
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

  const onSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="text-sm font-medium text-emerald-700">Settings</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Preferences</h1>
          <p className="text-gray-600 mt-1">Manage notifications and account preferences for {displayName}.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={settings.order_updates}
                onChange={(e) => setSettings((s) => ({ ...s, order_updates: e.target.checked }))}
                className="mt-1 h-4 w-4 accent-emerald-600"
              />
              <div>
                <div className="font-semibold text-gray-900">Order updates</div>
                <div className="text-sm text-gray-600">Get delivery and order status notifications.</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={settings.marketing_emails}
                onChange={(e) => setSettings((s) => ({ ...s, marketing_emails: e.target.checked }))}
                className="mt-1 h-4 w-4 accent-emerald-600"
              />
              <div>
                <div className="font-semibold text-gray-900">Marketing emails</div>
                <div className="text-sm text-gray-600">Receive offers and product updates (optional).</div>
              </div>
            </label>

            <div className="pt-2">
              <button
                onClick={onSave}
                className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
