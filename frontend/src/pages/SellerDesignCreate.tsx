import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { designAPI, storeAPI } from '../services/api'
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react'

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

const SellerDesignCreate = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const containerRef = useRef<HTMLDivElement | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [store, setStore] = useState<any>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [buyPrice, setBuyPrice] = useState<number>(350)
  const [sellPrice, setSellPrice] = useState<number>(699)
  const [stock, setStock] = useState<number>(50)
  const [publishNow, setPublishNow] = useState(true)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const logoUrl = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : ''), [logoFile])

  const [pos, setPos] = useState({ x: 220, y: 220 })
  const [scale, setScale] = useState(0.6)
  const [rotation, setRotation] = useState(0)

  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ dx: 0, dy: 0 })

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl)
    }
  }, [logoUrl])

  useEffect(() => {
    const init = async () => {
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
      } catch {
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [navigate, token])

  const profit = useMemo(() => {
    return Number((sellPrice - buyPrice).toFixed(2))
  }, [buyPrice, sellPrice])

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

    const drawX = xPct * width
    const drawY = yPct * height

    // Apply rotation
    ctx.save()
    ctx.translate(drawX, drawY)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH)
    ctx.restore()

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return null
    return new File([blob], 'design_preview.png', { type: 'image/png' })
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
        placement: {
          x: rect ? pos.x / rect.width : 0.5,
          y: rect ? pos.y / rect.height : 0.5,
          scale,
          rotation,
        },
      }

      await designAPI.createDesignProduct(token, {
        name: name.trim(),
        description: description.trim() || undefined,
        buy_price: buyPrice,
        price: sellPrice,
        stock,
        is_published: publishNow,
        design_logo: logoFile,
        design_preview: previewFile,
        design_data: designData,
      })

      navigate('/seller')
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!store) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Design</h1>
        <p className="text-gray-600 mt-1">Upload your logo and place it on the mockup. Set buy/sell rate and publish.</p>
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
                placeholder="Example: Minimal Logo Tee"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Short description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buy Rate (৳)</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sell Rate (৳)</label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profit / Unit</label>
              <div className={`px-4 py-3 rounded-xl border ${profit >= 0 ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                ৳{profit}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScale(Math.max(0.2, scale - 0.1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="range"
                  min={0.2}
                  max={1.5}
                  step={0.05}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <button
                  onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-500 w-12 text-right">{Math.round(scale * 100)}%</span>
              </div>
            </div>

            {/* Rotation Control */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rotation</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRotation(rotation - 15)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <button
                  onClick={() => setRotation(rotation + 15)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCw className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-500 w-12 text-right">{rotation}°</span>
              </div>
              <button
                onClick={() => setRotation(0)}
                className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                Reset rotation
              </button>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Publish now</span>
            </div>

            <button
              onClick={onSubmit}
              className="md:col-span-2 mt-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
            >
              Save Design
            </button>
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

            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: `${260 * scale}px`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  transition: dragging ? 'none' : 'transform 0.1s ease-out',
                }}
                className="absolute cursor-move drop-shadow-lg"
                onMouseDown={onMouseDownLogo}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 py-2 bg-white/90 rounded-xl border border-gray-200 text-gray-600">
                  Upload a logo to start
                </div>
              </div>
            )}
          </div>

          {/* Quick Controls */}
          {logoUrl && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setRotation(rotation - 45)}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Rotate Left 45°"
                >
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setRotation(rotation + 45)}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Rotate Right 45°"
                >
                  <RotateCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setScale(Math.max(0.2, scale - 0.1))}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={() => {
                  setRotation(0)
                  setScale(0.6)
                  setPos({ x: 220, y: 220 })
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
            <Move className="w-4 h-4" />
            Drag the logo to place it. Use sliders or buttons to resize and rotate.
          </div>

          {store?.logo && (
            <div className="mt-6 flex items-center gap-3">
              <img src={toUrl(store.logo)} alt="store logo" className="w-10 h-10 rounded-xl object-cover bg-gray-100" />
              <div>
                <div className="text-sm font-medium text-gray-900">{store.name}</div>
                <div className="text-xs text-gray-500">Store</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerDesignCreate
