import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const featuredProducts = [
  { id: 1, name: 'Classic White T-Shirt', price: 1200, discountPrice: 999, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { id: 2, name: 'Denim Jacket', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
  { id: 3, name: 'Summer Dress', price: 2800, discountPrice: 2200, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400' },
  { id: 4, name: 'Casual Sneakers', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
]

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Style, <br />Your Story
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Discover the latest trends in fashion. Shop our exclusive collection of clothing, accessories, and more.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-full mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Free Shipping</h3>
              <p className="text-sm text-gray-500">On orders over ৳2000</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Secure Payment</h3>
              <p className="text-sm text-gray-500">100% secure checkout</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-full mb-4">
                <RefreshCw className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Easy Returns</h3>
              <p className="text-sm text-gray-500">7 days return policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-full mb-4">
                <Headphones className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800">24/7 Support</h3>
              <p className="text-sm text-gray-500">Dedicated support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/products?category=men" className="group relative overflow-hidden rounded-2xl h-80">
              <img
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600"
                alt="Men's Fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">Men's Fashion</h3>
                <p className="text-white/80">Explore Collection</p>
              </div>
            </Link>
            <Link to="/products?category=women" className="group relative overflow-hidden rounded-2xl h-80">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
                alt="Women's Fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">Women's Fashion</h3>
                <p className="text-white/80">Explore Collection</p>
              </div>
            </Link>
            <Link to="/products?category=accessories" className="group relative overflow-hidden rounded-2xl h-80">
              <img
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600"
                alt="Accessories"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">Accessories</h3>
                <p className="text-white/80">Explore Collection</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Get the latest updates on new arrivals, special offers, and exclusive deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Home
