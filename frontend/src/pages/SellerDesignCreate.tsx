import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { designAPI, storeAPI } from '../services/api'
import { ArrowLeft, Package } from 'lucide-react'

const SellerDesignCreate = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const didInitRef = useRef(false)

  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [designData, setDesignData] = useState<any>(null)
  const [mockupType, setMockupType] = useState<any>(null)
  const [variant, setVariant] = useState<any>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sellPrice, setSellPrice] = useState<number>(699)


  useEffect(() => {
    const init = async () => {
      if (didInitRef.current) return
      didInitRef.current = true

      if (!token) {
        navigate('/login')
        return
      }
      setIsLoading(true)
      try {
        const { authAPI } = await import('../services/api')
        const me = await authAPI.getMe(token)
        if (!me.is_seller) {
          navigate('/seller')
          return
        }
        const myStore = await storeAPI.getMyStore(token)
        if (!myStore) {
          navigate('/seller')
          return
        }
        setStore(myStore)

        // Check if we have design data from Design Studio
        const savedDesignData = localStorage.getItem('sellerDesignData')
        if (savedDesignData) {
          try {
            const parsedData = JSON.parse(savedDesignData)
            setDesignData(parsedData.designData)
            setMockupType(parsedData.mockupType)
            setVariant(parsedData.variant)

            const frontText = parsedData.designData?.sides?.front?.text
            const backText = parsedData.designData?.sides?.back?.text
            const defaultName = frontText || backText || `Custom ${parsedData.mockupType?.name || 'Product'}`
            setName(defaultName)
          } catch (e) {
            console.error('Failed to parse saved design data:', e)
          }
        }

        if (!savedDesignData && !designData) {
          navigate('/design-studio')
          return
        }
      } catch {
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [designData, navigate, token])

  const adminBuyPrice = Number(variant?.effective_price || mockupType?.base_price || 0)
  const availableStock = typeof variant?.stock === 'number' ? variant.stock : Number(variant?.stock || 0)
  const profit = sellPrice - adminBuyPrice


  const handlePublish = async () => {
    if (!token || !designData || !mockupType || !variant) return
    
    if (!name.trim()) {
      alert('Product name is required')
      return
    }
    
    setSubmitting(true)
    try {
      await designAPI.createDesignProduct(token, {
        name: name.trim(),
        description: description.trim() || undefined,
        price: sellPrice,
        is_published: true,
        mockup_variant: variant?.id,
        design_data: designData,
      })
      
      navigate('/seller')
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message || 'Failed to publish product')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!store || !designData) {
    return (
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-lg font-semibold text-gray-900">Design data not found</div>
          <div className="text-sm text-gray-600 mt-2">
            Please go back to Design Studio and click <span className="font-semibold">Continue to Sell</span> again.
          </div>
          <button
            onClick={() => navigate('/design-studio')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Design Studio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/design-studio')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Design Studio
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Publish Your Product</h1>
        </div>
        <p className="text-gray-600">
          Set pricing and product information for your custom design
        </p>
      </div>

      {/* Design Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          Design Preview
        </h2>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-sm">
            <div className="font-medium text-gray-900">{mockupType?.name}</div>
            <div className="text-gray-500">{variant?.color_name} • Size: M</div>
            {designData?.sides?.front?.text && (
              <div className="text-emerald-600 mt-1">Text: "{designData.sides.front.text}"</div>
            )}
            {designData?.sides?.front?.hasLogo && (
              <div className="text-emerald-600 mt-1">✓ Custom Logo Added</div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
              placeholder="Product description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buy Price (৳)</label>
              <input
                type="number"
                value={adminBuyPrice}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price (৳)</label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              value={availableStock}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Profit per Unit</div>
            <div className={`text-lg font-bold ${
              profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ৳{profit}
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={submitting || !name.trim()}
            className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {submitting ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SellerDesignCreate
