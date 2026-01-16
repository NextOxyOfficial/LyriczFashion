import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../services/api'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

const Products = () => {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'featured' | 'newest' | 'price_low' | 'price_high'>('featured')

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await productsAPI.getAll()
        setItems(data)
      } catch {
        setItems([])
        setError('Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase()

    const getUnitPrice = (p: any) => {
      const d = p?.discount_price
      const base = p?.price
      return Number(d ?? base ?? 0)
    }

    let list = items

    if (q) {
      list = list.filter((p: any) => {
        const name = String(p?.name ?? '').toLowerCase()
        const desc = String(p?.description ?? '').toLowerCase()
        return name.includes(q) || desc.includes(q)
      })
    }

    if (sort === 'newest') {
      list = [...list].sort((a: any, b: any) => Number(b?.id ?? 0) - Number(a?.id ?? 0))
    } else if (sort === 'price_low') {
      list = [...list].sort((a: any, b: any) => getUnitPrice(a) - getUnitPrice(b))
    } else if (sort === 'price_high') {
      list = [...list].sort((a: any, b: any) => getUnitPrice(b) - getUnitPrice(a))
    }

    return list
  }, [items, query, sort])

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Products</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 mt-1 text-sm">Showing {visibleItems.length} products</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-72 pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price_low">Sort: Price low → high</option>
              <option value="price_high">Sort: Price high → low</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5">
            {error}
          </div>
        )}

        {!error && isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-72 bg-gray-100 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse mt-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !isLoading && visibleItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="text-lg font-semibold text-gray-900">No products found</div>
            <div className="text-sm text-gray-500 mt-2">Try a different search.</div>
          </div>
        )}

        {!error && !isLoading && visibleItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleItems.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                discountPrice={p.discount_price ? Number(p.discount_price) : undefined}
                imageUrl={
                  toUrl(p.design_preview_front || p.design_preview || p.image || p.image_url) ||
                  'https://via.placeholder.com/600x600'
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
