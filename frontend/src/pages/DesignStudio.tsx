import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customProductsAPI, designLibraryAPI, designCategoryAPI, mockupAPI, categoriesAPI, toApiUrl } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Type, Layers, Sparkles, ShoppingCart, ImageIcon, Search, X } from 'lucide-react'

const toUrl = toApiUrl

type MockupTypeList = {
  id: number
  name: string
  slug: string
  base_price: string
  description?: string | null
  preview_image?: string | null
  is_active: boolean
  variant_count: number
}

type MockupVariant = {
  id: number
  mockup_type: number
  mockup_type_name: string
  mockup_type_slug: string
  color_name: string
  color_hex?: string | null
  front_image: string
  back_image: string
  thumbnail?: string | null
  price_modifier: string
  stock: number
  effective_price: string
  is_active: boolean
}

type MockupTypeDetail = MockupTypeList & {
  variants: MockupVariant[]
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const variantImageUrl = (variant: MockupVariant | null, side: 'front' | 'back') => {
  if (!variant) return ''
  const preferred = side === 'front' ? variant.front_image : variant.back_image
  const fallback = side === 'front' ? variant.back_image : variant.front_image
  return toUrl(preferred || variant.thumbnail || fallback)
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

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
  const [user, setUser] = useState<any>(null)
  const [isLoadingMockups, setIsLoadingMockups] = useState(false)
  const [mockupError, setMockupError] = useState<string | null>(null)
  const [mockupTypes, setMockupTypes] = useState<MockupTypeList[]>([])
  const [allMockupTypes, setAllMockupTypes] = useState<MockupTypeList[]>([])
  const [productCategories, setProductCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedMockupType, setSelectedMockupType] = useState<MockupTypeList | null>(null)
  const [mockupVariants, setMockupVariants] = useState<MockupVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<MockupVariant | null>(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('')
  const [mockupImageFailed, setMockupImageFailed] = useState(false)

  // Front/Back side toggle
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front')

  // Upload tab state
  const [uploadTab, setUploadTab] = useState<'upload' | 'library'>('upload')

  // Multi-logo type
  type LogoItem = { file: File | null; url: string; pos: { x: number; y: number }; scale: number; rotation: number; libraryId: number | null }
  const makeLogoItem = (x = 220, y = 180): LogoItem => ({ file: null, url: '', pos: { x, y }, scale: 0.6, rotation: 0, libraryId: null })

  // Front side design states
  const [frontLogos, setFrontLogos] = useState<LogoItem[]>([makeLogoItem()])
  const [frontActiveLogoIdx, setFrontActiveLogoIdx] = useState(0)
  const [frontCustomText, setFrontCustomText] = useState('')
  const [frontTextColor, setFrontTextColor] = useState(TEXT_COLORS[0].value)
  const [frontTextFont, setFrontTextFont] = useState(FONTS[0].value)
  const [frontCharColors, setFrontCharColors] = useState<string[]>([])
  const [frontTextPos, setFrontTextPos] = useState({ x: 220, y: 280 })
  const [frontTextScale, setFrontTextScale] = useState(0.6)
  const [frontTextRotation, setFrontTextRotation] = useState(0)

  // Back side design states
  const [backLogos, setBackLogos] = useState<LogoItem[]>([makeLogoItem()])
  const [backActiveLogoIdx, setBackActiveLogoIdx] = useState(0)
  const [backCustomText, setBackCustomText] = useState('')
  const [backTextColor, setBackTextColor] = useState(TEXT_COLORS[0].value)
  const [backTextFont, setBackTextFont] = useState(FONTS[0].value)
  const [backCharColors, setBackCharColors] = useState<string[]>([])
  const [backTextPos, setBackTextPos] = useState({ x: 220, y: 280 })
  const [backTextScale, setBackTextScale] = useState(0.6)
  const [backTextRotation, setBackTextRotation] = useState(0)

  // Dynamic references based on active side
  const logos = activeSide === 'front' ? frontLogos : backLogos
  const setLogos = activeSide === 'front' ? setFrontLogos : setBackLogos
  const activeLogoIdx = activeSide === 'front' ? frontActiveLogoIdx : backActiveLogoIdx
  const setActiveLogoIdx = activeSide === 'front' ? setFrontActiveLogoIdx : setBackActiveLogoIdx
  const activeLogo = logos[activeLogoIdx] ?? logos[0]

  // Helpers to update a specific logo field
  const updateLogo = (idx: number, patch: Partial<LogoItem>) => {
    setLogos(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l))
  }

  // Legacy single-logo compat for canvas rendering
  const logoUrl = activeLogo?.url ?? ''
  const imagePos = activeLogo?.pos ?? { x: 220, y: 180 }
  const setImagePos = (pos: { x: number; y: number }) => updateLogo(activeLogoIdx, { pos })
  const imageScale = activeLogo?.scale ?? 0.6
  const setImageScale = (scale: number) => updateLogo(activeLogoIdx, { scale })
  const imageRotation = activeLogo?.rotation ?? 0
  const setImageRotation = (rotation: number) => updateLogo(activeLogoIdx, { rotation })

  const customText = activeSide === 'front' ? frontCustomText : backCustomText
  const setCustomText = activeSide === 'front' ? setFrontCustomText : setBackCustomText
  const textColor = activeSide === 'front' ? frontTextColor : backTextColor
  const setTextColor = activeSide === 'front' ? setFrontTextColor : setBackTextColor
  const textFont = activeSide === 'front' ? frontTextFont : backTextFont
  const setTextFont = activeSide === 'front' ? setFrontTextFont : setBackTextFont
  const charColors = activeSide === 'front' ? frontCharColors : backCharColors
  const setCharColors = activeSide === 'front' ? setFrontCharColors : setBackCharColors
  const textPos = activeSide === 'front' ? frontTextPos : backTextPos
  const setTextPos = activeSide === 'front' ? setFrontTextPos : setBackTextPos
  const textScale = activeSide === 'front' ? frontTextScale : backTextScale
  const setTextScale = activeSide === 'front' ? setFrontTextScale : setBackTextScale
  const textRotation = activeSide === 'front' ? frontTextRotation : backTextRotation
  const setTextRotation = activeSide === 'front' ? setFrontTextRotation : setBackTextRotation

  // Multi-select char indices
  const [selectedCharIndices, setSelectedCharIndices] = useState<Set<number>>(new Set())
  const [draggingImage, setDraggingImage] = useState(false)
  const imageDragOffset = useRef({ dx: 0, dy: 0 })
  const [draggingText, setDraggingText] = useState(false)
  const textDragOffset = useRef({ dx: 0, dy: 0 })

  const [activeElement, setActiveElement] = useState<'image' | 'text' | null>(null)
  const [hoveredElement, setHoveredElement] = useState<'image' | 'text' | null>(null)

  // library design IDs now stored inside each LogoItem.libraryId
  const frontLibraryDesignId = frontLogos.find(l => l.libraryId !== null)?.libraryId ?? null
  const backLibraryDesignId = backLogos.find(l => l.libraryId !== null)?.libraryId ?? null

  const [designLibrary, setDesignLibrary] = useState<any[]>([])
  const [loadingDesigns, setLoadingDesigns] = useState(false)
  const [libraryCategory, setLibraryCategory] = useState('')
  const [librarySearch, setLibrarySearch] = useState('')
  const [librarySearchOpen, setLibrarySearchOpen] = useState(false)
  const [libraryPage, setLibraryPage] = useState(1)
  const [libraryHasMore, setLibraryHasMore] = useState(true)
  const [libraryLoadingMore, setLibraryLoadingMore] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { authAPI } = await import('../services/api')
          const userData = await authAPI.getMe(token)
          setUser(userData)
        } catch (error) {
          // User data loading failed, but don't redirect - let interceptors handle it
          setUser(null)
        }
      }
    }
    loadUser()
  }, [token])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesAPI.getActive()
        setProductCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    const loadMockups = async () => {
      setIsLoadingMockups(true)
      setMockupError(null)
      try {
        const types: MockupTypeList[] = await mockupAPI.listMockupTypes()
        const safeTypes = Array.isArray(types) ? types : []
        setAllMockupTypes(safeTypes)
        setMockupTypes(safeTypes)

        if (safeTypes.length === 0) {
          setSelectedMockupType(null)
          setMockupVariants([])
          setSelectedVariant(null)
          setSelectedColor('')
          return
        }

        setSelectedMockupType((prev) => prev ?? safeTypes[0])
      } catch {
        setMockupError('Failed to load mockup types')
        setAllMockupTypes([])
        setMockupTypes([])
        setSelectedMockupType(null)
        setMockupVariants([])
        setSelectedVariant(null)
        setSelectedColor('')
      } finally {
        setIsLoadingMockups(false)
      }
    }

    loadMockups()
  }, [])

  // Filter mockup types by selected category
  useEffect(() => {
    if (!selectedCategory) {
      setMockupTypes(allMockupTypes)
    } else {
      const filtered = allMockupTypes.filter((type: any) => type.category_slug === selectedCategory)
      setMockupTypes(filtered)
      if (filtered.length > 0 && !filtered.find(t => t.id === selectedMockupType?.id)) {
        setSelectedMockupType(filtered[0])
      }
    }
  }, [selectedCategory, allMockupTypes, selectedMockupType?.id])

  useEffect(() => {
    const loadVariants = async () => {
      if (!selectedMockupType) {
        setMockupVariants([])
        setSelectedVariant(null)
        setSelectedColor('')
        return
      }
      try {
        const detail: MockupTypeDetail = await mockupAPI.getMockupType(selectedMockupType.slug)
        const variants = Array.isArray(detail?.variants) ? detail.variants : []
        setMockupVariants(variants)

        const colors = Array.from(new Set(variants.map((v) => v.color_name))).filter(Boolean).sort()
        const nextColor = colors.includes(selectedColor) ? selectedColor : (colors[0] || '')
        setSelectedColor(nextColor)

        const nextVariant = variants.find((v) => v.color_name === nextColor) || variants[0] || null
        setSelectedVariant(nextVariant)
      } catch {
        setMockupVariants([])
        setSelectedVariant(null)
        setSelectedColor('')
      }
    }

    loadVariants()
  }, [selectedMockupType?.slug])

  useEffect(() => {
    if (!selectedColor) {
      setSelectedVariant(mockupVariants[0] || null)
      return
    }
    const next = mockupVariants.find((v) => v.color_name === selectedColor) || mockupVariants[0] || null
    setSelectedVariant(next)
  }, [mockupVariants, selectedColor])

  useEffect(() => {
    setMockupImageFailed(false)
  }, [activeSide, selectedVariant?.id])

  useEffect(() => {
    const loadDesignLibrary = async (page = 1, append = false) => {
      if (page === 1) {
        setLoadingDesigns(true)
        setLibraryPage(1)
        setLibraryHasMore(true)
      } else {
        setLibraryLoadingMore(true)
      }
      
      try {
        const params = new URLSearchParams()
        if (libraryCategory) params.append('category', libraryCategory)
        if (librarySearch) params.append('search', librarySearch)
        params.append('page', String(page))
        params.append('page_size', '20')
        
        const response = await designLibraryAPI.listPublic(params.toString() ? `?${params.toString()}` : '')
        const results = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : []
        
        if (append && page > 1) {
          setDesignLibrary(prev => [...prev, ...results])
        } else {
          setDesignLibrary(results)
        }
        
        setLibraryHasMore(results.length === 20)
        setLibraryPage(page)
      } catch {
        if (!append) setDesignLibrary([])
      } finally {
        setLoadingDesigns(false)
        setLibraryLoadingMore(false)
      }
    }

    const loadCategories = async () => {
      try {
        const cats = await designCategoryAPI.list()
        setCategories(Array.isArray(cats) ? cats : [])
      } catch {
        setCategories([])
      }
    }

    loadDesignLibrary(1, false)
    loadCategories()

    const handleDesignLibraryUpdated = () => {
      loadDesignLibrary(1, false).catch(() => {})
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'designLibraryUpdatedAt') {
        handleDesignLibraryUpdated()
      }
    }

    window.addEventListener('designLibraryUpdated', handleDesignLibraryUpdated)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('designLibraryUpdated', handleDesignLibraryUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [libraryCategory, librarySearch])

  const loadMoreDesigns = async () => {
    if (!libraryHasMore || libraryLoadingMore) return
    
    const nextPage = libraryPage + 1
    setLibraryLoadingMore(true)
    
    try {
      const params = new URLSearchParams()
      if (libraryCategory) params.append('category', libraryCategory)
      if (librarySearch) params.append('search', librarySearch)
      params.append('page', String(nextPage))
      params.append('page_size', '20')
      
      const response = await designLibraryAPI.listPublic(params.toString() ? `?${params.toString()}` : '')
      const results = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : []
      
      setDesignLibrary(prev => [...prev, ...results])
      setLibraryHasMore(results.length === 20)
      setLibraryPage(nextPage)
    } catch {
      // Ignore errors for load more
    } finally {
      setLibraryLoadingMore(false)
    }
  }

  const hasDesign =
    frontLogos.some(l => !!l.url) ||
    backLogos.some(l => !!l.url) ||
    !!frontCustomText.trim() ||
    !!backCustomText.trim()

  const onMouseDownImage = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    e.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    setDraggingImage(true)
    setActiveElement('image')
    imageDragOffset.current = { dx: e.clientX - rect.left - imagePos.x, dy: e.clientY - rect.top - imagePos.y }
  }

  const onTouchStartImage = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    e.stopPropagation()
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    setDraggingImage(true)
    setActiveElement('image')
    imageDragOffset.current = { dx: touch.clientX - rect.left - imagePos.x, dy: touch.clientY - rect.top - imagePos.y }
  }

  const onMouseDownText = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    e.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    setDraggingText(true)
    setActiveElement('text')
    textDragOffset.current = { dx: e.clientX - rect.left - textPos.x, dy: e.clientY - rect.top - textPos.y }
  }

  const onTouchStartText = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    e.stopPropagation()
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    setDraggingText(true)
    setActiveElement('text')
    textDragOffset.current = { dx: touch.clientX - rect.left - textPos.x, dy: touch.clientY - rect.top - textPos.y }
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

  const onTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()

    if (draggingImage) {
      setImagePos({
        x: clamp(touch.clientX - rect.left - imageDragOffset.current.dx, 0, rect.width),
        y: clamp(touch.clientY - rect.top - imageDragOffset.current.dy, 0, rect.height),
      })
    }

    if (draggingText) {
      setTextPos({
        x: clamp(touch.clientX - rect.left - textDragOffset.current.dx, 0, rect.width),
        y: clamp(touch.clientY - rect.top - textDragOffset.current.dy, 0, rect.height),
      })
    }
  }

  const onMouseUp = () => {
    setDraggingImage(false)
    setDraggingText(false)
  }

  const buildPreviewFile = async (): Promise<File | null> => {
    if (!containerRef.current || !hasDesign) return null
    if (!selectedVariant) return null
    const rect = containerRef.current.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = 900; canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const baseImageUrl = variantImageUrl(selectedVariant, activeSide)
    if (!baseImageUrl) return null

    const tshirtImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = baseImageUrl
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

  const buildSidePreviewFile = async (side: 'front' | 'back'): Promise<File | null> => {
    if (!containerRef.current) return null
    if (!selectedVariant) return null

    const rect = containerRef.current.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const baseImageUrl = variantImageUrl(selectedVariant, side)
    if (!baseImageUrl) return null

    const tshirtImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = baseImageUrl
    })
    ctx.drawImage(tshirtImg, 0, 0, 900, 900)

    const sideLogos = side === 'front' ? frontLogos : backLogos

    const sideText = side === 'front' ? frontCustomText : backCustomText
    const sideTextPos = side === 'front' ? frontTextPos : backTextPos
    const sideTextScale = side === 'front' ? frontTextScale : backTextScale
    const sideTextRotation = side === 'front' ? frontTextRotation : backTextRotation
    const sideTextColor = side === 'front' ? frontTextColor : backTextColor
    const sideTextFont = side === 'front' ? frontTextFont : backTextFont
    const sideCharColors = side === 'front' ? frontCharColors : backCharColors

    for (const logo of sideLogos) {
      if (!logo.url) continue
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = logo.url
      })
      const imgDrawX = (logo.pos.x / rect.width) * 900
      const imgDrawY = (logo.pos.y / rect.height) * 900
      ctx.save()
      ctx.translate(imgDrawX, imgDrawY)
      ctx.rotate((logo.rotation * Math.PI) / 180)
      const logoW = 260 * logo.scale
      const logoH = (logoW * logoImg.height) / logoImg.width
      ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH)
      ctx.restore()
    }

    if (sideText.trim()) {
      const txtDrawX = (sideTextPos.x / rect.width) * 900
      const txtDrawY = (sideTextPos.y / rect.height) * 900
      ctx.save()
      ctx.translate(txtDrawX, txtDrawY)
      ctx.rotate((sideTextRotation * Math.PI) / 180)
      ctx.font = `bold ${64 * sideTextScale}px ${sideTextFont}`
      ctx.textBaseline = 'middle'

      let totalWidth = 0
      sideText.split('').forEach((char) => {
        totalWidth += ctx.measureText(char).width
      })

      let xOffset = -totalWidth / 2
      sideText.split('').forEach((char, idx) => {
        ctx.fillStyle = sideCharColors[idx] || sideTextColor
        ctx.fillText(char, xOffset, 0)
        xOffset += ctx.measureText(char).width
      })
      ctx.restore()
    }

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return null
    return new File([blob], `custom_${side}_preview.png`, { type: 'image/png' })
  }

  const onSubmit = async () => {
    if (!selectedMockupType || !selectedVariant) {
      alert('Please select a product and color')
      return
    }
    if (!hasDesign) {
      alert('Please upload an image or enter some text')
      return
    }
    setIsLoading(true)
    try {
      const [frontPreviewFile, backPreviewFile] = await Promise.all([
        buildSidePreviewFile('front'),
        buildSidePreviewFile('back'),
      ])
      const previewFile = frontPreviewFile || backPreviewFile
      if (!previewFile) { alert('Failed to generate preview'); return }

      const rect = containerRef.current?.getBoundingClientRect()
      const designName = customText 
        ? `Custom: ${customText.substring(0, 25)}` 
        : `Custom ${selectedMockupType.name}`

      const unitPrice = Number(selectedVariant.effective_price || selectedMockupType.base_price || 0)

      const buildSideData = (side: 'front' | 'back') => {
        const sideLogos = side === 'front' ? frontLogos : backLogos
        const sideText = side === 'front' ? frontCustomText : backCustomText
        const sideTextPos = side === 'front' ? frontTextPos : backTextPos
        const sideTextScale = side === 'front' ? frontTextScale : backTextScale
        const sideTextRotation = side === 'front' ? frontTextRotation : backTextRotation
        const sideTextColor = side === 'front' ? frontTextColor : backTextColor
        const sideTextFont = side === 'front' ? frontTextFont : backTextFont
        const sideCharColors = side === 'front' ? frontCharColors : backCharColors
        const libId = sideLogos.find(l => l.libraryId !== null)?.libraryId ?? null
        return {
          hasLogo: sideLogos.some(l => !!l.url),
          hasText: !!sideText.trim(),
          ...(libId ? { library_design_id: libId, design_library_item_id: libId } : {}),
          logos: sideLogos.filter(l => !!l.url).map(l => ({
            url: l.url,
            placement: { x: rect ? l.pos.x / rect.width : 0.5, y: rect ? l.pos.y / rect.height : 0.4, scale: l.scale, rotation: l.rotation }
          })),
          ...(sideText.trim() && {
            textPlacement: { x: rect ? sideTextPos.x / rect.width : 0.5, y: rect ? sideTextPos.y / rect.height : 0.6, scale: sideTextScale, rotation: sideTextRotation },
            text: sideText, textColor: sideTextColor, textFont: sideTextFont, charColors: sideCharColors
          }),
        }
      }

      const designData = {
        type: frontLogos.some(l=>!!l.url) || backLogos.some(l=>!!l.url) ? (customText ? 'image_and_text' : 'logo_on_mockup') : 'text_on_mockup',
        mockupType: selectedMockupType.slug,
        mockupTypeId: selectedMockupType.id,
        mockupVariantId: selectedVariant.id,
        variant: { size: selectedSize, color: selectedColor },
        sides: { front: buildSideData('front'), back: buildSideData('back') },
      }

      const primaryLogoFile = frontLogos.find(l => !!l.file)?.file || backLogos.find(l => !!l.file)?.file || undefined

      const productPayload = {
        name: designName,
        price: unitPrice,
        stock: 9999,
        design_logo: primaryLogoFile,
        design_preview: previewFile,
        design_logo_front: frontLogos.find(l => !!l.file)?.file || undefined,
        design_logo_back: backLogos.find(l => !!l.file)?.file || undefined,
        design_preview_front: frontPreviewFile || undefined,
        design_preview_back: backPreviewFile || undefined,
        design_data: designData,
      }

      // Use guest API if not logged in, otherwise use authenticated API
      const created = token 
        ? await customProductsAPI.createCustomProduct(token, productPayload)
        : await customProductsAPI.createGuestCustomProduct(productPayload)

      addItem({
        productId: Number(created.id),
        name: created.name,
        unitPrice: Number(created.price),
        imageUrl: toUrl(created.design_preview) || logoUrl,
        quantity: 1,
        options: { size: selectedSize, color: selectedColor, custom: created.design_data },
        isCustom: true,
      })
      navigate('/cart')
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message)
    } finally { setIsLoading(false) }
  }

  const handleContinueToSell = () => {
    if (!user?.is_seller) {
      alert('You need to be a seller to create products for sale')
      return
    }
    
    if (!selectedMockupType || !selectedVariant) {
      alert('Please select a product and color')
      return
    }
    if (!hasDesign) {
      alert('Please upload an image or enter some text')
      return
    }

    // Store design data in localStorage to pass to seller page
    const rect = containerRef.current?.getBoundingClientRect()
    const hasAnyLogo = frontLogos.some(l => !!l.url) || backLogos.some(l => !!l.url)
    const hasAnyText = !!frontCustomText.trim() || !!backCustomText.trim()

    const buildSellSideData = (side: 'front' | 'back') => {
      const sideLogos = side === 'front' ? frontLogos : backLogos
      const sideText = side === 'front' ? frontCustomText : backCustomText
      const sideTextPos = side === 'front' ? frontTextPos : backTextPos
      const sideTextScale = side === 'front' ? frontTextScale : backTextScale
      const sideTextRotation = side === 'front' ? frontTextRotation : backTextRotation
      const sideTextColor = side === 'front' ? frontTextColor : backTextColor
      const sideTextFont = side === 'front' ? frontTextFont : backTextFont
      const sideCharColors = side === 'front' ? frontCharColors : backCharColors
      const libId = sideLogos.find(l => l.libraryId !== null)?.libraryId ?? null
      return {
        hasLogo: sideLogos.some(l => !!l.url),
        hasText: !!sideText.trim(),
        ...(libId ? { library_design_id: libId, design_library_item_id: libId } : {}),
        logos: sideLogos.filter(l => !!l.url).map(l => ({
          url: l.url,
          placement: { x: rect ? l.pos.x / rect.width : 0.5, y: rect ? l.pos.y / rect.height : 0.4, scale: l.scale, rotation: l.rotation }
        })),
        ...(sideText.trim() && {
          textPlacement: { x: rect ? sideTextPos.x / rect.width : 0.5, y: rect ? sideTextPos.y / rect.height : 0.6, scale: sideTextScale, rotation: sideTextRotation },
          text: sideText, textColor: sideTextColor, textFont: sideTextFont, charColors: sideCharColors
        }),
      }
    }

    const designData = {
      type: hasAnyLogo && hasAnyText ? 'image_and_text' : hasAnyLogo ? 'logo_on_mockup' : 'text_on_mockup',
      mockupType: selectedMockupType.slug,
      mockupTypeId: selectedMockupType.id,
      mockupVariantId: selectedVariant.id,
      variant: { size: selectedSize, color: selectedColor },
      sides: { front: buildSellSideData('front'), back: buildSellSideData('back') }
    }

    localStorage.setItem('sellerDesignData', JSON.stringify({
      designData,
      mockupType: selectedMockupType,
      variant: selectedVariant
    }))

    navigate('/seller/designs/new')
  }

  const selectDesignFromLibrary = async (design: any) => {
    try {
      const id = Number(design?.id)
      const imageUrl = toUrl(design.image || design.design_logo || design.design_preview)
      if (!imageUrl) return
      setLogos(prev => {
        // Replace active logo slot with library design
        const next = [...prev]
        next[activeLogoIdx] = { ...next[activeLogoIdx], url: imageUrl, file: null, libraryId: Number.isFinite(id) ? id : null }
        return next
      })
    } catch (e) { console.error('Failed to load design:', e) }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 min-h-screen">
      <div className="max-w-[1480px] mx-auto px-1 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Header */}
        <div className="text-left mb-4 sm:mb-6 px-1">
          <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-1">
            Design Studio
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">Create custom apparel with images or text</p>
        </div>

        {/* Mockup Selector - Centered */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="text-center mb-3 sm:mb-6">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-base sm:text-lg mb-1">
              <Sparkles className="w-5 h-5" /> Select Product
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Choose your apparel type</p>
          </div>
          {isLoadingMockups ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading apparel types...</div>
          ) : mockupError ? (
            <div className="py-10 text-center">
              <div className="text-sm text-red-600 font-semibold">{mockupError}</div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 text-sm font-semibold border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : mockupTypes.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">No apparel types found. Add mockups from Django Admin.</div>
          ) : (
            <div className="p-1 flex gap-2 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide justify-start lg:justify-center">
              {mockupTypes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMockupType(m)}
                  className={`flex-shrink-0 w-24 sm:w-32 p-2 sm:p-3 rounded-xl border-2 transition-all ${
                    selectedMockupType?.id === m.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm scale-105'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  {m.preview_image ? (
                    <img
                      src={m.preview_image}
                      alt={m.name}
                      className="w-full h-14 object-contain"
                    />
                  ) : (
                    <div className="w-full h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="text-xs font-bold text-center mt-1 truncate">{m.name}</div>
                  <div className={`text-xs text-center font-semibold mt-0.5 ${selectedMockupType?.id === m.id ? 'text-emerald-600' : 'text-gray-500'}`}>
                    ৳{Number(m.base_price)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 px-2 py-4 space-y-4">

              {/* Upload Your Design — tabbed */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" /> Upload Your Design
                </label>
                <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
                  {(['upload','library'] as const).map(tab => (
                    <button key={tab} onClick={() => setUploadTab(tab)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${uploadTab === tab ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                {uploadTab === 'upload' ? (
                  <div className="space-y-2">
                    {/* Uploaded logos — row by row, up to 3 */}
                    {logos.some(l => !!l.url) && (
                      <div className="space-y-1.5">
                        {logos.map((logo, idx) => logo.url ? (
                          <div key={idx}
                            onClick={() => setActiveLogoIdx(idx)}
                            className={`flex items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all ${activeLogoIdx === idx ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-300'}`}
                          >
                            <img src={logo.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold ${activeLogoIdx === idx ? 'text-emerald-700' : 'text-gray-600'}`}>Logo {idx + 1}</p>
                              <p className="text-[10px] text-gray-500 truncate">{logo.file?.name || 'Library design'}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Remove this logo; compact the array
                                setLogos(prev => {
                                  const next = prev.filter((_, i) => i !== idx)
                                  return next.length > 0 ? next : [makeLogoItem()]
                                })
                                setActiveLogoIdx(0)
                              }}
                              className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null)}
                      </div>
                    )}

                    {/* Single file input — each upload adds a new logo row (up to 3) */}
                    {logos.filter(l => !!l.url).length < 3 && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          const url = URL.createObjectURL(f)
                          setLogos(prev => {
                            // Find first empty slot or append
                            const emptyIdx = prev.findIndex(l => !l.url)
                            if (emptyIdx !== -1) {
                              const next = [...prev]
                              next[emptyIdx] = { ...next[emptyIdx], file: f, url, libraryId: null }
                              setActiveLogoIdx(emptyIdx)
                              return next
                            } else if (prev.length < 3) {
                              const ni = prev.length
                              setActiveLogoIdx(ni)
                              return [...prev, { ...makeLogoItem(180+ni*40, 180+ni*30), file: f, url, libraryId: null }]
                            }
                            return prev
                          })
                          e.target.value = ''
                        }}
                        className="w-full text-sm border-2 border-dashed border-emerald-200 rounded-xl p-3 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-400 transition-all cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
                      />
                    )}

                    {logos.filter(l => !!l.url).length >= 3 && (
                      <p className="text-xs text-center text-gray-400 py-1">Maximum 3 logos reached</p>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <p className="text-xs text-blue-800 font-medium mb-1">💡 Tips:</p>
                      <ul className="text-xs text-blue-700 space-y-0.5 ml-3">
                        <li>• PNG with transparent background</li>
                        <li>• Min 500×500px, under 5MB</li>
                        <li>• Upload up to 3 logos per side</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2 overflow-hidden">
                      <div className="flex-1 min-w-0 transition-all duration-300" style={{ maxWidth: librarySearchOpen ? '0px' : '100%', opacity: librarySearchOpen ? 0 : 1, pointerEvents: librarySearchOpen ? 'none' : 'auto', overflow: 'hidden', flexShrink: librarySearchOpen ? 1 : 0 }}>
                        <select value={libraryCategory} onChange={(e) => setLibraryCategory(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
                          <option value="">All Categories</option>
                          {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div className="min-w-0 transition-all duration-300" style={{ flex: librarySearchOpen ? '1 1 0%' : '0 0 0%', maxWidth: librarySearchOpen ? '100%' : '0px', opacity: librarySearchOpen ? 1 : 0, pointerEvents: librarySearchOpen ? 'auto' : 'none', overflow: 'hidden' }}>
                        <div className="flex items-center gap-1 border border-emerald-400 rounded-lg px-2 py-2 bg-white">
                          <Search className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <input type="text" value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} placeholder="Search..."
                            ref={(el) => { if (librarySearchOpen && el) setTimeout(() => el.focus(), 320) }}
                            className="flex-1 text-xs bg-transparent focus:outline-none min-w-0" />
                          {librarySearch && <button onClick={() => setLibrarySearch('')}><X className="w-3 h-3 text-gray-400" /></button>}
                        </div>
                      </div>
                      <button onClick={() => { setLibrarySearchOpen(!librarySearchOpen); if (librarySearchOpen) setLibrarySearch('') }}
                        className={`p-2 rounded-lg border flex-shrink-0 transition-all ${librarySearchOpen ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-gray-500 hover:border-emerald-400 hover:bg-emerald-50'}`}>
                        {librarySearchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {loadingDesigns ? (
                      <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" /></div>
                    ) : designLibrary.length > 0 ? (
                      <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto"
                        onScroll={(e) => { const {scrollTop,scrollHeight,clientHeight} = e.currentTarget; if (scrollHeight-scrollTop <= clientHeight+10 && libraryHasMore && !libraryLoadingMore) loadMoreDesigns() }}>
                        {designLibrary.map((d) => (
                          <button key={d.id} onClick={() => selectDesignFromLibrary(d)}
                            className={`p-1.5 border rounded-lg hover:border-emerald-400 transition-all ${activeLogo?.libraryId === d.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}>
                            <img src={toUrl(d.image||d.design_logo||d.design_preview)||''} alt={d.name} className="w-full aspect-square object-cover rounded" />
                          </button>
                        ))}
                        {libraryLoadingMore && <div className="col-span-4 flex justify-center py-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600" /></div>}
                      </div>
                    ) : <p className="text-xs text-gray-400 text-center py-4">No designs available</p>}
                  </div>
                )}
              </div>

              {/* Text Design Section */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Type className="w-4 h-4 text-emerald-600" /> Your Text
                  </label>
                  <input value={customText}
                    onChange={(e) => { const t = e.target.value; setCustomText(t); setCharColors(prev => { const nc=[...prev]; while(nc.length<t.length) nc.push(textColor); return nc.slice(0,t.length) }); setSelectedCharIndices(new Set()) }}
                    placeholder="Type your custom text..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 bg-white transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Font Style</label>
                  <select value={textFont} onChange={(e) => setTextFont(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer">
                    {FONTS.map((f) => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
                  </select>
                </div>
                {customText.replace(/\s/g,'').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Select Letters</label>
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedCharIndices(new Set(customText.split('').map((_,i)=>i)))} className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-semibold hover:bg-emerald-200">All</button>
                        <button onClick={() => setSelectedCharIndices(new Set())} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-semibold hover:bg-gray-200">None</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-gray-200 min-h-[36px]">
                      {customText.split('').map((char, idx) => (
                        <button key={idx}
                          onClick={(e) => {
                            if (e.shiftKey && selectedCharIndices.size > 0) {
                              const last = Math.max(...Array.from(selectedCharIndices))
                              const [from,to] = [Math.min(last,idx), Math.max(last,idx)]
                              const next = new Set(selectedCharIndices); for(let i=from;i<=to;i++) next.add(i); setSelectedCharIndices(next)
                            } else {
                              const next = new Set(selectedCharIndices); if(next.has(idx)) next.delete(idx); else next.add(idx); setSelectedCharIndices(next)
                            }
                          }}
                          className={`px-1.5 py-0.5 text-base font-bold rounded transition-all ${selectedCharIndices.has(idx) ? 'ring-2 ring-emerald-500 bg-emerald-50 scale-105' : 'hover:bg-gray-50'}`}
                          style={{ color: charColors[idx]||textColor, whiteSpace:'pre' }}>{char}</button>
                      ))}
                    </div>
                    {selectedCharIndices.size > 0 && <p className="text-[10px] text-emerald-600 mt-1">{selectedCharIndices.size} selected — pick color below</p>}
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    {selectedCharIndices.size > 0 ? `Color for ${selectedCharIndices.size} selected` : 'Default Text Color'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TEXT_COLORS.map((c) => (
                      <button key={c.value}
                        onClick={() => {
                          if (selectedCharIndices.size > 0) {
                            setCharColors(prev => { const nc=[...prev]; selectedCharIndices.forEach(i => { nc[i]=c.value }); return nc })
                          } else {
                            setTextColor(c.value)
                            setCharColors(prev => prev.map(col => col===textColor ? c.value : col))
                          }
                        }}
                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-105 ${
                          (selectedCharIndices.size>0 ? [...selectedCharIndices].every(i=>charColors[i]===c.value) : textColor===c.value)
                            ? 'border-emerald-500 scale-105 shadow-md ring-2 ring-emerald-200' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: c.value }} title={c.name} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel - Mockup Editor (Larger) */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border-2 border-emerald-200 px-3 py-4">
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
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">{selectedMockupType?.name || 'Select Product'}</span>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="mb-4 bg-white rounded-xl shadow-sm border border-emerald-100 p-2">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h4 className="font-semibold text-gray-800 text-sm">Product Specifications</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Apparel Size</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:border-gray-300 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Fabric Color</label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      disabled={!selectedMockupType || mockupVariants.length === 0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:border-gray-300 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      {!selectedMockupType || mockupVariants.length === 0 ? (
                        <option value="">No colors available</option>
                      ) : null}
                      {Array.from(new Set(mockupVariants.map((v) => v.color_name))).filter(Boolean).sort().map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div
                ref={containerRef}
                className="relative w-full max-w-sm mx-auto aspect-square select-none"
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchMove={onTouchMove}
                onTouchEnd={onMouseUp}
              >
                {selectedVariant && !mockupImageFailed ? (
                  <img
                    src={variantImageUrl(selectedVariant, activeSide)}
                    alt="mockup"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setMockupImageFailed(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{selectedVariant ? 'Mockup image not found' : 'Select an apparel type'}</p>
                    </div>
                  </div>
                )}

                {logos.map((logo, idx) => logo.url ? (
                  <div
                    key={idx}
                    className="absolute"
                    style={{ left: logo.pos.x, top: logo.pos.y, transform: 'translate(-50%, -50%)' }}
                    onMouseEnter={() => { setHoveredElement('image'); setActiveLogoIdx(idx) }}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <img
                      src={logo.url}
                      alt="design"
                      onMouseDown={(e) => { setActiveLogoIdx(idx); onMouseDownImage(e) }}
                      onTouchStart={(e) => { setActiveLogoIdx(idx); onTouchStartImage(e) }}
                      className="cursor-move drop-shadow-sm touch-none"
                      style={{
                        width: `${260 * logo.scale}px`,
                        transform: `rotate(${logo.rotation}deg)`,
                        transition: (draggingImage && activeLogoIdx === idx) ? 'none' : 'transform 0.1s',
                      }}
                      draggable={false}
                    />
                    {hoveredElement === 'image' && activeLogoIdx === idx && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateLogo(idx, { file: null, url: '', libraryId: null }) }}
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all z-10"
                        style={{ transform: 'translate(50%, -50%)' }}
                        title="Delete image"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : null)}

                {(activeSide === 'front' ? frontCustomText : backCustomText) && (
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
                      onTouchStart={onTouchStartText}
                      className="cursor-move select-none relative touch-none"
                      style={{
                        transform: `rotate(${textRotation}deg) scale(${textScale})`,
                        transition: draggingText ? 'none' : 'transform 0.1s',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        fontFamily: activeSide === 'front' ? frontTextFont : backTextFont,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                      }}
                    >
                      {(activeSide === 'front' ? frontCustomText : backCustomText).split('').map((char, idx) => (
                        <span
                          key={idx}
                          style={{
                            color: (activeSide === 'front' ? frontCharColors : backCharColors)[idx] || (activeSide === 'front' ? frontTextColor : backTextColor),
                            textShadow: ((activeSide === 'front' ? frontCharColors : backCharColors)[idx] || (activeSide === 'front' ? frontTextColor : backTextColor)) === '#FFFFFF' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
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
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all z-10"
                        style={{
                          transform: 'translate(50%, -50%)'
                        }}
                        title="Delete text"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

              
              </div>

              {/* Front/Back Toggle Tabs */}
              <div className="flex gap-2 mt-4 justify-center">
                <button
                  onClick={() => setActiveSide('front')}
                  className={`py-2 px-6 rounded-lg text-sm font-semibold transition-all ${
                    activeSide === 'front' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Front Side
                </button>
                <button
                  onClick={() => setActiveSide('back')}
                  className={`py-2 px-6 rounded-lg text-sm font-semibold transition-all ${
                    activeSide === 'back' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Back Side
                </button>
              </div>

              <>
                {/* Quick Controls */}
                {hasDesign && (
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button onClick={() => activeElement === 'image' ? setImageRotation(imageRotation - 1) : setTextRotation(textRotation - 1)} className="p-1.5 hover:bg-white rounded" title="Rotate -1°">
                        <RotateCcw className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={() => activeElement === 'image' ? setImageRotation(imageRotation + 1) : setTextRotation(textRotation + 1)} className="p-1.5 hover:bg-white rounded" title="Rotate +1°">
                        <RotateCw className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button onClick={() => activeElement === 'image' ? setImageScale(Math.max(0.05, imageScale - 0.01)) : setTextScale(Math.max(0.05, textScale - 0.01))} className="p-1.5 hover:bg-white rounded">
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={() => activeElement === 'image' ? setImageScale(Math.min(1.5, imageScale + 0.01)) : setTextScale(Math.min(1.5, textScale + 0.01))} className="p-1.5 hover:bg-white rounded">
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

                {/* Transform Controls */}
                <div className="mt-4 bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className="font-semibold text-gray-800 text-sm">Transform Controls</h3>
                </div>
                
                {/* Element Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveElement('image')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      activeElement === 'image' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setActiveElement('text')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      activeElement === 'text' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Text
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Size Control */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">Scale</label>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                        {Math.round((activeElement === 'image' ? imageScale : textScale) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => activeElement === 'image' ? setImageScale(Math.max(0.05, imageScale - 0.05)) : setTextScale(Math.max(0.05, textScale - 0.05))} 
                        className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <ZoomOut className="w-3 h-3 text-gray-600" />
                      </button>
                      <input 
                        type="range" 
                        min={0.05} 
                        max={1.5} 
                        step={0.01} 
                        value={activeElement === 'image' ? imageScale : textScale} 
                        onChange={(e) => activeElement === 'image' ? setImageScale(Number(e.target.value)) : setTextScale(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <button 
                        onClick={() => activeElement === 'image' ? setImageScale(Math.min(1.5, imageScale + 0.1)) : setTextScale(Math.min(1.5, textScale + 0.1))} 
                        className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <ZoomIn className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Rotation Control */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">Rotate</label>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                        {activeElement === 'image' ? imageRotation : textRotation}°
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => activeElement === 'image' ? setImageRotation(imageRotation - 15) : setTextRotation(textRotation - 15)} 
                        className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <RotateCcw className="w-3 h-3 text-gray-600" />
                      </button>
                      <input 
                        type="range" 
                        min={-180} 
                        max={180} 
                        step={1} 
                        value={activeElement === 'image' ? imageRotation : textRotation} 
                        onChange={(e) => activeElement === 'image' ? setImageRotation(Number(e.target.value)) : setTextRotation(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <button 
                        onClick={() => activeElement === 'image' ? setImageRotation(imageRotation + 15) : setTextRotation(textRotation + 15)} 
                        className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <RotateCw className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="mt-4">
                <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-md border border-emerald-100">
                  {/* Product info + price */}
                  <div className="flex flex-col justify-center pl-2 min-w-0 flex-1">
                    <div className="text-xs font-semibold text-gray-800 truncate">{selectedMockupType?.name || 'Select Product'}</div>
                    <div className="text-[12px] text-gray-500">{selectedSize} • {selectedColor}</div>
                    <div className="text-lg font-black text-emerald-600 leading-tight">৳{Number(selectedVariant?.effective_price || selectedMockupType?.base_price || 0)}</div>
                  </div>
                  {/* Add to Cart button */}
                  <button
                    disabled={isLoading || !hasDesign || !selectedVariant}
                    onClick={onSubmit}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                  {/* Sell button for sellers */}
                  {user?.is_seller && (
                    <button
                      disabled={isLoading || !hasDesign || !selectedVariant}
                      onClick={handleContinueToSell}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Sell
                    </button>
                  )}
                </div>
              </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignStudio
