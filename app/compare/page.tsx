// CR AudioViz AI - Mortgage Rate Monitor
// Compare Lenders Page - Full functionality
// Created: 2025-12-14

'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, Phone, Globe, MapPin, 
  ChevronDown, ChevronUp, Check, X, ArrowUpDown,
  Building2, Users, Landmark, Wifi, Shield
} from 'lucide-react';

interface Lender {
  id: string;
  name: string;
  lender_type: string;
  website: string;
  phone: string;
  nmls_id: string;
  headquarters_state: string;
  rating: number;
  review_count: number;
  description: string;
  specialties: string[];
  min_credit_score: number;
  min_down_payment: number;
  active: boolean;
}

const lenderTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  national: { label: 'National', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  regional: { label: 'Regional', icon: MapPin, color: 'bg-green-100 text-green-700' },
  credit_union: { label: 'Credit Union', icon: Users, color: 'bg-purple-100 text-purple-700' },
  online: { label: 'Online', icon: Wifi, color: 'bg-orange-100 text-orange-700' },
  state: { label: 'State', icon: Landmark, color: 'bg-teal-100 text-teal-700' },
};

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington D.C.' },
];

export default function ComparePage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLenders, setSelectedLenders] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetchLenders();
  }, []);

  async function fetchLenders() {
    try {
      setLoading(true);
      const response = await fetch('/api/lenders?limit=500');
      const data = await response.json();
      
      if (data.data) {
        setLenders(data.data);
      } else {
        throw new Error('Failed to fetch lenders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lenders');
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort lenders
  const filteredLenders = lenders
    .filter(lender => {
      const matchesSearch = lender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lender.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || lender.lender_type === selectedType;
      const matchesState = selectedState === 'all' || 
        lender.headquarters_state === selectedState ||
        lender.specialties?.some(s => s.includes(selectedState));
      return matchesSearch && matchesType && matchesState;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case 'reviews':
          comparison = (b.review_count || 0) - (a.review_count || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'credit_score':
          comparison = (a.min_credit_score || 0) - (b.min_credit_score || 0);
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  const toggleLenderSelection = (id: string) => {
    const newSelected = new Set(selectedLenders);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else if (newSelected.size < 4) {
      newSelected.add(id);
    }
    setSelectedLenders(newSelected);
  };

  const selectedLendersList = lenders.filter(l => selectedLenders.has(l.id));

  // Stats
  const stats = {
    total: lenders.length,
    national: lenders.filter(l => l.lender_type === 'national').length,
    regional: lenders.filter(l => l.lender_type === 'regional').length,
    creditUnion: lenders.filter(l => l.lender_type === 'credit_union').length,
    online: lenders.filter(l => l.lender_type === 'online').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lenders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Compare Mortgage Lenders</h1>
          <p className="text-xl text-blue-100 mb-6">
            Compare {stats.total}+ verified lenders nationwide. Find the best rates for your situation.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-blue-200">Total Lenders</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.national}</div>
              <div className="text-sm text-blue-200">National</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.regional}</div>
              <div className="text-sm text-blue-200">Regional</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.creditUnion}</div>
              <div className="text-sm text-blue-200">Credit Unions</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.online}</div>
              <div className="text-sm text-blue-200">Online</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lenders by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="national">National Lenders</option>
              <option value="regional">Regional Lenders</option>
              <option value="credit_union">Credit Unions</option>
              <option value="online">Online Lenders</option>
              <option value="state">State Lenders</option>
            </select>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All States</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="reviews-desc">Most Reviews</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="credit_score-asc">Lowest Credit Required</option>
            </select>
          </div>

          {/* Compare Mode Toggle */}
          {selectedLenders.size > 0 && (
            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedLenders.size} lender{selectedLenders.size > 1 ? 's' : ''} selected
                </span>
                <span className="text-blue-600 text-sm">(max 4)</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedLenders(new Set())}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
                <button
                  onClick={() => setCompareMode(true)}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Compare Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-gray-600 mb-4">
          Showing {filteredLenders.length} of {lenders.length} lenders
        </p>

        {/* Comparison Modal */}
        {compareMode && selectedLendersList.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold">Lender Comparison</h2>
                <button onClick={() => setCompareMode(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedLendersList.length}, 1fr)` }}>
                  {selectedLendersList.map(lender => (
                    <div key={lender.id} className="border rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-2">{lender.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{lender.rating}</span>
                        <span className="text-gray-500 text-sm">({lender.review_count?.toLocaleString()} reviews)</span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type</span>
                          <span className="font-medium">{lenderTypeLabels[lender.lender_type]?.label || lender.lender_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">NMLS ID</span>
                          <span className="font-medium">#{lender.nmls_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Min Credit Score</span>
                          <span className="font-medium">{lender.min_credit_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Min Down Payment</span>
                          <span className="font-medium">{lender.min_down_payment}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Headquarters</span>
                          <span className="font-medium">{lender.headquarters_state}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-500 mb-2">Specialties</div>
                        <div className="flex flex-wrap gap-1">
                          {lender.specialties?.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <a
                          href={`https://${lender.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lender Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLenders.map((lender) => {
            const typeInfo = lenderTypeLabels[lender.lender_type] || { 
              label: lender.lender_type, 
              icon: Building2, 
              color: 'bg-gray-100 text-gray-700' 
            };
            const TypeIcon = typeInfo.icon;
            const isSelected = selectedLenders.has(lender.id);

            return (
              <div
                key={lender.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                        {lender.nmls_id && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Shield className="w-3 h-3" />
                            NMLS #{lender.nmls_id}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{lender.name}</h3>
                    </div>
                    <button
                      onClick={() => toggleLenderSelection(lender.id)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(lender.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{lender.rating}</span>
                    <span className="text-gray-500 text-sm">
                      ({lender.review_count?.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{lender.description}</p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Min Credit</span>
                      <div className="font-semibold">{lender.min_credit_score}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Down</span>
                      <div className="font-semibold">{lender.min_down_payment}%</div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {lender.specialties?.slice(0, 3).map((specialty, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {(lender.specialties?.length || 0) > 3 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{lender.specialties!.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <a
                      href={`https://${lender.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                    {lender.phone && (
                      <a
                        href={`tel:${lender.phone}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLenders.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No lenders found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
