import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import DesignStudio from './pages/DesignStudio'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import SellerDashboard from './pages/SellerDashboard'
import Dashboard from './pages/Dashboard'
import SellerDesignCreate from './pages/SellerDesignCreate'
import SellerOrdersReceived from './pages/SellerOrdersReceived'
import StorePage from './pages/StorePage'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Settings from './pages/Settings'
import AddressBook from './pages/AddressBook'
import SellYourDesign from './pages/SellYourDesign'
import Designers from './pages/Designers'
import Help from './pages/Help'
import Wholesale from './pages/Wholesale'
import Wishlist from './pages/Wishlist'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import MetaTags from './components/MetaTags'

function App() {
  return (
    <Router>
      <MetaTags />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/store/:slug" element={<StorePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/address-book" element={<AddressBook />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/sell-your-design" element={<SellYourDesign />} />
            <Route path="/designers" element={<Designers />} />
            <Route path="/help" element={<Help />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller/designs/new" element={<SellerDesignCreate />} />
            <Route path="/seller/orders-received" element={<SellerOrdersReceived />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/design-studio" element={<DesignStudio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
