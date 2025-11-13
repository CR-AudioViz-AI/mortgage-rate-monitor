export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🏠 Mortgage Rate Monitor API</h1>
      <p style={{ color: '#666', fontSize: '18px' }}>
        Real-time mortgage rate monitoring for 92 US locations
      </p>

      <h2>📍 Available Endpoints</h2>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>GET /api/rates/latest</h3>
        <p>Get the latest mortgage rates for a specific location</p>
        <code>?location_code=FL</code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>GET /api/rates/history</h3>
        <p>Get historical mortgage rates for a location</p>
        <code>?location_code=FL&days=30</code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>GET /api/locations</h3>
        <p>Get all available locations (50 states + 35 metros + national)</p>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>POST /api/alerts/configure</h3>
        <p>Configure email alerts for rate drops</p>
        <code>{`{"email": "you@example.com", "location_code": "FL", "threshold": 0.25}`}</code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>POST /api/admin/scrape</h3>
        <p>Manually trigger rate scraping for a location</p>
        <code>{`{"location_code": "FL"}`}</code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>GET /api/admin/stats</h3>
        <p>Get system statistics and scraper health</p>
      </div>

      <h2>⏰ Automated Monitoring</h2>
      <p>
        The system automatically scrapes rates every hour via Vercel Cron at <code>/api/cron</code>
      </p>

      <h2>📧 Email Alerts</h2>
      <p>
        Users receive FREE email alerts when rates drop by ≥0.25% via <strong>info@craudiovizai.com</strong>
      </p>

      <h2>📊 Data Sources</h2>
      <ul>
        <li>Zillow (Primary)</li>
        <li>Bankrate (Secondary)</li>
        <li>MortgageNewsDaily (Tertiary)</li>
      </ul>

      <h2>💰 Cost</h2>
      <p style={{ fontSize: '24px', color: '#27ae60' }}>
        <strong>$0/month</strong> - Uses existing Supabase & Vercel infrastructure
      </p>

      <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #ddd', color: '#999' }}>
        <p>Powered by CR AudioViz AI | API v1.0.0</p>
      </footer>
    </div>
  );
}
