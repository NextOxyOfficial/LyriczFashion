import { useState } from 'react'
import { Filter, Grid, List } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const allProducts = [
  { id: 1, name: 'Classic White T-Shirt', price: 1200, discountPrice: 999, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { id: 2, name: 'Denim Jacket', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
  { id: 3, name: 'Summer Dress', price: 2800, discountPrice: 2200, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400' },
  { id: 4, name: 'Casual Sneakers', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { id: 5, name: 'Formal Shirt', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400' },
  { id: 6, name: 'Leather Belt', price: 800, discountPrice: 650, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
  { id: 7, name: 'Sunglasses', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
  { id: 8, name: 'Hoodie', price: 2500, discountPrice: 1999, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
]

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-1">Showing {allProducts.length} products</p>
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
            {allProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
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
