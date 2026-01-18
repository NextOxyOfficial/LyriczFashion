import { Link } from 'react-router-dom'
import { Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react'

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="text-sm font-medium text-emerald-700">Help</div>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">How can we help you?</h1>
          <p className="text-gray-600 mt-2">Find answers or contact our team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">Support</div>
                <div className="text-sm text-gray-600">We usually reply within 24 hours</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-semibold">Hotline</div>
                  <div className="text-sm text-gray-600">19008188</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-semibold">Email</div>
                  <div className="text-sm text-gray-600">support@lyriczfashion.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MessageCircle className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-semibold">Messenger</div>
                  <div className="text-sm text-gray-600">LyriczFashion</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="text-lg font-bold text-gray-900">Common Questions</div>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div>
                <div className="font-semibold">How do I track my order?</div>
                <div className="text-gray-600 mt-1">Go to My Orders and check your order status.</div>
              </div>
              <div>
                <div className="font-semibold">What payment methods are available?</div>
                <div className="text-gray-600 mt-1">Cash on delivery is available right now.</div>
              </div>
              <div>
                <div className="font-semibold">How do I become a seller/designer?</div>
                <div className="text-gray-600 mt-1">Open the Seller page and submit your request.</div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
