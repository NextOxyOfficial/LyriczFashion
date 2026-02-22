import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Wand2, Sparkles, Zap, Star } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI, mockupAPI, designLibraryAPI } from '../services/api'

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'new' | 'bestseller' | 'sale'>('new')
  const [featuredLogos, setFeaturedLogos] = useState<any[]>([])
  const [typedText1, setTypedText1] = useState('')
  const [typedText2, setTypedText2] = useState('')
  const [typedDesc, setTypedDesc] = useState('')
  const [showCursor1, setShowCursor1] = useState(true)
  const [showCursor2, setShowCursor2] = useState(false)
  const [showDescCursor, setShowDescCursor] = useState(false)

  const text1 = 'Create Your'
  const text2 = 'Dream T-Shirt'
  const description = 'Design custom T-shirts with our easy-to-use studio. Perfect for yourself or your business.'

  // Typing effect for hero text
  useEffect(() => {
    let timeout1: number
    let timeout2: number
    let timeout3: number
    let cursorInterval: number

    // Type first line
    let i = 0
    const typeText1 = () => {
      if (i < text1.length) {
        setTypedText1(text1.substring(0, i + 1))
        i++
        timeout1 = setTimeout(typeText1, 100)
      } else {
        setShowCursor1(false)
        setShowCursor2(true)
        // Start typing second line after first is complete
        let j = 0
        const typeText2 = () => {
          if (j < text2.length) {
            setTypedText2(text2.substring(0, j + 1))
            j++
            timeout2 = setTimeout(typeText2, 100)
          } else {
            setShowCursor2(false)
            setShowDescCursor(true)
            // Start typing description
            let k = 0
            const typeDesc = () => {
              if (k < description.length) {
                setTypedDesc(description.substring(0, k + 1))
                k++
                timeout3 = setTimeout(typeDesc, 30)
              } else {
                setShowDescCursor(false)
              }
            }
            typeDesc()
          }
        }
        typeText2()
      }
    }

    // Start typing animation after a short delay
    const startTimeout = setTimeout(typeText1, 500)

    // Cursor blink effect
    cursorInterval = setInterval(() => {
      // Cursor blink is handled by CSS animation
    }, 500)

    return () => {
      clearTimeout(startTimeout)
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
      clearInterval(cursorInterval)
    }
  }, [])

  // Load categories (MockupTypes)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await mockupAPI.listMockupTypes()
        setCategories(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load categories:', error)
        setCategories([]) // Set empty array on error to stop loading state
      }
    }
    loadCategories()
  }, [])

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

  // Load featured logos
  useEffect(() => {
    const loadFeaturedLogos = async () => {
      try {
        const data = await designLibraryAPI.getFeatured()
        setFeaturedLogos(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load featured logos:', error)
        setFeaturedLogos([])
      }
    }
    loadFeaturedLogos()
  }, [])

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
      {/* Hero Section - Enhanced with Cool Effects */}
      <section className="relative pt-2 pb-4 bg-white overflow-hidden">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-400">
            {/* Animated Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-20 left-10 animate-float hidden lg:block">
              <Sparkles className="w-8 h-8 text-white/40" />
            </div>
            <div className="absolute top-40 right-20 animate-float animation-delay-2000 hidden lg:block">
              <Zap className="w-6 h-6 text-white/30" />
            </div>
            <div className="absolute bottom-32 left-32 animate-float animation-delay-4000 hidden lg:block">
              <Star className="w-7 h-7 text-white/35" />
            </div>

            {/* Decorative Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[480px] py-10 lg:py-12">
              {/* Left Content */}
              <div className="relative z-10 pl-8 lg:pl-16">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Design Studio Available</span>
                </div>

                {/* Main Heading with Gradient Text and Typing Effect */}
                <h1 className="text-[42px] md:text-[56px] lg:text-[64px] font-black mb-6 leading-[1.1] tracking-tight min-h-[140px] md:min-h-[180px]">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-sm">
                    {typedText1}
                    {showCursor1 && <span className="typing-cursor">|</span>}
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-gray-50 to-white bg-clip-text text-transparent drop-shadow-lg">
                    {typedText2}
                    {showCursor2 && <span className="typing-cursor text-white">|</span>}
                  </span>
                </h1>

                <p className="text-lg text-gray-800 mb-8 font-medium max-w-md leading-relaxed min-h-[80px]">
                  {typedDesc}
                  {showDescCursor && <span className="typing-cursor text-gray-800">|</span>}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/design-studio"
                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white text-base font-bold rounded-full hover:bg-gray-800 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <Wand2 className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Start Designing</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-900 text-base font-bold rounded-full hover:bg-white transition-all shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-white/50"
                  >
                    Browse Designs
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 mt-10">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-700">Designs</div>
                  </div>
                  <div className="w-px h-12 bg-gray-800/20"></div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">1000+</div>
                    <div className="text-sm text-gray-700">Happy Customers</div>
                  </div>
                  <div className="w-px h-12 bg-gray-800/20"></div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-700">Support</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Image with Parallax */}
              <div 
                className="relative h-[450px] lg:h-[550px] flex items-center justify-center lg:justify-end pr-8"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Glow Effect Behind Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-96 h-96 bg-white/30 rounded-full filter blur-3xl"></div>
                </div>

                {/* Main Image with Parallax */}
                <div 
                  ref={imageRef}
                  className="relative z-10"
                  style={{
                    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.05)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  <div className="relative">
                    {/* Image Shadow/Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-3xl blur-2xl scale-110"></div>
                    
                    <img
                      src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
                      alt="Custom T-Shirts"
                      className="relative w-full max-w-[500px] h-auto object-contain drop-shadow-2xl"
                    />
                    
                    {/* Floating Badge */}
                    <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 animate-bounce-slow hidden lg:block">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-gray-900">Live Now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .bg-grid-pattern {
            background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
          }
          .typing-cursor {
            display: inline-block;
            animation: blink 1s infinite;
            margin-left: 2px;
            font-weight: 300;
          }
        `}</style>
      </section>

      {/* Shopping by Categories - Dynamic */}
      <section className="py-6 bg-white">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Shopping by Categories</h2>
          {categories.length > 0 ? (
            <div className="flex justify-start items-center gap-8 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.name)}`} 
                  className="flex flex-col items-center group flex-shrink-0"
                  style={{ width: '160px' }}
                >
                  <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                    <img
                      src={category.preview_image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {category.name} <sup className="text-xs text-gray-500">{category.variant_count || 0}</sup>
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading categories...</p>
            </div>
          )}
        </div>
      </section>

      {/* How to design and order custom T-shirts */}
      <section className="py-12 bg-white">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
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
      <section className="py-6 bg-white">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
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
                designerName={product.designer_name}
                storeSlug={product.creator_store_slug || product.store_slug}
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
      <section className="py-6 bg-white">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
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
      

      {/* Featured Design Logos */}
      {featuredLogos.length > 0 && (
        <section className="py-6 bg-white">
          <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Free design templates</h2>
              <Link
                to="/design-studio"
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredLogos.map((logo) => (
                <Link key={logo.id} to="/design-studio" className="group">
                  <div className="mb-4 min-h-[280px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                    <img 
                      src={logo.image} 
                      alt={logo.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 truncate">{logo.name}</h3>
                  <p className="text-sm text-gray-500">{logo.category || 'Design'}</p>
                </Link>
              ))}
              
              {featuredLogos.length < 8 && (
                <Link to="/design-studio" className="group">
                  <div className="flex gap-1 mb-4 min-h-[280px]">
                    <div className="w-full aspect-[3/4] bg-gray-800 flex flex-col items-center justify-center text-white rounded-2xl">
                      <Sparkles className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">+More</span>
                      <span className="text-xs">Templates</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">More Collections</h3>
                  <p className="text-sm text-gray-500">View all</p>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Free design templates - fallback if no featured */}
      {featuredLogos.length === 0 && (
        <section className="py-6 bg-white">
          <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Free design templates</h2>
              <Link
                to="/design-studio"
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
      )}

      {/* We integrate with */}
      <section className="py-6 bg-white border-t border-gray-100">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-8">
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
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
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
