'use client';

import React, { useState } from 'react';

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: string;
  example: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/lenders',
    description: 'Get a list of lenders with filtering and pagination',
    parameters: [
      {
        name: 'lender_type',
        type: 'string',
        required: false,
        description: 'Filter by type (national, regional, state, local, credit_union, online)',
      },
      {
        name: 'state',
        type: 'string',
        required: false,
        description: 'Filter by state (e.g., CA, TX, FL)',
      },
      {
        name: 'loan_type',
        type: 'string',
        required: false,
        description: 'Filter by loan type (conventional, fha, va, usda, jumbo)',
      },
      {
        name: 'term',
        type: 'number',
        required: false,
        description: 'Filter by loan term in years (30, 15, 10)',
      },
      {
        name: 'sort',
        type: 'string',
        required: false,
        description: 'Sort by field (rate, apr, rating, reviews, name)',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of results (default: 20, max: 100)',
      },
      {
        name: 'offset',
        type: 'number',
        required: false,
        description: 'Pagination offset (default: 0)',
      },
    ],
    response: `{
  "lenders": [...],
  "total": 42,
  "limit": 20,
  "offset": 0
}`,
    example: '/api/lenders?lender_type=national&loan_type=conventional&term=30&sort=rate&limit=10',
  },
  {
    method: 'GET',
    path: '/api/lenders/:id',
    description: 'Get detailed information about a specific lender',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Lender ID',
      },
    ],
    response: `{
  "id": "...",
  "name": "Example Bank",
  "lender_type": "national",
  "rating": 4.5,
  ...
}`,
    example: '/api/lenders/123e4567-e89b-12d3-a456-426614174000',
  },
  {
    method: 'GET',
    path: '/api/mortgage/rates',
    description: 'Get current mortgage rates',
    parameters: [
      {
        name: 'lender_id',
        type: 'string',
        required: false,
        description: 'Filter by specific lender',
      },
      {
        name: 'loan_type',
        type: 'string',
        required: false,
        description: 'Loan type (conventional, fha, va, etc.)',
      },
      {
        name: 'term_years',
        type: 'number',
        required: false,
        description: 'Term in years (30, 15, etc.)',
      },
    ],
    response: `{
  "rates": [...],
  "updated_at": "2025-11-16T20:30:00Z"
}`,
    example: '/api/mortgage/rates?loan_type=conventional&term_years=30',
  },
  {
    method: 'GET',
    path: '/api/mortgage/historical',
    description: 'Get historical rate data',
    parameters: [
      {
        name: 'lender_id',
        type: 'string',
        required: false,
        description: 'Filter by specific lender (optional)',
      },
      {
        name: 'range',
        type: 'string',
        required: false,
        description: 'Time range (7d, 30d, 90d, 1y, 5y, all)',
      },
    ],
    response: `{
  "data": [
    {
      "date": "2025-11-01",
      "rate_30y": 6.75,
      "rate_15y": 6.25,
      ...
    }
  ]
}`,
    example: '/api/mortgage/historical?range=90d',
  },
  {
    method: 'POST',
    path: '/api/leads',
    description: 'Submit a new lead/pre-qualification request',
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Lead full name',
      },
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Lead email address',
      },
      {
        name: 'phone',
        type: 'string',
        required: true,
        description: 'Lead phone number',
      },
      {
        name: 'loan_amount',
        type: 'number',
        required: true,
        description: 'Desired loan amount',
      },
      {
        name: 'loan_type',
        type: 'string',
        required: true,
        description: 'Loan type',
      },
      {
        name: 'lender_id',
        type: 'string',
        required: false,
        description: 'Specific lender (optional)',
      },
    ],
    response: `{
  "success": true,
  "lead_id": "...",
  "message": "Lead submitted successfully"
}`,
    example: `POST /api/leads
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-0123",
  "loan_amount": 350000,
  "loan_type": "conventional"
}`,
  },
  {
    method: 'POST',
    path: '/api/alerts',
    description: 'Create a new rate alert',
    parameters: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'User ID',
      },
      {
        name: 'loan_type',
        type: 'string',
        required: true,
        description: 'Loan type',
      },
      {
        name: 'term_years',
        type: 'number',
        required: true,
        description: 'Loan term in years',
      },
      {
        name: 'target_rate',
        type: 'number',
        required: true,
        description: 'Target rate to alert on',
      },
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Email for notifications',
      },
    ],
    response: `{
  "success": true,
  "alert_id": "...",
  "message": "Alert created successfully"
}`,
    example: `POST /api/alerts
{
  "user_id": "...",
  "loan_type": "conventional",
  "term_years": 30,
  "target_rate": 6.0,
  "email": "user@example.com"
}`,
  },
  {
    method: 'GET',
    path: '/api/alerts',
    description: 'Get user rate alerts',
    parameters: [
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'User ID',
      },
    ],
    response: `{
  "alerts": [...]
}`,
    example: '/api/alerts?user_id=123',
  },
  {
    method: 'DELETE',
    path: '/api/alerts/:id',
    description: 'Delete a rate alert',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Alert ID',
      },
    ],
    response: `{
  "success": true,
  "message": "Alert deleted"
}`,
    example: 'DELETE /api/alerts/123e4567-e89b-12d3-a456-426614174000',
  },
];

