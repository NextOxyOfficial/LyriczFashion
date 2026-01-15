import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customProductsAPI, designAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Move, Type, Layers, Sparkles, ShoppingCart, ImageIcon, Palette } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

const MOCKUP_TYPES = [
  { id: 'tshirt', name: 'T-Shirt', price: 699, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f3f4f6"/><path d="M320 170 L240 210 L140 320 L210 420 L280 360 L280 780 L620 780 L620 360 L690 420 L760 320 L660 210 L580 170 L520 240 L380 240 Z" fill="#ffffff" stroke="#d1d5db" stroke-width="12" stroke-linejoin="round"/><path d="M380 240 C410 300 490 300 520 240" fill="none" stroke="#e5e7eb" stroke-width="10" stroke-linecap="round"/></svg>` },
  { id: 'hoodie', name: 'Hoodie', price: 1299, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f3f4f6"/><path d="M280 180 L200 220 L120 350 L180 420 L250 380 L250 780 L650 780 L650 380 L720 420 L780 350 L700 220 L620 180 L560 180 L560 280 C560 320 500 360 450 360 C400 360 340 320 340 280 L340 180 Z" fill="#ffffff" stroke="#d1d5db" stroke-width="12" stroke-linejoin="round"/><ellipse cx="450" cy="160" rx="80" ry="40" fill="#ffffff" stroke="#d1d5db" stroke-width="10"/></svg>` },
  { id: 'longsleeve', name: 'Long Sleeve', price: 899, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f3f4f6"/><path d="M320 170 L240 210 L100 650 L180 680 L280 360 L280 780 L620 780 L620 360 L720 680 L800 650 L660 210 L580 170 L520 240 L380 240 Z" fill="#ffffff" stroke="#d1d5db" stroke-width="12" stroke-linejoin="round"/><path d="M380 240 C410 300 490 300 520 240" fill="none" stroke="#e5e7eb" stroke-width="10" stroke-linecap="round"/></svg>` },
  { id: 'tanktop', name: 'Tank Top', price: 499, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f3f4f6"/><path d="M340 170 L280 200 L280 780 L620 780 L620 200 L560 170 L520 240 L380 240 Z" fill="#ffffff" stroke="#d1d5db" stroke-width="12" stroke-linejoin="round"/><path d="M380 240 C410 300 490 300 520 240" fill="none" stroke="#e5e7eb" stroke-width="10" stroke-linecap="round"/></svg>` },
  { id: 'polo', name: 'Polo Shirt', price: 999, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f3f4f6"/><path d="M320 170 L240 210 L140 320 L210 420 L280 360 L280 780 L620 780 L620 360 L690 420 L760 320 L660 210 L580 170 L520 240 L380 240 Z" fill="#ffffff" stroke="#d1d5db" stroke-width="12" stroke-linejoin="round"/><path d="M380 240 L380 320 L450 350 L520 320 L520 240" fill="#ffffff" stroke="#d1d5db" stroke-width="8"/><circle cx="450" cy="290" r="8" fill="#d1d5db"/><circle cx="450" cy="320" r="8" fill="#d1d5db"/></svg>` },
  { id: 'sweatshirt', name: 'Sweatshirt', price: 1099, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f3f4f6"/><path d="M300 180 L220 220 L100 600 L180 630 L260 360 L260 780 L640 780 L640 360 L720 630 L800 600 L680 220 L600 180 L520 240 L380 240 Z" fill="#ffffff" stroke="#d1d5db" stroke-width="12" stroke-linejoin="round"/><path d="M380 240 C410 300 490 300 520 240" fill="none" stroke="#e5e7eb" stroke-width="10" stroke-linecap="round"/></svg>` },
]

const getMockupUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COLORS = ['White', 'Black', 'Navy', 'Gray', 'Red', 'Green']

const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Gold', value: '#D4AF37' },
]

const FONTS = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Arial Black', value: '"Arial Black", sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Helvetica Neue', value: '"Helvetica Neue", sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Times', value: 'Times, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Garamond', value: 'Garamond, serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Courier', value: 'Courier, monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Geneva', value: 'Geneva, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Palatino', value: '"Palatino Linotype", serif' },
  { name: 'Bookman', value: '"Bookman Old Style", serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Century Gothic', value: '"Century Gothic", sans-serif' },
  { name: 'Lucida Sans', value: '"Lucida Sans", sans-serif' },
  { name: 'Lucida Console', value: '"Lucida Console", monospace' },
  { name: 'Monaco', value: 'Monaco, monospace' },
  { name: 'Consolas', value: 'Consolas, monospace' },
  { name: 'Copperplate', value: 'Copperplate, fantasy' },
  { name: 'Papyrus', value: 'Papyrus, fantasy' },
  { name: 'Brush Script MT', value: '"Brush Script MT", cursive' },
  { name: 'Lucida Handwriting', value: '"Lucida Handwriting", cursive' },
  { name: 'Rockwell', value: 'Rockwell, serif' },
  { name: 'Baskerville', value: 'Baskerville, serif' },
  { name: 'Didot', value: 'Didot, serif' },
  { name: 'Bodoni MT', value: '"Bodoni MT", serif' },
  { name: 'Cambria', value: 'Cambria, serif' },
  { name: 'Constantia', value: 'Constantia, serif' },
  { name: 'Calibri', value: 'Calibri, sans-serif' },
  { name: 'Candara', value: 'Candara, sans-serif' },
  { name: 'Corbel', value: 'Corbel, sans-serif' },
  { name: 'Franklin Gothic', value: '"Franklin Gothic Medium", sans-serif' },
  { name: 'Gill Sans', value: '"Gill Sans", sans-serif' },
  { name: 'Optima', value: 'Optima, sans-serif' },
  { name: 'Segoe UI', value: '"Segoe UI", sans-serif' },
  { name: 'Futura', value: 'Futura, sans-serif' },
  { name: 'Avenir', value: 'Avenir, sans-serif' },
  { name: 'Century', value: 'Century, serif' },
  { name: 'Goudy Old Style', value: '"Goudy Old Style", serif' },
  { name: 'Hoefler Text', value: '"Hoefler Text", serif' },
  { name: 'Big Caslon', value: '"Big Caslon", serif' },
  { name: 'Perpetua', value: 'Perpetua, serif' },
  { name: 'American Typewriter', value: '"American Typewriter", serif' },
  { name: 'Andale Mono', value: '"Andale Mono", monospace' },
  { name: 'Menlo', value: 'Menlo, monospace' },
  { name: 'DejaVu Sans', value: '"DejaVu Sans", sans-serif' },
  { name: 'DejaVu Serif', value: '"DejaVu Serif", serif' },
  { name: 'Ubuntu', value: 'Ubuntu, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Raleway', value: 'Raleway, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
]

const DesignStudio = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const [isLoading, setIsLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('White')
  const [selectedMockup, setSelectedMockup] = useState(MOCKUP_TYPES[0])

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const logoUrl = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : ''), [logoFile])

  const [customText, setCustomText] = useState('')
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].value)
  const [textFont, setTextFont] = useState(FONTS[0].value)
  const [charColors, setCharColors] = useState<string[]>([])
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(null)

  // Image controls
  const [imagePos, setImagePos] = useState({ x: 220, y: 180 })
  const [imageScale, setImageScale] = useState(0.6)
  const [imageRotation, setImageRotation] = useState(0)
  const [draggingImage, setDraggingImage] = useState(false)
  const imageDragOffset = useRef({ dx: 0, dy: 0 })

  // Text controls
  const [textPos, setTextPos] = useState({ x: 220, y: 280 })
  const [textScale, setTextScale] = useState(0.6)
  const [textRotation, setTextRotation] = useState(0)
  const [draggingText, setDraggingText] = useState(false)
  const textDragOffset = useRef({ dx: 0, dy: 0 })

  const [activeElement, setActiveElement] = useState<'image' | 'text' | null>(null)
  const [hoveredElement, setHoveredElement] = useState<'image' | 'text' | null>(null)

  const [designLibrary, setDesignLibrary] = useState<any[]>([])
  const [loadingDesigns, setLoadingDesigns] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
  }, [navigate, token])

  useEffect(() => {
    const loadDesignLibrary = async () => {
      setLoadingDesigns(true)
      try {
        const response = await designAPI.listPublishedDesigns()
        setDesignLibrary(Array.isArray(response) ? response : [])
      } catch { setDesignLibrary([]) }
      finally { setLoadingDesigns(false) }
    }
    loadDesignLibrary()
  }, [])

  useEffect(() => {
    return () => { if (logoUrl) URL.revokeObjectURL(logoUrl) }
  }, [logoUrl])

  const hasDesign = !!logoUrl || !!customText.trim()

  const onMouseDownImage = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    e.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    setDraggingImage(true)
    setActiveElement('image')
    imageDragOffset.current = { dx: e.clientX - rect.left - imagePos.x, dy: e.clientY - rect.top - imagePos.y }
  }

  const onMouseDownText = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    e.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    setDraggingText(true)
    setActiveElement('text')
    textDragOffset.current = { dx: e.clientX - rect.left - textPos.x, dy: e.clientY - rect.top - textPos.y }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    if (draggingImage) {
      setImagePos({
        x: clamp(e.clientX - rect.left - imageDragOffset.current.dx, 0, rect.width),
        y: clamp(e.clientY - rect.top - imageDragOffset.current.dy, 0, rect.height),
      })
    }
    
    if (draggingText) {
      setTextPos({
        x: clamp(e.clientX - rect.left - textDragOffset.current.dx, 0, rect.width),
        y: clamp(e.clientY - rect.top - textDragOffset.current.dy, 0, rect.height),
      })
    }
  }

  const onMouseUp = () => {
    setDraggingImage(false)
    setDraggingText(false)
  }

  const buildPreviewFile = async (): Promise<File | null> => {
    if (!containerRef.current || !hasDesign) return null
    const rect = containerRef.current.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = 900; canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const tshirtImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = getMockupUrl(selectedMockup.svg)
    })
    ctx.drawImage(tshirtImg, 0, 0, 900, 900)

    // Draw image if present
    if (logoUrl) {
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = logoUrl
      })
      const imgDrawX = (imagePos.x / rect.width) * 900
      const imgDrawY = (imagePos.y / rect.height) * 900
      ctx.save()
      ctx.translate(imgDrawX, imgDrawY)
      ctx.rotate((imageRotation * Math.PI) / 180)
      const logoW = 260 * imageScale
      const logoH = (logoW * logoImg.height) / logoImg.width
      ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH)
      ctx.restore()
    }

    // Draw text if present
    if (customText.trim()) {
      const txtDrawX = (textPos.x / rect.width) * 900
      const txtDrawY = (textPos.y / rect.height) * 900
      ctx.save()
      ctx.translate(txtDrawX, txtDrawY)
      ctx.rotate((textRotation * Math.PI) / 180)
      ctx.font = `bold ${64 * textScale}px ${textFont}`
      ctx.textBaseline = 'middle'
      
      // Calculate total width for centering
      let totalWidth = 0
      customText.split('').forEach(char => {
        totalWidth += ctx.measureText(char).width
      })
      
      // Draw each character with its color
      let xOffset = -totalWidth / 2
      customText.split('').forEach((char, idx) => {
        ctx.fillStyle = charColors[idx] || textColor
        ctx.fillText(char, xOffset, 0)
        xOffset += ctx.measureText(char).width
      })
      ctx.restore()
    }

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return null
    return new File([blob], 'custom_preview.png', { type: 'image/png' })
  }

  const onSubmit = async () => {
    if (!token || !hasDesign) {
      alert('Please upload an image or enter some text')
      return
    }
    setIsLoading(true)
    try {
      const previewFile = await buildPreviewFile()
      if (!previewFile) { alert('Failed to generate preview'); return }

      const rect = containerRef.current?.getBoundingClientRect()
      const designName = customText 
        ? `Custom: ${customText.substring(0, 25)}` 
        : `Custom ${selectedMockup.name}`

      const designData = {
        type: logoUrl && customText ? 'image_and_text' : logoUrl ? 'logo_on_mockup' : 'text_on_mockup',
        mockupType: selectedMockup.id,
        variant: { size: selectedSize, color: selectedColor },
        ...(logoUrl && {
          imagePlacement: { x: rect ? imagePos.x / rect.width : 0.5, y: rect ? imagePos.y / rect.height : 0.4, scale: imageScale, rotation: imageRotation }
        }),
        ...(customText && {
          textPlacement: { x: rect ? textPos.x / rect.width : 0.5, y: rect ? textPos.y / rect.height : 0.6, scale: textScale, rotation: textRotation },
          text: customText,
          textColor,
          textFont,
          charColors
        }),
      }

      const created = await customProductsAPI.createCustomProduct(token, {
        name: designName,
        price: selectedMockup.price,
        stock: 9999,
        design_logo: logoFile || undefined,
        design_preview: previewFile,
        design_data: designData,
      })

      addItem({
        productId: Number(created.id),
        name: created.name,
        unitPrice: Number(created.price),
        imageUrl: toUrl(created.design_preview) || logoUrl,
        quantity: 1,
        options: { size: selectedSize, color: selectedColor, custom: created.design_data },
      })
      navigate('/cart')
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message)
    } finally { setIsLoading(false) }
  }

  const selectDesignFromLibrary = async (design: any) => {
    try {
      const imageUrl = toUrl(design.design_logo || design.design_preview || design.image)
      if (!imageUrl) return
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      setLogoFile(new File([blob], 'design.png', { type: blob.type }))
    } catch (e) { console.error('Failed to load design:', e) }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Design Studio
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Create custom apparel with images or text</p>
        </div>

        {/* Mockup Selector - Centered */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 mb-8">
          <div className="text-center mb-4">
            <h3 className="font-bold text-emerald-700 text-lg flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" /> Select Product
            </h3>
            <span className="text-sm text-gray-500 mt-1 inline-block">Choose your apparel type</span>
          </div>
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            {MOCKUP_TYPES.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMockup(m)}
                className={`w-36 p-4 rounded-xl border-2 transition-all ${
                  selectedMockup.id === m.id
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm scale-105'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <img src={getMockupUrl(m.svg)} alt={m.name} className="w-full h-20 object-contain" />
                <div className="text-base font-bold text-center mt-3 truncate">{m.name}</div>
                <div className={`text-base text-center font-semibold mt-1 ${selectedMockup.id === m.id ? 'text-emerald-600' : 'text-gray-600'}`}>
                  ৳{m.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-3">
            {/* Design Mode */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 space-y-4">
              {/* Upload Image Section */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                    Upload Your Design
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="w-full text-sm border-2 border-dashed border-emerald-200 rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer file:shadow-sm"
                    />
                  </div>
                  {logoFile && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-emerald-100">
                        <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{logoFile.name}</p>
                        <p className="text-xs text-gray-500">{(logoFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={() => setLogoFile(null)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-medium mb-1">💡 Tips for best results:</p>
                  <ul className="text-xs text-blue-700 space-y-0.5 ml-4">
                    <li>• Use PNG format with transparent background</li>
                    <li>• Minimum resolution: 500x500 pixels</li>
                    <li>• Keep file size under 5MB</li>
                  </ul>
                </div>
              </div>

              {/* Text Design Section */}
              <div className="bg-gradient-to-br p-4 from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 space-y-4">
                {/* Text Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Type className="w-4 h-4 text-emerald-600" />
                    Your Text
                  </label>
                  <input
                    value={customText}
                      onChange={(e) => {
                        const newText = e.target.value
                        setCustomText(newText)
                        setCharColors(prev => {
                          const newColors = [...prev]
                          while (newColors.length < newText.length) {
                            newColors.push(textColor)
                          }
                          return newColors.slice(0, newText.length)
                        })
                      }}
                      placeholder="Type your custom text..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white transition-all"
                    />
                  </div>
                  
                  {/* Font Selector */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Choose Font Style
                    </label>
                    <select
                      value={textFont}
                      onChange={(e) => setTextFont(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer hover:border-gray-300 transition-all"
                    >
                      {FONTS.map((f) => (
                        <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Per-character color display */}
                  {customText && customText.replace(/\s/g, '').length > 0 && (
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-3">
                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Click Letters to Customize
                      </label>
                      <div className="flex flex-wrap gap-1 p-3 bg-white rounded-lg border border-gray-200 min-h-[45px]">
                        {customText.split('').filter(char => char !== ' ').map((char, originalIdx) => {
                          const idx = customText.split('').findIndex((c, i) => c === char && customText.split('').slice(0, i).filter(ch => ch !== ' ').length === originalIdx);
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedCharIndex(selectedCharIndex === idx ? null : idx)}
                              className={`px-2 py-1 text-lg font-bold rounded-lg transition-all ${
                                selectedCharIndex === idx 
                                  ? 'ring-2 ring-emerald-500 bg-emerald-50 shadow-sm scale-105' 
                                  : 'hover:bg-gray-50'
                              }`}
                              style={{ color: charColors[idx] || textColor }}
                            >
                              {char}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Color Palette */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-3">
                      <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      {selectedCharIndex !== null ? `Color for "${customText[selectedCharIndex]}"` : 'Default Text Color'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => {
                            if (selectedCharIndex !== null) {
                              setCharColors(prev => {
                                const newColors = [...prev]
                                newColors[selectedCharIndex] = c.value
                                return newColors
                              })
                            } else {
                              setTextColor(c.value)
                              setCharColors(prev => prev.map((col) => col === textColor ? c.value : col))
                            }
                          }}
                          className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-105 ${
                            (selectedCharIndex !== null ? charColors[selectedCharIndex] : textColor) === c.value 
                              ? 'border-emerald-500 scale-105 shadow-md ring-2 ring-emerald-200' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
            </div>

            {/* Transform Controls */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h3 className="font-semibold text-gray-800 text-sm">Transform Controls</h3>
              </div>
              
              {/* Element Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveElement('image')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    activeElement === 'image' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setActiveElement('text')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    activeElement === 'text' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
              </div>
              
              {/* Size Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <ZoomIn className="w-4 h-4 text-emerald-600" />
                    Scale Size ({activeElement === 'image' ? 'Image' : 'Text'})
                  </label>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                    {Math.round((activeElement === 'image' ? imageScale : textScale) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => activeElement === 'image' ? setImageScale(Math.max(0.2, imageScale - 0.1)) : setTextScale(Math.max(0.2, textScale - 0.1))} 
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  <input 
                    type="range" 
                    min={0.2} 
                    max={1.5} 
                    step={0.05} 
                    value={activeElement === 'image' ? imageScale : textScale} 
                    onChange={(e) => activeElement === 'image' ? setImageScale(Number(e.target.value)) : setTextScale(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <button 
                    onClick={() => activeElement === 'image' ? setImageScale(Math.min(1.5, imageScale + 0.1)) : setTextScale(Math.min(1.5, textScale + 0.1))} 
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>20%</span>
                  <span>150%</span>
                </div>
              </div>
              
              {/* Rotation Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <RotateCw className="w-4 h-4 text-emerald-600" />
                    Rotate Angle ({activeElement === 'image' ? 'Image' : 'Text'})
                  </label>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                    {activeElement === 'image' ? imageRotation : textRotation}°
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => activeElement === 'image' ? setImageRotation(imageRotation - 15) : setTextRotation(textRotation - 15)} 
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </button>
                  <input 
                    type="range" 
                    min={-180} 
                    max={180} 
                    step={1} 
                    value={activeElement === 'image' ? imageRotation : textRotation} 
                    onChange={(e) => activeElement === 'image' ? setImageRotation(Number(e.target.value)) : setTextRotation(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <button 
                    onClick={() => activeElement === 'image' ? setImageRotation(imageRotation + 15) : setTextRotation(textRotation + 15)} 
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <RotateCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>-180°</span>
                  <span>0°</span>
                  <span>180°</span>
                </div>
              </div>
              
              {/* Product Options */}
              <div className="py-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h4 className="font-semibold text-gray-800 text-sm">Product Specifications</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                      Apparel Size
                    </label>
                    <select 
                      value={selectedSize} 
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:border-gray-300 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                      Fabric Color
                    </label>
                    <select 
                      value={selectedColor} 
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:border-gray-300 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Library */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4">
              <h3 className="font-semibold text-emerald-700 mb-3 text-base flex items-center gap-2">
                <Layers className="w-5 h-5" /> Design Library
              </h3>
              {loadingDesigns ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : designLibrary.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {designLibrary.map((d) => (
                    <button key={d.id} onClick={() => selectDesignFromLibrary(d)}
                      className="p-1.5 border border-gray-100 rounded-lg hover:border-emerald-400 hover:shadow transition-all">
                      <img src={toUrl(d.design_preview || d.design_logo || d.image) || ''} alt={d.name}
                        className="w-full aspect-square object-cover rounded" />
                      <div className="text-xs truncate mt-1 text-gray-700">{d.name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No designs available</p>
              )}
            </div>
          </div>

          {/* Right Panel - Mockup Editor (Larger) */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border-2 border-emerald-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-emerald-700 text-base">Live Preview</h2>
                    <p className="text-xs text-gray-500">Drag elements to position</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">{selectedMockup.name}</span>
                </div>
              </div>

              <div
                ref={containerRef}
                className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-xl select-none"
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                <img src={getMockupUrl(selectedMockup.svg)} alt="mockup" className="absolute inset-0 w-full h-full object-cover" />

                {logoUrl && (
                  <div
                    className="absolute"
                    style={{
                      left: imagePos.x, top: imagePos.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredElement('image')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <img
                      src={logoUrl}
                      alt="design"
                      onMouseDown={onMouseDownImage}
                      className="cursor-move drop-shadow-sm"
                      style={{
                        width: `${260 * imageScale}px`,
                        transform: `rotate(${imageRotation}deg)`,
                        transition: draggingImage ? 'none' : 'transform 0.1s',
                      }}
                      draggable={false}
                    />
                    {hoveredElement === 'image' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
                        title="Delete image"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {customText && (
                  <div
                    className="absolute"
                    style={{
                      left: textPos.x, top: textPos.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredElement('text')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <div
                      onMouseDown={onMouseDownText}
                      className="cursor-move select-none relative"
                      style={{
                        transform: `rotate(${textRotation}deg) scale(${textScale})`,
                        transition: draggingText ? 'none' : 'transform 0.1s',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        fontFamily: textFont,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                      }}
                    >
                      {customText.split('').map((char, idx) => (
                        <span
                          key={idx}
                          style={{
                            color: charColors[idx] || textColor,
                            textShadow: (charColors[idx] || textColor) === '#FFFFFF' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                            whiteSpace: 'pre',
                          }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    {hoveredElement === 'text' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomText('');
                          setCharColors([]);
                        }}
                        className="absolute -top-6 -right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
                        title="Delete text"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {!hasDesign && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Upload image or add text</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Controls */}
              {hasDesign && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => activeElement === 'image' ? setImageRotation(imageRotation - 45) : setTextRotation(textRotation - 45)} className="p-1.5 hover:bg-white rounded" title="Rotate -45°">
                      <RotateCcw className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => activeElement === 'image' ? setImageRotation(imageRotation + 45) : setTextRotation(textRotation + 45)} className="p-1.5 hover:bg-white rounded" title="Rotate +45°">
                      <RotateCw className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => activeElement === 'image' ? setImageScale(Math.max(0.2, imageScale - 0.1)) : setTextScale(Math.max(0.2, textScale - 0.1))} className="p-1.5 hover:bg-white rounded">
                      <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => activeElement === 'image' ? setImageScale(Math.min(1.5, imageScale + 0.1)) : setTextScale(Math.min(1.5, textScale + 0.1))} className="p-1.5 hover:bg-white rounded">
                      <ZoomIn className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset? All your current work will be discarded.')) {
                        window.location.reload()
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-red-200 hover:border-red-300"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Price & Add to Cart */}
              <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{selectedMockup.name}</div>
                    <div className="text-xs text-gray-500">{selectedSize} • {selectedColor}</div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">৳{selectedMockup.price}</div>
                </div>
                <button
                  disabled={isLoading || !hasDesign}
                  onClick={onSubmit}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isLoading ? 'Creating...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignStudio
