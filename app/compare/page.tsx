'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Lender {
  id: string;
  name: string;
  lender_type: string;
  website: string;
  phone: string;
  logo_url?: string;
  rating: number;
  review_count: number;
  lowest_rate?: number;
  lowest_apr?: number;
  mortgage_rates: MortgageRate[];
}

interface MortgageRate {
  loan_type: string;
  term: string;
  base_rate: number;
  apr: number;
  points: number;
  fees: number;
}

const loanTypes = [
  { value: '', label: 'All Loan Types' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'usda', label: 'USDA' },
  { value: 'jumbo', label: 'Jumbo' }
];

const terms = [
  { value: '', label: 'All Terms' },
  { value: '30_year_fixed', label: '30-Year Fixed' },
  { value: '15_year_fixed', label: '15-Year Fixed' },
  { value: '10_year_fixed', label: '10-Year Fixed' },
  { value: '7_1_arm', label: '7/1 ARM' },
  { value: '5_1_arm', label: '5/1 ARM' },
  { value: '3_1_arm', label: '3/1 ARM' }
];

const lenderTypes = [
  { value: '', label: 'All Lenders' },
  { value: 'national', label: 'National Lenders' },
  { value: 'state', label: 'State Lenders' },
  { value: 'regional', label: 'Regional Lenders' },
  { value: 'local', label: 'Local Lenders' },
  { value: 'credit_union', label: 'Credit Unions' },
  { value: 'online', label: 'Online Only' }
];

export default function RateComparisonPage() {
  const searchParams = useSearchParams();
  
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    loanType: searchParams.get('loan_type') || '',
    term: searchParams.get('term') || '30_year_fixed',
    lenderType: searchParams.get('lender_type') || '',
    location: searchParams.get('location') || '',
    minRating: searchParams.get('min_rating') || '',
    sortBy: searchParams.get('sort') || 'rate'
  });

  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);

  useEffect(() => {
    fetchLenders();
  }, [filters]);

  const fetchLenders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.loanType) params.append('loan_type', filters.loanType);
      if (filters.term) params.append('term', filters.term);
      if (filters.lenderType) params.append('type', filters.lenderType);
      if (filters.location) params.append('zip', filters.location);
      if (filters.minRating) params.append('min_rating', filters.minRating);
      params.append('sort', filters.sortBy);

      const response = await fetch(`/api/lenders?${params}`);
      const data = await response.json();

      if (data.success) {
        setLenders(data.lenders);
      }
    } catch (error) {
      console.error('Error fetching lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleLenderSelection = (lenderId: string) => {
    setSelectedLenders(prev => 
      prev.includes(lenderId)
        ? prev.filter(id => id !== lenderId)
        : [...prev, lenderId].slice(-3) // Max 3 for comparison
    );
  };

  const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Compare Mortgage Rates</h1>
          <p className="text-xl text-blue-100">
            Find the best rates from 500+ lenders • National, State, Regional & Local
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Type
              </label>
              <select
                value={filters.loanType}
                onChange={(e) => handleFilterChange('loanType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {loanTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term
              </label>
              <select
                value={filters.term}
                onChange={(e) => handleFilterChange('term', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {terms.map(term => (
                  <option key={term.value} value={term.value}>{term.label}</option>
                ))}
              </select>
            </div>

            {/* Lender Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lender Type
              </label>
              <select
                value={filters.lenderType}
                onChange={(e) => handleFilterChange('lenderType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {lenderTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                placeholder="Enter ZIP"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rate">Lowest Rate</option>
                <option value="apr">Lowest APR</option>
                <option value="rating">Highest Rating</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.loanType || filters.lenderType || filters.location) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.loanType && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {loanTypes.find(t => t.value === filters.loanType)?.label}
                </span>
              )}
              {filters.lenderType && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {lenderTypes.find(t => t.value === filters.lenderType)?.label}
                </span>
              )}
              {filters.location && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  📍 {filters.location}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${lenders.length} Lenders Found`}
              </h2>
              <p className="text-gray-600 mt-1">
                Showing rates for {filters.term ? terms.find(t => t.value === filters.term)?.label : 'all terms'}
                {filters.loanType && ` • ${loanTypes.find(t => t.value === filters.loanType)?.label}`}
              </p>
            </div>
            {selectedLenders.length > 0 && (
              <button
                onClick={() => setShowLeadForm(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Get Quotes ({selectedLenders.length})
              </button>
            )}
          </div>
        </div>

        {/* Lender Cards */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : lenders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Lenders Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={() => setFilters({
                loanType: '',
                term: '30_year_fixed',
                lenderType: '',
                location: '',
                minRating: '',
                sortBy: 'rate'
              })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lenders.map(lender => (
              <div
                key={lender.id}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 ${
                  selectedLenders.includes(lender.id)
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
                onClick={() => toggleLenderSelection(lender.id)}
              >
                {/* Lender Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{lender.name}</h3>
                      {selectedLenders.includes(lender.id) && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {lender.lender_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {lender.rating}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({lender.review_count.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Display */}
                {lender.lowest_rate && (
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {lender.lowest_rate.toFixed(3)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      APR: {lender.lowest_apr?.toFixed(3)}%
                    </div>
                  </div>
                )}

                {/* Rate Details */}
                {lender.mortgage_rates && lender.mortgage_rates.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {lender.mortgage_rates.slice(0, 2).map((rate, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <span className="font-medium">
                          {rate.loan_type.toUpperCase()}
                        </span>
                        {' • '}
                        {rate.points > 0 && `${rate.points} pts • `}
                        ${rate.fees.toLocaleString()} fees
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={lender.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Website
                  </a>
                  <a
                    href={`tel:${lender.phone}`}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📞
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead Capture Modal */}
      {showLeadForm && (
        <LeadCaptureForm
          selectedLenders={selectedLenders}
          onClose={() => setShowLeadForm(false)}
        />
      )}
    </div>
  );
}

// Lead Capture Form Component
function LeadCaptureForm({ selectedLenders, onClose }: { selectedLenders: string[], onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyLocation: '',
    purchasePrice: '',
    downPayment: '',
    creditScore: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit lead to API
    console.log('Lead submitted:', formData, selectedLenders);
    alert('Thank you! A mortgage specialist will contact you within 24 hours.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Get Your Quotes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            Submit & Get Quotes
          </button>
        </form>
      </div>
    </div>
  );
}
