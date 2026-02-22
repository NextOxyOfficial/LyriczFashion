import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../services/api'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://lyriczfashion.com'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search') || ''

  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState(searchParam)
  const [sort, setSort] = useState<'featured' | 'newest' | 'price_low' | 'price_high'>('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

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

    // Filter by category (mockup type) from URL parameter
    if (categoryParam) {
      const catLower = categoryParam.toLowerCase()
      list = list.filter((p: any) => {
        const category = String(p?.category_name ?? '').toLowerCase()
        const mockupType = String(p?.mockup_type_name ?? '').toLowerCase()
        // Use includes matching so "Polo Shirt" matches "Polo Shirts", etc.
        return category === catLower || mockupType === catLower
          || category.includes(catLower) || catLower.includes(category)
          || mockupType.includes(catLower) || catLower.includes(mockupType)
      })
    }

    // Filter by search query
    if (q) {
      list = list.filter((p: any) => {
        const name = String(p?.name ?? '').toLowerCase()
        const desc = String(p?.description ?? '').toLowerCase()
        const store = String(p?.store_name ?? '').toLowerCase()
        const designer = String(p?.designer_name ?? '').toLowerCase()
        const category = String(p?.category_name ?? '').toLowerCase()
        return name.includes(q) || desc.includes(q)
          || store.includes(q) || designer.includes(q) || category.includes(q)
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
  }, [items, query, sort, categoryParam])

  // Pagination calculations
  const totalPages = Math.ceil(visibleItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = visibleItems.slice(startIndex, endIndex)

  // Sync query state with URL search param when it changes externally
  useEffect(() => {
    setQuery(searchParam)
  }, [searchParam])

  // Update URL when user types in the search box
  const handleQueryChange = (val: string) => {
    setQuery(val)
    const next = new URLSearchParams(searchParams)
    if (val.trim()) {
      next.set('search', val.trim())
    } else {
      next.delete('search')
    }
    setSearchParams(next, { replace: true })
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [query, sort, categoryParam])

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Products</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {categoryParam ? `${categoryParam} Products` : 'Products'}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, visibleItems.length)} of {visibleItems.length} products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedItems.map((p) => (
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
                  designerName={p.designer_name}
                  storeSlug={p.creator_store_slug || p.store_slug}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const showPage = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      
                      if (!showPage) {
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 text-gray-400">...</span>
                        }
                        return null
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-emerald-500 text-white font-semibold'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products
