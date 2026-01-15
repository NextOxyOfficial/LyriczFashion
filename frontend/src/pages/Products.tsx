import { useState, useEffect } from 'react'
import { Filter, Grid, List } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../services/api'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsAPI.getAll()
        setItems(data)
      } catch {
        setItems([])
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Designs</h1>
          <p className="text-gray-500 mt-1">Showing {items.length} designs</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 md:hidden"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
          </select>
          
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <Grid className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {['All', 'Men', 'Women', 'Accessories', 'Shoes'].map((cat) => (
                <li key={cat}>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    <span className="ml-3 text-gray-700">{cat}</span>
                  </label>
                </li>
              ))}
            </ul>

            <h3 className="font-semibold text-lg mt-6 mb-4">Price Range</h3>
            <div className="space-y-2">
              {['Under ৳1000', '৳1000 - ৳2000', '৳2000 - ৳3000', 'Over ৳3000'].map((range) => (
                <label key={range} className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  <span className="ml-3 text-gray-700">{range}</span>
                </label>
              ))}
            </div>

            <h3 className="font-semibold text-lg mt-6 mb-4">Size</h3>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:border-primary-500 hover:text-primary-600"
                >
                  {size}
                </button>
              ))}
            </div>

            <button className="w-full mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                discountPrice={p.discount_price ? Number(p.discount_price) : undefined}
                imageUrl={toUrl(p.design_preview || p.image) || 'https://via.placeholder.com/600x600'}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
