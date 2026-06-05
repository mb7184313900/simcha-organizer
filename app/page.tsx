export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SimchaPro</h1>
        <nav className="flex gap-6">
          <a href="/guide" className="hover:text-yellow-300">Guide</a>
          <a href="/budget" className="hover:text-yellow-300">Organizer</a>
          <a href="#" className="hover:text-yellow-300">Magazine</a>
          <a href="/login" className="hover:text-yellow-300">Sign In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-800 text-white text-center py-24 px-6">
        <h2 className="text-5xl font-bold mb-4">Plan Your Simcha With Confidence</h2>
        <p className="text-xl mb-8 text-blue-200">The complete guide and organizer for the heimish community</p>
        <div className="flex justify-center gap-4">
          <a href="/signup" className="bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-300">
            Start Free Trial
          </a>
          <a href="#pricing" className="border border-white px-8 py-3 rounded-lg hover:bg-blue-700">
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center text-blue-900 mb-12">Everything You Need For Your Simcha</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 border rounded-xl shadow-sm">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-xl font-bold mb-2">Simcha Guide</h4>
            <p className="text-gray-600">Step by step guidance for every simcha — Lchaim, Tenaim, Wedding, Sheva Brachos and more</p>
          </div>
          <div className="text-center p-6 border rounded-xl shadow-sm">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="text-xl font-bold mb-2">Budget Organizer</h4>
            <p className="text-gray-600">Track shared expenses between both families, manage vendors, and stay on budget</p>
          </div>
          <div className="text-center p-6 border rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🎊</div>
            <h4 className="text-xl font-bold mb-2">Simcha Magazine</h4>
            <p className="text-gray-600">Exclusive deals and coupons from top simcha vendors, only for our members</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20 px-6 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-4">Simple Pricing</h3>
        <p className="text-gray-600 mb-12">Start free, pay only when you are ready</p>
        <div className="flex justify-center gap-8 flex-wrap">
          <div className="bg-white border rounded-xl p-8 w-72 shadow-sm">
            <h4 className="text-xl font-bold mb-2">Monthly</h4>
            <p className="text-4xl font-bold text-blue-900 mb-4">$14.95<span className="text-lg text-gray-500">/mo</span></p>
            <p className="text-gray-500 mb-6">15-day free trial included</p>
            <a href="/signup" className="block bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800">Get Started</a>
          </div>
          <div className="bg-blue-900 text-white rounded-xl p-8 w-72 shadow-sm">
            <h4 className="text-xl font-bold mb-2">Yearly</h4>
            <p className="text-4xl font-bold mb-4">$149<span className="text-lg text-blue-300">/yr</span></p>
            <p className="text-blue-300 mb-6">Save $30 — best value!</p>
            <a href="/signup" className="block bg-yellow-400 text-blue-900 font-bold py-3 rounded-lg hover:bg-yellow-300">Get Started</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white text-center py-6">
        <p className="text-blue-300">© 2026 SimchaPro. All rights reserved.</p>
      </footer>
    </main>
  )
}