export default function APIDocumentationPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(
    apiEndpoints[0]
  );

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
          <p className="text-blue-100 text-lg">
            RESTful API for mortgage rate data and lender information
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs text-blue-200">Base URL</div>
              <div className="font-mono text-sm">
                https://mortgage-rate-monitor.vercel.app
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs text-blue-200">Version</div>
              <div className="font-mono text-sm">v1.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Endpoint List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Endpoints</h3>
              <div className="space-y-2">
                {apiEndpoints.map((endpoint, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedEndpoint === endpoint
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                          methodColors[endpoint.method]
                        }`}
                      >
                        {endpoint.method}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 font-mono truncate">
                      {endpoint.path}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Endpoint Details */}
          <div className="lg:col-span-3">
            {selectedEndpoint && (
              <div className="bg-white rounded-lg shadow-md">
                {/* Endpoint Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-mono font-medium ${
                        methodColors[selectedEndpoint.method]
                      }`}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <h2 className="text-2xl font-mono font-semibold text-gray-900">
                      {selectedEndpoint.path}
                    </h2>
                  </div>
                  <p className="text-gray-600">{selectedEndpoint.description}</p>
                </div>

                {/* Parameters */}
                {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
                    <div className="space-y-3">
                      {selectedEndpoint.parameters.map((param, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-medium text-gray-900">
                              {param.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                              {param.type}
                            </span>
                            {param.required && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Response</h3>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{selectedEndpoint.response}</code>
                  </pre>
                </div>

                {/* Example */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Example Request</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                      {selectedEndpoint.example}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Getting Started */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Getting Started
              </h3>
              <div className="prose prose-gray max-w-none">
                <h4 className="font-semibold text-gray-900">Authentication</h4>
                <p className="text-gray-600 mb-4">
                  Currently, no authentication is required for public endpoints. Rate limits apply:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  <li>100 requests per minute per IP</li>
                  <li>1000 requests per hour per IP</li>
                </ul>

                <h4 className="font-semibold text-gray-900 mt-6">Rate Limiting</h4>
                <p className="text-gray-600 mb-4">
                  API responses include rate limit headers:
                </p>
                <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999`}
                </pre>

                <h4 className="font-semibold text-gray-900 mt-6">Error Handling</h4>
                <p className="text-gray-600 mb-4">
                  The API uses standard HTTP status codes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>200 - Success</li>
                  <li>400 - Bad Request</li>
                  <li>404 - Not Found</li>
                  <li>429 - Rate Limit Exceeded</li>
                  <li>500 - Server Error</li>
                </ul>
              </div>
            </div>

            {/* SDK Examples */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Code Examples
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">JavaScript/Node.js</h4>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm">
{`const response = await fetch(
  'https://mortgage-rate-monitor.vercel.app/api/lenders?loan_type=conventional'
);
const data = await response.json();
console.log(data.lenders);`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm">
{`import requests

response = requests.get(
    'https://mortgage-rate-monitor.vercel.app/api/lenders',
    params={'loan_type': 'conventional'}
)
data = response.json()
print(data['lenders'])`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">cURL</h4>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm">
{`curl -X GET "https://mortgage-rate-monitor.vercel.app/api/lenders?loan_type=conventional" \\
     -H "Accept: application/json"`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
