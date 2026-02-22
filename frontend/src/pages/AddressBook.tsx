import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

type AddressItem = {
  id: string
  name: string
  phone: string
  address: string
}

const STORAGE_KEY = 'addressBook'

const AddressBook = () => {
  const navigate = useNavigate()
  const [me, setMe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [items, setItems] = useState<AddressItem[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

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

        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          setItems(Array.isArray(parsed) ? parsed : [])
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

  const persist = (next: AddressItem[]) => {
    setItems(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const onAdd = () => {
    setError('')
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill all fields.')
      return
    }

    const next: AddressItem[] = [
      {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      },
      ...items,
    ]

    persist(next)
    setName('')
    setPhone('')
    setAddress('')
  }

  const onRemove = (id: string) => {
    persist(items.filter((x) => x.id !== id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading address book...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6">
      <div className="max-w-2xl lg:max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sm:p-6 mb-4">
          <div className="text-xs font-medium text-emerald-700">Address Book</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">Saved Addresses</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage delivery addresses for {displayName}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="text-sm font-semibold text-gray-900 mb-3">Add New Address</div>
            {error && <div className="mb-3 text-sm text-red-600 font-medium">{error}</div>}
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Recipient Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full Delivery Address"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <button
                onClick={onAdd}
                className="w-full px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Save Address
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-900">Your Addresses</div>
              <div className="text-xs text-gray-500 mt-0.5">Stored locally for now.</div>
            </div>

            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-sm text-gray-500">
                No saved addresses yet.
              </div>
            ) : (
              items.map((x) => (
                <div key={x.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{x.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{x.phone}</div>
                      <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{x.address}</div>
                    </div>
                    <button
                      onClick={() => onRemove(x.id)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressBook
