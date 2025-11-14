// Javari AI Mortgage Rate Monitoring - Home Page
// Created: 2025-11-14 23:25 UTC
// Roy Henderson, CEO @ CR AudioViz AI, LLC

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏠 Javari AI Mortgage Rate Monitoring
          </h1>
          <p className="text-xl text-gray-600">
            Professional mortgage rate monitoring API with real-time data, historical analytics, and email alerts
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Built by CR AudioViz AI, LLC | Roy Henderson, CEO
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-3">📧</div>
            <h2 className="text-xl font-bold mb-2">Email Alerts</h2>
            <p className="text-gray-600 text-sm">
              Set rate thresholds and receive instant email notifications when rates change
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-3">📊</div>
            <h2 className="text-xl font-bold mb-2">Historical Analytics</h2>
            <p className="text-gray-600 text-sm">
              Access historical data with trend analysis and volatility calculations
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-3">🔑</div>
            <h2 className="text-xl font-bold mb-2">API Access</h2>
            <p className="text-gray-600 text-sm">
              Generate API keys with customizable rate limits for programmatic access
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">API Endpoints</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/mortgage/rates</code>
              <p className="text-gray-600 text-sm mt-1">Get current mortgage rates (30Y, 15Y, 5/1 ARM)</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/mortgage/rates/historical</code>
              <p className="text-gray-600 text-sm mt-1">Historical data with trends and statistics</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">POST /api/mortgage/alerts</code>
              <p className="text-gray-600 text-sm mt-1">Create rate alert with email notifications</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">POST /api/mortgage/keys</code>
              <p className="text-gray-600 text-sm mt-1">Generate API key for programmatic access</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>📖 API Documentation:</strong> Complete OpenAPI specification available at{' '}
              <code className="bg-white px-2 py-1 rounded">/docs/openapi.json</code>
            </p>
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          
          <div className="bg-gray-800 rounded p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2"># Get current rates</p>
            <code className="text-green-400">curl https://mortgage-rate-monitor.vercel.app/api/mortgage/rates</code>
          </div>

          <div className="bg-gray-800 rounded p-4">
            <p className="text-sm text-gray-400 mb-2"># Get historical data (last 365 days)</p>
            <code className="text-green-400">curl &quot;https://mortgage-rate-monitor.vercel.app/api/mortgage/rates/historical?days=365&quot;</code>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            © 2025 CR AudioViz AI, LLC | Built with Next.js 14, Supabase, and Vercel
          </p>
          <p className="text-xs mt-2">
            Phases 3B, 3C, 3D Complete | Production Ready
          </p>
        </div>
      </div>
    </div>
  );
}
