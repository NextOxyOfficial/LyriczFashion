import { Link } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'

const Terms = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">Terms of Service</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 sm:p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-emerald-100 text-sm">Last updated: January 1, 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using LyriczFashion ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access or use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p>LyriczFashion is a custom apparel design and e-commerce platform that allows users to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Browse and purchase custom-designed apparel</li>
              <li>Create and upload their own designs using our Design Studio</li>
              <li>Sell their designs as sellers on the platform</li>
              <li>Order wholesale quantities of custom apparel</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. User Accounts</h2>
            <p>To access certain features of the Platform, you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
            <p className="mt-3">You must be at least 13 years of age to create an account. By creating an account, you represent that you meet this requirement.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Orders and Payments</h2>
            <p>When you place an order on LyriczFashion:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>All prices are listed in Bangladeshi Taka (৳) and are inclusive of applicable taxes</li>
              <li>Payment must be completed at the time of order placement</li>
              <li>We reserve the right to cancel or refuse any order at our discretion</li>
              <li>Order confirmation will be sent to your registered email address</li>
              <li>Delivery times are estimates and may vary based on location and demand</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Custom Design Policy</h2>
            <p>When using our Design Studio or uploading custom designs, you agree that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You own or have the right to use all uploaded images and content</li>
              <li>Your designs do not infringe on any third-party intellectual property rights</li>
              <li>Designs must not contain offensive, hateful, or illegal content</li>
              <li>LyriczFashion reserves the right to reject any design that violates these guidelines</li>
              <li>You grant LyriczFashion a non-exclusive license to use your design for order fulfillment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Seller Terms</h2>
            <p>If you register as a seller on LyriczFashion:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You are responsible for the accuracy of your product listings</li>
              <li>Commission rates and payout schedules are as communicated during seller onboarding</li>
              <li>LyriczFashion handles all printing, fulfillment, and shipping on your behalf</li>
              <li>Seller accounts may be suspended for violations of these terms</li>
              <li>You must not list designs that infringe on copyright or trademarks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Returns and Refunds</h2>
            <p>Due to the custom nature of our products:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Custom-printed items are non-refundable unless there is a manufacturing defect</li>
              <li>Defective or incorrect items must be reported within 7 days of delivery</li>
              <li>We will replace or refund defective items at our discretion</li>
              <li>Standard (non-custom) items may be returned within 14 days in original condition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p>All content on the LyriczFashion platform — including logos, graphics, text, and software — is the property of LyriczFashion and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>LyriczFashion shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform. Our total liability to you for any claims arising from these terms shall not exceed the amount you paid for the relevant order.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of the Platform after any changes constitutes your acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="font-semibold text-gray-800">LyriczFashion</p>
              <p className="mt-1">Email: <a href="mailto:support@lyriczfashion.com" className="text-emerald-600 hover:underline">support@lyriczfashion.com</a></p>
              <p>Website: <a href="https://lyriczfashion.com" className="text-emerald-600 hover:underline">lyriczfashion.com</a></p>
            </div>
          </section>

        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/privacy" className="text-emerald-600 hover:underline font-medium">View Privacy Policy</Link>
          <span className="mx-3">·</span>
          <Link to="/help" className="text-emerald-600 hover:underline font-medium">Help Center</Link>
        </div>
      </div>
    </div>
  )
}

export default Terms
