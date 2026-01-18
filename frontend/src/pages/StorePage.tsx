import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Copy } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI, storeAPI } from '../services/api'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

type Store = {
  id: number
  name: string
  slug: string
  logo?: string | null
  banner?: string | null
  description?: string | null
}

type Product = {
  id: number
  name: string
  price: string
  discount_price?: string | null
  design_preview?: string | null
  image?: string | null
  designer_name?: string | null
}

const StorePage = () => {
  const { slug } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [copied, setCopied] = useState(false)

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
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-lg">Store not found</div>
      </div>
    )
  }

  const storePublicUrl = `${window.location.origin}/store/${store.slug}`

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
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-pink-500">
            <div className="relative">
              {store.banner ? (
                <img src={toUrl(store.banner)} alt={store.name} className="w-full h-64 object-cover opacity-40" />
              ) : (
                <div className="w-full h-64 opacity-40 bg-black" />
              )}
              <div className="absolute inset-0 p-8 flex items-end">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border border-white/30">
                    {store.logo ? (
                      <img src={toUrl(store.logo)} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/80">Logo</div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{store.name}</h1>
                    {store.description && <p className="text-white/90 mt-1 max-w-2xl line-clamp-2">{store.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-white/80 text-sm break-all">{storePublicUrl}</p>
                      <button
                        type="button"
                        onClick={onCopyStoreLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="text-sm text-gray-500">{products.length} items</div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-gray-600">No products published yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                discountPrice={p.discount_price ? Number(p.discount_price) : undefined}
                imageUrl={toUrl(p.design_preview || p.image) || 'https://via.placeholder.com/600x600'}
                designerName={p.designer_name || undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default StorePage
