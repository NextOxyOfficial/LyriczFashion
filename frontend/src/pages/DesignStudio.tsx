import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customProductsAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

const mockupSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="#f3f4f6"/>
  <path d="M320 170 L240 210 L140 320 L210 420 L280 360 L280 780 L620 780 L620 360 L690 420 L760 320 L660 210 L580 170 L520 240 L380 240 Z" fill="#ffffff" stroke="#d1d5db" stroke-width="12" stroke-linejoin="round"/>
  <path d="M380 240 C410 300 490 300 520 240" fill="none" stroke="#e5e7eb" stroke-width="10" stroke-linecap="round"/>
</svg>
`

const mockupUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mockupSvg)}`

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const RETAIL_PRICE = 699

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const COLORS = ['White', 'Black', 'Navy', 'Gray']

const DesignStudio = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const containerRef = useRef<HTMLDivElement | null>(null)

  const addItem = useCartStore((s) => s.addItem)

  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('White')

  const [savedDesigns, setSavedDesigns] = useState<any[]>([])

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const logoUrl = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : ''), [logoFile])

  const [pos, setPos] = useState({ x: 220, y: 220 })
  const [scale, setScale] = useState(0.6)

  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ dx: 0, dy: 0 })

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
  }, [navigate, token])

  useEffect(() => {
    const loadSaved = async () => {
      if (!token) return
      try {
        const data = await customProductsAPI.listMyCustomProducts(token)
        setSavedDesigns(Array.isArray(data) ? data : [])
      } catch {
        setSavedDesigns([])
      }
    }
    loadSaved()
  }, [token])

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl)
    }
  }, [logoUrl])

  const onMouseDownLogo = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDragging(true)
    dragOffset.current = {
      dx: e.clientX - rect.left - pos.x,
      dy: e.clientY - rect.top - pos.y,
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.current.dx
    const y = e.clientY - rect.top - dragOffset.current.dy
    setPos({
      x: clamp(x, 0, rect.width),
      y: clamp(y, 0, rect.height),
    })
  }

  const onMouseUp = () => {
    setDragging(false)
  }

  const buildPreviewFile = async (): Promise<File | null> => {
    if (!logoFile || !containerRef.current) return null

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    const canvas = document.createElement('canvas')
    const width = 900
    const height = 900
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const tshirtImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = mockupUrl
    })

    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = logoUrl
    })

    ctx.drawImage(tshirtImg, 0, 0, width, height)

    const xPct = pos.x / rect.width
    const yPct = pos.y / rect.height

    const baseLogoW = 260
    const logoW = baseLogoW * scale
    const logoH = (logoW * logoImg.height) / logoImg.width

    const drawX = xPct * width - logoW / 2
    const drawY = yPct * height - logoH / 2

    ctx.drawImage(logoImg, drawX, drawY, logoW, logoH)

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return null
    return new File([blob], 'custom_preview.png', { type: 'image/png' })
  }

  const onSubmit = async () => {
    if (!token) return
    if (!name.trim()) {
      alert('Design name is required')
      return
    }
    if (!logoFile) {
      alert('Please upload a logo image')
      return
    }

    setIsLoading(true)
    try {
      const previewFile = await buildPreviewFile()
      if (!previewFile) {
        alert('Failed to generate preview')
        return
      }

      const container = containerRef.current
      const rect = container?.getBoundingClientRect()

      const designData = {
        type: 'logo_on_mockup',
        mockup: mockupUrl,
        variant: {
          size: selectedSize,
          color: selectedColor,
        },
        placement: {
          x: rect ? pos.x / rect.width : 0.5,
          y: rect ? pos.y / rect.height : 0.5,
          scale,
        },
      }

      const created = await customProductsAPI.createCustomProduct(token, {
        name: name.trim(),
        description: description.trim() || undefined,
        price: RETAIL_PRICE,
        stock: 9999,
        design_logo: logoFile,
        design_preview: previewFile,
        design_data: designData,
      })

      const createdImageUrl = toUrl(created.design_preview || created.image) || ''

      addItem({
        productId: Number(created.id),
        name: created.name,
        unitPrice: Number(created.discount_price || created.price),
        imageUrl: createdImageUrl || logoUrl,
        quantity: 1,
        options: {
          size: selectedSize,
          color: selectedColor,
          custom: created.design_data,
        },
      })

      navigate('/cart')
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addSavedToCart = (p: any) => {
    const imageUrl = toUrl(p.design_preview || p.image) || ''
    const unitPrice = Number(p.discount_price || p.price || RETAIL_PRICE)
    const variantSize = p.design_data?.variant?.size || 'M'
    const variantColor = p.design_data?.variant?.color || 'White'
    addItem({
      productId: Number(p.id),
      name: p.name,
      unitPrice,
      imageUrl,
      quantity: 1,
      options: {
        size: variantSize,
        color: variantColor,
        custom: p.design_data,
      },
    })
    navigate('/cart')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Design Studio</h1>
        <p className="text-gray-600 mt-1">Upload your logo, place it on the T-shirt, and checkout with Cash On Delivery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Design Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Example: My Custom Tee"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Short description"
              />
            </div>

            <div className="md:col-span-2">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-gray-900">Price</div>
                <div className="text-gray-600 text-sm mt-1">৳{RETAIL_PRICE} (Retail)</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Size</label>
              <input
                type="range"
                min={0.2}
                max={1.2}
                step={0.05}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              disabled={isLoading}
              onClick={onSubmit}
              className="md:col-span-2 mt-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Add to Cart'}
            </button>

            {savedDesigns.length > 0 && (
              <div className="md:col-span-2 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Saved Designs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedDesigns.slice(0, 6).map((p) => (
                    <div key={p.id} className="border border-gray-200 rounded-xl p-3 flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={toUrl(p.design_preview || p.image) || ''}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{p.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {p.design_data?.variant?.size || 'M'} | {p.design_data?.variant?.color || 'White'}
                        </div>
                        <button
                          type="button"
                          onClick={() => addSavedToCart(p)}
                          className="mt-2 text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Mockup Editor</h2>

          <div
            ref={containerRef}
            className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 select-none"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img src={mockupUrl} alt="mockup" className="absolute inset-0 w-full h-full object-cover" />

            {logoUrl && (
              <img
                src={logoUrl}
                alt="logo"
                onMouseDown={onMouseDownLogo}
                className="absolute cursor-move"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: `${260 * scale}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}

            {!logoUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Upload a logo to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignStudio
