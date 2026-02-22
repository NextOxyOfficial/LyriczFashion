import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Copy, Edit2, Save, X, Upload } from 'lucide-react'
import { authAPI, productsAPI, storeAPI, toApiUrl } from '../services/api'
import ProductCard from '../components/ProductCard'

const toUrl = toApiUrl

type Store = {
  id: number
  name: string
  slug: string
  logo?: string | null
  banner?: string | null
  description?: string | null
  owner_id?: number
}

type Product = {
  id: number
  name: string
  price: string
  discount_price?: string | null
  design_preview?: string | null
  image?: string | null
  designer_name?: string | null
  store_slug?: string | null
  creator_store_slug?: string | null
}

const StorePage = () => {
  const { slug } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [copied, setCopied] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      setIsLoading(true)
      try {
        const s = await storeAPI.getStoreBySlug(slug)
        console.log('Store loaded:', s)
        setStore(s)
        const list = await productsAPI.getByStoreSlug(slug)
        console.log('Products loaded:', list)
        setProducts(list)
        
        // Check if user is logged in and get their ID
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const userData = await authAPI.getMe(token)
            setCurrentUserId(userData.id)
          } catch (err) {
            console.log('Not authenticated')
          }
        }
      } catch (error) {
        console.error('Error loading store/products:', error)
        setStore(null)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [slug])

  if (isLoading) {
    return (
      <div className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8 py-12">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8 py-12">
        <div className="text-lg">Store not found</div>
      </div>
    )
  }

  const storePublicUrl = `${window.location.origin}/store/${store.slug}`

  const handleSaveChanges = async () => {
    if (!store) return
    setIsSaving(true)
    try {
      const formData = new FormData()
      if (logoFile) formData.append('logo', logoFile)
      if (bannerFile) formData.append('banner', bannerFile)
      
      await storeAPI.updateStore(store.slug, formData)
      
      // Reload store data
      const updatedStore = await storeAPI.getStoreBySlug(store.slug)
      setStore(updatedStore)
      setIsEditMode(false)
      setLogoFile(null)
      setBannerFile(null)
    } catch (error) {
      console.error('Failed to update store:', error)
      alert('Failed to update store. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setLogoFile(null)
    setBannerFile(null)
  }

  const onCopyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(storePublicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback for some browsers or blocked permissions
      try {
        window.prompt('Copy this link:', storePublicUrl)
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white">
        <div className="max-w-[1480px] mx-auto px-1 sm:px-6 lg:px-8 mt-4 sm:py-8">
          {/* Edit Mode Toggle - Only show to store owner */}
          {currentUserId && store.owner_id === currentUserId && (
            <div className="flex justify-end mb-4">
              {!isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Store
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-primary-600 to-pink-500">
            <div className="relative">
              {isEditMode ? (
                <div className="w-full h-32 sm:h-56 bg-black/40 flex items-center justify-center">
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-white">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Upload Banner Image</span>
                    <span className="text-xs opacity-80">Recommended: 1480x256px</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {bannerFile && (
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      New banner selected
                    </div>
                  )}
                </div>
              ) : store.banner ? (
                <img src={toUrl(store.banner)} alt={store.name} className="w-full h-32 sm:h-56 object-cover opacity-40" />
              ) : (
                <div className="w-full h-32 sm:h-56 opacity-40 bg-black" />
              )}
              <div className="absolute inset-0 p-4 sm:p-8 flex items-end">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/20 border border-white/30 flex-shrink-0">
                    {isEditMode ? (
                      <label className="cursor-pointer w-full h-full flex items-center justify-center text-white/80 hover:bg-white/30 transition-colors">
                        <Upload className="w-6 h-6" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    ) : store.logo ? (
                      <img src={toUrl(store.logo)} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/80">Logo</div>
                    )}
                    {logoFile && isEditMode && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-3xl font-bold text-white truncate">{store.name}</h1>
                    {store.description && <p className="text-white/90 text-xs sm:text-base mt-0.5 line-clamp-1 sm:line-clamp-2">{store.description}</p>}
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-white/80 text-xs truncate">{storePublicUrl}</p>
                      <button
                        type="button"
                        onClick={onCopyStoreLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-4 sm:py-8">
        <div className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Products</h2>
              <p className="text-gray-500 text-xs sm:text-base mt-0.5">{products.length} {products.length === 1 ? 'item' : 'items'} available</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-lg font-semibold text-gray-900">No products published yet</div>
              <p className="text-gray-500 mt-2">Check back later for new products from this store.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={Number(p.price)}
                  discountPrice={p.discount_price ? Number(p.discount_price) : undefined}
                  imageUrl={
                    toUrl(p.design_preview || p.image) ||
                    'https://via.placeholder.com/600x600'
                  }
                  designerName={p.designer_name || undefined}
                  storeSlug={p.creator_store_slug ?? p.store_slug ?? undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default StorePage
