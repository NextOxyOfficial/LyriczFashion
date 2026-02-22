import { Link } from 'react-router-dom'
import { Shield, ChevronRight } from 'lucide-react'

const Privacy = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 sm:p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-emerald-100 text-sm">Last updated: January 1, 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>LyriczFashion ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://lyriczfashion.com" className="text-emerald-600 hover:underline">lyriczfashion.com</a> or use our services.</p>
            <p className="mt-3">By using our Platform, you consent to the data practices described in this policy. Please read it carefully.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="font-semibold text-gray-800 mb-2">Information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, and password when you register</li>
              <li>Shipping address and phone number for order delivery</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Design files and images you upload to our Design Studio</li>
              <li>Messages you send to our support team</li>
            </ul>
            <p className="font-semibold text-gray-800 mt-4 mb-2">Information collected automatically:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address and browser type</li>
              <li>Pages visited and time spent on the Platform</li>
              <li>Device information (operating system, screen size)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Referring website or search terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Create and manage your account</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your customer service requests</li>
              <li>Send promotional emails and newsletters (with your consent)</li>
              <li>Improve our Platform and services</li>
              <li>Detect and prevent fraud or unauthorized activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Sharing Your Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-medium">Service providers</span> — payment processors, shipping companies, and cloud hosting providers who assist in operating our Platform</li>
              <li><span className="font-medium">Legal authorities</span> — when required by law, court order, or government regulation</li>
              <li><span className="font-medium">Business transfers</span> — in the event of a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="mt-3">All third-party service providers are contractually obligated to keep your information confidential and use it only for the purposes we specify.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Cookies</h2>
            <p>We use cookies and similar technologies to enhance your experience on our Platform. Cookies help us:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Keep you logged in to your account</li>
              <li>Remember items in your shopping cart</li>
              <li>Understand how you use our Platform</li>
              <li>Deliver relevant content and advertisements</li>
            </ul>
            <p className="mt-3">You can control cookie settings through your browser. However, disabling cookies may affect the functionality of certain features.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Secure password hashing</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Restricted access to personal data on a need-to-know basis</li>
            </ul>
            <p className="mt-3">While we take every precaution, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide you services. We will delete or anonymize your data upon request, unless we are required to retain it for legal or business purposes such as tax records or fraud prevention.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-medium">Access</span> — request a copy of the personal data we hold about you</li>
              <li><span className="font-medium">Correction</span> — request correction of inaccurate or incomplete data</li>
              <li><span className="font-medium">Deletion</span> — request deletion of your personal data</li>
              <li><span className="font-medium">Opt-out</span> — unsubscribe from marketing emails at any time</li>
              <li><span className="font-medium">Portability</span> — request your data in a portable format</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:support@lyriczfashion.com" className="text-emerald-600 hover:underline">support@lyriczfashion.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p>Our Platform is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately and we will delete it.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Third-Party Links</h2>
            <p>Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to review the privacy policies of any third-party sites you visit.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our Platform or sending an email to your registered address. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="font-semibold text-gray-800">LyriczFashion</p>
              <p className="mt-1">Email: <a href="mailto:support@lyriczfashion.com" className="text-emerald-600 hover:underline">support@lyriczfashion.com</a></p>
              <p>Website: <a href="https://lyriczfashion.com" className="text-emerald-600 hover:underline">lyriczfashion.com</a></p>
            </div>
          </section>

        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/terms" className="text-emerald-600 hover:underline font-medium">View Terms of Service</Link>
          <span className="mx-3">·</span>
          <Link to="/help" className="text-emerald-600 hover:underline font-medium">Help Center</Link>
        </div>
      </div>
    </div>
  )
}

export default Privacy
