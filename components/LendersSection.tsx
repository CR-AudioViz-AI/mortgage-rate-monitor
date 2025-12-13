// LendersSection Component
// CR AudioViz AI - Mortgage Rate Monitor
// December 2025

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Building2, CreditCard, Globe, MapPin, ChevronDown, Users } from 'lucide-react';
import LenderCard from './LenderCard';

interface Lender {
  id: string;
  name: string;
  lender_type: string;
  website: string | null;
  phone: string | null;
  nmls_id: string | null;
  headquarters_state: string | null;
  rating: number;
  review_count: number;
  description: string | null;
  specialties: string[];
  min_credit_score: number;
  min_down_payment: number;
}

const lenderTypes = [
  { value: '', label: 'All Types', icon: Building2 },
  { value: 'national', label: 'National Lenders', icon: Globe },
  { value: 'regional', label: 'Regional Banks', icon: MapPin },
  { value: 'credit_union', label: 'Credit Unions', icon: Users },
  { value: 'online', label: 'Online Lenders', icon: CreditCard }
];

const specialties = [
  { value: '', label: 'All Specialties' },
  { value: 'VA', label: 'VA Loans' },
  { value: 'FHA', label: 'FHA Loans' },
  { value: 'Jumbo', label: 'Jumbo Loans' },
  { value: 'Conventional', label: 'Conventional' },
  { value: 'First-Time', label: 'First-Time Buyers' },
  { value: 'Refinance', label: 'Refinance' },
  { value: 'USDA', label: 'USDA Loans' }
];

const states = [
  { value: '', label: 'All States' },
  { value: 'FL', label: 'Florida' },
  { value: 'CA', label: 'California' },
  { value: 'TX', label: 'Texas' },
  { value: 'NY', label: 'New York' },
  { value: 'MI', label: 'Michigan' },
  { value: 'OH', label: 'Ohio' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }
];

export default function LendersSection() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  async function fetchLenders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedSpecialty) params.append('specialty', selectedSpecialty);
      if (selectedState) params.append('state', selectedState);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '24');

      const response = await fetch(`/api/lenders?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLenders(data.lenders);
        setTotal(data.total);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to load lenders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lenders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLenders();
  }, [selectedType, selectedSpecialty, selectedState]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLenders();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const activeFilterCount = [selectedType, selectedSpecialty, selectedState].filter(Boolean).length;

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find a Lender</h2>
          <p className="text-gray-500 mt-1">
            {total > 0 ? `${total} verified lenders` : 'Compare rates from top mortgage lenders'}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search lenders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Type Buttons */}
        <div className="flex flex-wrap gap-2">
          {lenderTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedType(selectedType === value ? '' : value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedType === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* More Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeFilterCount > 0 || showFilters
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          More Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {specialties.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {states.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedType('');
                setSelectedSpecialty('');
                setSelectedState('');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1" />
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={fetchLenders}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && lenders.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lenders found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
          <button
            onClick={() => {
              setSelectedType('');
              setSelectedSpecialty('');
              setSelectedState('');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Lenders Grid */}
      {!loading && !error && lenders.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lenders.map((lender, idx) => (
            <LenderCard
              key={lender.id}
              lender={lender}
              featured={idx < 3 && !selectedType && !selectedSpecialty && !selectedState && !searchQuery}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-gray-500 text-center">
        All lenders shown are NMLS-registered. Rates and terms vary. Contact lenders directly for current offers.
        CR AudioViz AI is not a lender and does not provide mortgage advice.
      </p>
    </section>
  );
}
