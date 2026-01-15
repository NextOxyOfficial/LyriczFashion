import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Wand2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../services/api'

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'new' | 'bestseller' | 'sale'>('new')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsAPI.getFeed()
        
        // Filter products based on active tab
        let filteredProducts = data
        if (activeTab === 'new') {
          // Show newest products (last 20 products)
          filteredProducts = data.slice(-20).reverse()
        } else if (activeTab === 'bestseller') {
          // Show products with discount (simulating best sellers)
          filteredProducts = data.filter((p: any) => p.discount_price).slice(0, 20)
          // If not enough discounted products, fill with regular products
          if (filteredProducts.length < 20) {
            filteredProducts = [...filteredProducts, ...data.filter((p: any) => !p.discount_price).slice(0, 20 - filteredProducts.length)]
          }
        } else if (activeTab === 'sale') {
          // Show only products with discount
          filteredProducts = data.filter((p: any) => p.discount_price).slice(0, 20)
        }
        
        setAllProducts(filteredProducts.slice(0, 20))
      } catch {
        setAllProducts([])
      }
    }
    loadProducts()
  }, [activeTab])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Move in opposite direction (multiply by negative value)
    setMousePosition({ x: -x * 0.05, y: -y * 0.05 })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <div>
      {/* Hero Section - TeeSpace Style */}
      <section className="py-4 bg-white">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative overflow-hidden rounded-3xl"
            style={{ backgroundColor: '#86efac' }}
          >
            {/* Decorative dots pattern - top left */}
            <div className="absolute top-16 left-16 w-20 h-20 opacity-30 hidden lg:block">
              <div className="grid grid-cols-5 gap-2">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* Decorative dots pattern - bottom left */}
            <div className="absolute bottom-24 left-24 w-16 h-16 opacity-25 hidden lg:block">
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[460px] py-12 lg:py-16">
              {/* Left Content */}
              <div className="relative z-10 pl-8 lg:pl-16">
                <h1 className="text-[40px] md:text-[48px] lg:text-[52px] font-bold text-gray-900 mb-4 leading-[1.15] tracking-tight">
                  T-shirt printing<br />
                  made easy.
                </h1>
                <p className="text-[15px] text-gray-700 mb-6 font-normal">
                  Print shirts for yourself or your online business
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Shop now
                </Link>
              </div>

              {/* Right Content - Hero Image */}
              <div 
                className="relative h-[450px] lg:h-[500px] flex items-center justify-center lg:justify-end pr-8"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  ref={imageRef}
                  className="relative"
                  style={{
                    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
                    alt="TeeSpace Custom T-Shirts"
                    className="w-full max-w-[500px] h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping by Categories */}
      <section className="py-8 bg-white">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Shopping by Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* T-shirt */}
            <Link to="/products?category=tshirt" className="flex flex-col items-center group">
              <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop"
                  alt="T-shirt"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900">T-shirt <sup className="text-xs text-gray-500">15</sup></h3>
            </Link>

            {/* Long-sleeves */}
            <Link to="/products?category=longsleeves" className="flex flex-col items-center group">
              <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop"
                  alt="Long-sleeves"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Long-sleeves <sup className="text-xs text-gray-500">8</sup></h3>
            </Link>

            {/* Sweater */}
            <Link to="/products?category=sweater" className="flex flex-col items-center group">
              <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop"
                  alt="Sweater"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Sweater <sup className="text-xs text-gray-500">18</sup></h3>
            </Link>

            {/* Hoodies */}
            <Link to="/products?category=hoodies" className="flex flex-col items-center group">
              <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop"
                  alt="Hoodies"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Hoodies <sup className="text-xs text-gray-500">9</sup></h3>
            </Link>

            {/* Tanktop */}
            <Link to="/products?category=tanktop" className="flex flex-col items-center group">
              <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=300&h=300&fit=crop"
                  alt="Tanktop"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Tanktop <sup className="text-xs text-gray-500">6</sup></h3>
            </Link>
          </div>
        </div>
      </section>

      {/* How to design and order custom T-shirts */}
      <section className="py-20 bg-white">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 lg:p-16">
            <h2 className="text-5xl lg:text-5xl font-bold text-center text-gray-900 mb-12">
              How to design and order custom T-shirts
            </h2>
            
            <div className="grid text-base grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Steps */}
              <div className="relative">
                {/* Step 1 */}
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base font-bold shadow-sm">
                      1
                    </div>
                    {/* Dashed line */}
                    <div className="w-px h-10 my-2 border-l-2 border-dashed border-gray-300"></div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[18px] font-bold text-gray-900 leading-snug">
                      Choose from 412 custom products in<br />our catalog
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white text-emerald-500 flex items-center justify-center text-base font-bold shadow-sm">
                      2
                    </div>
                    {/* Dashed line */}
                    <div className="w-px h-10 my-2 border-l-2 border-dashed border-gray-300"></div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[18px] font-bold text-gray-900 leading-snug">
                      Customize your design with graphics,<br />text or your own uploaded images.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white text-emerald-500 flex items-center justify-center text-base font-bold shadow-sm">
                      3
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[18px] font-bold text-gray-900 leading-snug">
                      Get your order sent to your door with<br />free standard shipping.
                    </p>
                  </div>
                </div>

                {/* Create Design Button */}
                <div className="mt-8 ml-14">
                  <Link
                    to="/design-studio"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    <Wand2 className="w-5 h-5" />
                    Create Design
                  </Link>
                </div>
              </div>

              {/* Right side - Mockup Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <img
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=350&fit=crop"
                    alt="Design interface mockup"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All products */}
      <section className="py-8 bg-white">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('new')}
                className={`text-2xl lg:text-3xl font-bold transition-colors ${
                  activeTab === 'new' ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                New Arrivals
              </button>
              <button
                onClick={() => setActiveTab('bestseller')}
                className={`text-2xl lg:text-3xl font-bold transition-colors ${
                  activeTab === 'bestseller' ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                Best Seller
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={`text-2xl lg:text-3xl font-bold transition-colors ${
                  activeTab === 'sale' ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                Sale
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                discountPrice={product.discount_price ? Number(product.discount_price) : undefined}
                imageUrl={product.image_url || product.design_preview || product.image || 'https://via.placeholder.com/300x400'}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors"
            >
              See All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
{/* Promotional Banners */}
      <section className="py-8 bg-white">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thousands of free templates */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50 p-10 lg:p-14 min-h-[380px] flex items-center">
              <div className="relative z-10 max-w-md">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
                  Thousands of<br />free templates
                </h2>
                <p className="text-gray-600 mb-7 text-base">
                  Free and easy way to bring your ideas to life
                </p>
                <Link
                  to="/design-studio"
                  className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-full hover:bg-emerald-600 transition-colors"
                >
                  Explore More
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              {/* Template Images Grid */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-4 w-80">
                <img
                  src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&h=250&fit=crop"
                  alt="Template 1"
                  className="w-36 h-44 rounded-2xl object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=250&fit=crop"
                  alt="Template 2"
                  className="w-36 h-44 rounded-2xl object-cover mt-10"
                />
                <img
                  src="https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=200&h=250&fit=crop"
                  alt="Template 3"
                  className="w-36 h-44 rounded-2xl object-cover -mt-6"
                />
                <img
                  src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200&h=250&fit=crop"
                  alt="Template 4"
                  className="w-36 h-44 rounded-2xl object-cover mt-4"
                />
              </div>
            </div>

            {/* Create your unique style */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 p-10 lg:p-14 min-h-[380px] flex items-center">
              <div className="relative z-10 max-w-md">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
                  Create your<br />unique style
                </h2>
                <p className="text-gray-600 mb-7 text-base">
                  Free and easy way to create your ideas to life
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-full hover:bg-emerald-600 transition-colors"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              {/* T-shirt on hanger image */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <img
                  src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop"
                  alt="Custom T-shirt"
                  className="w-64 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      

      {/* Free design templates */}
      <section className="py-8 bg-white">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Free design templates</h2>
            <Link
              to="/products"
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Astronauts */}
            <Link to="/products?category=astronauts" className="group">
              <div className="flex gap-1 mb-4 min-h-[280px]">
                <div className="w-1/2 aspect-[3/4] bg-gray-200 rounded-tl-2xl rounded-bl-2xl"></div>
                <div className="w-1/2 flex flex-col gap-1">
                  <div className="w-full flex-1 bg-gray-200 rounded-tr-2xl"></div>
                  <div className="w-full flex-1 bg-gray-200 rounded-br-2xl"></div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">Astronauts</h3>
              <p className="text-sm text-gray-500">85 resources</p>
            </Link>

            {/* Quote collection */}
            <Link to="/products?category=quotes" className="group">
              <div className="flex gap-1 mb-4 min-h-[280px]">
                <div className="w-1/2 aspect-[3/4] bg-gray-200 rounded-tl-2xl rounded-bl-2xl"></div>
                <div className="w-1/2 flex flex-col gap-1">
                  <div className="w-full flex-1 bg-gray-200 rounded-tr-2xl"></div>
                  <div className="w-full flex-1 bg-gray-200 rounded-br-2xl"></div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">Quote that collection</h3>
              <p className="text-sm text-gray-500">6 resources</p>
            </Link>

            {/* Art Styles */}
            <Link to="/products?category=art" className="group">
              <div className="flex gap-1 mb-4 min-h-[280px]">
                <div className="w-1/2 aspect-[3/4] bg-gray-200 rounded-tl-2xl rounded-bl-2xl"></div>
                <div className="w-1/2 flex flex-col gap-1">
                  <div className="w-full flex-1 bg-gray-200 rounded-tr-2xl"></div>
                  <div className="w-full flex-1 bg-gray-200 rounded-br-2xl"></div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">Art Styles</h3>
              <p className="text-sm text-gray-500">68 resources</p>
            </Link>

            {/* +28 Collections */}
            <Link to="/products" className="group">
              <div className="flex gap-1 mb-4 min-h-[280px]">
                <div className="w-1/2 aspect-[3/4] bg-gray-200 rounded-tl-2xl rounded-bl-2xl"></div>
                <div className="w-1/2 flex flex-col gap-1">
                  <div className="w-full flex-1 bg-gray-800 flex flex-col items-center justify-center text-white rounded-tr-2xl">
                    <span className="text-2xl font-bold">+28</span>
                    <span className="text-xs">Collections</span>
                  </div>
                  <div className="w-full flex-1 bg-gray-200 rounded-br-2xl"></div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">More Collections</h3>
              <p className="text-sm text-gray-500">View all</p>
            </Link>
          </div>
        </div>
      </section>

      {/* We integrate with */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">We integrate with</h2>
              <Link
                to="/products"
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                And more
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand logos */}
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-green-500">🎵 Spotify</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-yellow-500">🌟 Lattice</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-green-600">upwork</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-pink-500">dribbble</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-green-500">🍃 feedly</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-500">🔗 hopin</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-orange-500">amazon</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">ebay</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <Truck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Free Shipping</h3>
              <p className="text-sm text-gray-500">On orders over ৳2000</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Cash On Delivery</h3>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Easy Returns</h3>
              <p className="text-sm text-gray-500">7 days return policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <Headphones className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">24/7 Support</h3>
              <p className="text-sm text-gray-500">Dedicated support</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
