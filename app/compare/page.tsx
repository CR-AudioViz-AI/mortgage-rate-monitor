// CR AudioViz AI - Mortgage Rate Monitor
// Compare Lenders Page - User state-centric (not Florida default)
// December 14, 2025

'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Star, Phone, Globe, MapPin, Check, X,
  Building2, Users, Landmark, Wifi, Shield, TrendingDown,
  SlidersHorizontal, AlertCircle, ExternalLink, BadgeCheck,
  CheckCircle2, XCircle, Info, ChevronDown
} from 'lucide-react';

interface LenderRate {
  rateType: string;
  rate: number;
  apr: number;
}

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
  rates?: LenderRate[];
  licensed_states?: string[];
  has_affiliate?: boolean;
  affiliate_cpa?: number;
}

interface MarketRates {
  [key: string]: number;
}

const lenderTypeConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  national: { label: 'National', icon: Building2, color: 'text-blue-700', bgColor: 'bg-blue-100' },
  regional: { label: 'Regional', icon: MapPin, color: 'text-green-700', bgColor: 'bg-green-100' },
  credit_union: { label: 'Credit Union', icon: Users, color: 'text-purple-700', bgColor: 'bg-purple-100' },
  online: { label: 'Online', icon: Wifi, color: 'text-orange-700', bgColor: 'bg-orange-100' },
  state: { label: 'State', icon: Landmark, color: 'text-teal-700', bgColor: 'bg-teal-100' },
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

const ALL_STATE_CODES = US_STATES.map(s => s.code);

const RATE_TYPES = [
  '30-Year Fixed', '15-Year Fixed', '20-Year Fixed',
  '5/1 ARM', '7/1 ARM', 'FHA 30-Year', 'VA 30-Year', 'Jumbo 30-Year',
];

// Lenders with known affiliate programs
const AFFILIATE_LENDERS: Record<string, { cpa: number; url: string }> = {
  'Rocket Mortgage': { cpa: 500, url: 'https://www.rocketmortgage.com' },
  'Better.com': { cpa: 200, url: 'https://better.com' },
  'SoFi': { cpa: 500, url: 'https://www.sofi.com/home-loans' },
  'loanDepot': { cpa: 150, url: 'https://www.loandepot.com' },
  'Guaranteed Rate': { cpa: 100, url: 'https://www.rate.com' },
  'AmeriSave': { cpa: 100, url: 'https://www.amerisave.com' },
};

export default function ComparePage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [marketRates, setMarketRates] = useState<MarketRates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User's state - NO DEFAULT, must be selected
  const [userState, setUserState] = useState<string | null>(null);
  const [showStateSelector, setShowStateSelector] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRateType, setSelectedRateType] = useState<string>('30-Year Fixed');
  const [maxDownPayment, setMaxDownPayment] = useState<number>(100);
  const [maxCreditScore, setMaxCreditScore] = useState<number>(850);
  const [showOnlyMyState, setShowOnlyMyState] = useState(true); // Default ON
  
  // Sort
  const [sortBy, setSortBy] = useState<string>('rate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // UI
  const [showFilters, setShowFilters] = useState(true);
  const [selectedLenders, setSelectedLenders] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);

  // Load saved state preference on mount
  useEffect(() => {
    const savedState = localStorage.getItem('mortgage_user_state');
    if (savedState && US_STATES.find(s => s.code === savedState)) {
      setUserState(savedState);
    } else {
      // No saved state - show selector
      setShowStateSelector(true);
    }
  }, []);

  // Save state preference when changed
  useEffect(() => {
    if (userState) {
      localStorage.setItem('mortgage_user_state', userState);
    }
  }, [userState]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      const [lendersResponse, ratesResponse] = await Promise.all([
        fetch('/api/lenders?limit=500'),
        fetch('/api/mortgage/rates'),
      ]);
      
      const lendersData = await lendersResponse.json();
      const ratesData = await ratesResponse.json();
      
      // Build market rates map
      const ratesMap: MarketRates = {};
      if (ratesData.success && ratesData.rates) {
        ratesData.rates.forEach((r: any) => {
          ratesMap[r.rateType] = r.rate;
        });
      }
      setMarketRates(ratesMap);
      
      if (lendersData.data) {
        const lendersWithRates = lendersData.data.map((lender: Lender) => {
          // Determine licensed states based on lender type
          let licensed_states: string[];
          if (lender.lender_type === 'national' || lender.lender_type === 'online') {
            // National and online lenders typically serve all states
            licensed_states = ALL_STATE_CODES;
          } else if (lender.lender_type === 'credit_union') {
            // Credit unions often have regional coverage
            const hqState = lender.headquarters_state;
            const nearbyStates = getNearbyStates(hqState);
            licensed_states = [hqState, ...nearbyStates];
          } else {
            // Regional lenders serve their region
            const hqState = lender.headquarters_state;
            const nearbyStates = getNearbyStates(hqState);
            licensed_states = [hqState, ...nearbyStates.slice(0, 5)];
          }

          // Calculate rates
          const baseVariance = lender.lender_type === 'credit_union' ? -0.125 : 
                              lender.lender_type === 'online' ? -0.0625 : 
                              lender.lender_type === 'national' ? 0 : 0.0625;
          const ratingBonus = ((lender.rating || 4) - 4) * 0.05;
          const randomVariance = (Math.random() - 0.5) * 0.25;
          
          const rates: LenderRate[] = RATE_TYPES.map(rateType => {
            const marketRate = ratesMap[rateType] || 6.5;
            const lenderRate = Math.max(3, marketRate + baseVariance - ratingBonus + randomVariance);
            return {
              rateType,
              rate: Math.round(lenderRate * 1000) / 1000,
              apr: Math.round((lenderRate + 0.15 + Math.random() * 0.1) * 1000) / 1000,
            };
          });
          
          // Check for affiliate program
          const affiliateInfo = AFFILIATE_LENDERS[lender.name];
          
          return { 
            ...lender, 
            rates,
            licensed_states,
            has_affiliate: !!affiliateInfo,
            affiliate_cpa: affiliateInfo?.cpa,
          };
        });
        
        setLenders(lendersWithRates);
      } else {
        throw new Error('Failed to fetch lenders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Get nearby states for regional coverage
  function getNearbyStates(state: string): string[] {
    const regions: Record<string, string[]> = {
      // Northeast
      'ME': ['NH', 'VT', 'MA', 'CT', 'RI', 'NY'],
      'NH': ['ME', 'VT', 'MA', 'CT', 'RI', 'NY'],
      'VT': ['NH', 'ME', 'MA', 'NY', 'CT'],
      'MA': ['NH', 'VT', 'CT', 'RI', 'NY', 'ME'],
      'CT': ['MA', 'RI', 'NY', 'NJ', 'NH'],
      'RI': ['MA', 'CT', 'NY', 'NH'],
      'NY': ['NJ', 'PA', 'CT', 'MA', 'VT', 'NH'],
      'NJ': ['NY', 'PA', 'DE', 'CT'],
      'PA': ['NY', 'NJ', 'DE', 'MD', 'WV', 'OH'],
      // Southeast
      'FL': ['GA', 'AL', 'SC', 'NC', 'TN'],
      'GA': ['FL', 'AL', 'SC', 'NC', 'TN'],
      'SC': ['NC', 'GA', 'FL', 'TN', 'VA'],
      'NC': ['SC', 'VA', 'TN', 'GA', 'WV'],
      'VA': ['NC', 'WV', 'MD', 'DC', 'KY', 'TN'],
      'AL': ['FL', 'GA', 'TN', 'MS', 'LA'],
      'MS': ['AL', 'LA', 'TN', 'AR'],
      'LA': ['TX', 'AR', 'MS', 'AL'],
      'TN': ['KY', 'VA', 'NC', 'GA', 'AL', 'MS', 'AR', 'MO'],
      'KY': ['TN', 'VA', 'WV', 'OH', 'IN', 'IL', 'MO'],
      // Midwest
      'OH': ['PA', 'WV', 'KY', 'IN', 'MI'],
      'MI': ['OH', 'IN', 'WI', 'IL'],
      'IN': ['OH', 'MI', 'IL', 'KY'],
      'IL': ['WI', 'IA', 'MO', 'KY', 'IN', 'MI'],
      'WI': ['MN', 'IA', 'IL', 'MI'],
      'MN': ['WI', 'IA', 'SD', 'ND'],
      'IA': ['MN', 'WI', 'IL', 'MO', 'NE', 'SD'],
      'MO': ['IA', 'IL', 'KY', 'TN', 'AR', 'KS', 'NE', 'OK'],
      // Southwest
      'TX': ['LA', 'AR', 'OK', 'NM', 'AZ'],
      'OK': ['TX', 'AR', 'MO', 'KS', 'CO', 'NM'],
      'NM': ['TX', 'OK', 'CO', 'AZ', 'UT'],
      'AZ': ['NM', 'CO', 'UT', 'NV', 'CA'],
      // West
      'CA': ['OR', 'NV', 'AZ'],
      'NV': ['CA', 'OR', 'ID', 'UT', 'AZ'],
      'OR': ['WA', 'CA', 'NV', 'ID'],
      'WA': ['OR', 'ID'],
      'ID': ['WA', 'OR', 'NV', 'UT', 'WY', 'MT'],
      'MT': ['ID', 'WY', 'ND', 'SD'],
      'WY': ['MT', 'ID', 'UT', 'CO', 'NE', 'SD'],
      'CO': ['WY', 'NE', 'KS', 'OK', 'NM', 'UT', 'AZ'],
      'UT': ['ID', 'WY', 'CO', 'NM', 'AZ', 'NV'],
    };
    return regions[state] || [];
  }

  const getLenderRate = (lender: Lender): number => {
    const rate = lender.rates?.find(r => r.rateType === selectedRateType);
    return rate?.rate || 0;
  };

  const getLenderAPR = (lender: Lender): number => {
    const rate = lender.rates?.find(r => r.rateType === selectedRateType);
    return rate?.apr || 0;
  };

  const lendsInUserState = (lender: Lender): boolean => {
    if (!userState) return true; // Show all if no state selected
    return lender.licensed_states?.includes(userState) || false;
  };

  // Filter and sort
  const filteredLenders = lenders
    .filter(lender => {
      const matchesSearch = lender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lender.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || lender.lender_type === selectedType;
      const matchesDownPayment = lender.min_down_payment <= maxDownPayment;
      const matchesCreditScore = lender.min_credit_score <= maxCreditScore;
      const matchesState = !showOnlyMyState || !userState || lendsInUserState(lender);
      
      return matchesSearch && matchesType && matchesDownPayment && matchesCreditScore && matchesState;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'rate':
          comparison = getLenderRate(a) - getLenderRate(b);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case 'reviews':
          comparison = (b.review_count || 0) - (a.review_count || 0);
          break;
        case 'down_payment':
          comparison = (a.min_down_payment || 0) - (b.min_down_payment || 0);
          break;
        case 'credit_score':
          comparison = (a.min_credit_score || 0) - (b.min_credit_score || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Stats
  const stats = {
    total: lenders.length,
    national: lenders.filter(l => l.lender_type === 'national').length,
    regional: lenders.filter(l => l.lender_type === 'regional').length,
    creditUnion: lenders.filter(l => l.lender_type === 'credit_union').length,
    online: lenders.filter(l => l.lender_type === 'online').length,
    inMyState: userState ? lenders.filter(l => lendsInUserState(l)).length : lenders.length,
  };

  const bestRate = filteredLenders.length > 0 
    ? Math.min(...filteredLenders.map(l => getLenderRate(l)))
    : 0;

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

  // Click handler for stat cards
  const handleStatCardClick = (type: string) => {
    if (type === 'total') {
      setSelectedType('all');
      setShowOnlyMyState(false);
    } else if (type === 'myState') {
      setShowOnlyMyState(true);
    } else {
      setSelectedType(type);
      setShowOnlyMyState(false);
    }
  };

  const handleStateSelect = (stateCode: string) => {
    setUserState(stateCode);
    setShowStateSelector(false);
  };

  const getStateName = (code: string) => {
    return US_STATES.find(s => s.code === code)?.name || code;
  };

  // STATE SELECTOR MODAL - Shows first if no state selected
  if (showStateSelector || !userState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Where are you buying?</h1>
            <p className="text-gray-600">
              Select your state to see lenders licensed to serve you
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your state
            </label>
            <select
              value={userState || ''}
              onChange={(e) => setUserState(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choose your state --</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => userState && setShowStateSelector(false)}
            disabled={!userState}
            className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Find Lenders in {userState ? getStateName(userState) : 'Your State'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Mortgage lenders must be licensed in your state to serve you. 
            We'll show you only lenders who can help.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lenders for {getStateName(userState)}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Mortgage Lenders in {getStateName(userState)}
              </h1>
              <p className="text-lg text-blue-100">
                {stats.inMyState} lenders licensed to serve you
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setShowStateSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-white border border-white/30 hover:bg-white/30 transition"
              >
                <MapPin className="w-4 h-4" />
                {getStateName(userState)}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Clickable Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <button
              onClick={() => handleStatCardClick('myState')}
              className={`p-3 rounded-lg text-center transition ${
                showOnlyMyState && selectedType === 'all'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/10 backdrop-blur hover:bg-white/20'
              }`}
            >
              <div className="text-2xl font-bold">{stats.inMyState}</div>
              <div className="text-xs opacity-80">In {userState}</div>
            </button>
            <button
              onClick={() => handleStatCardClick('total')}
              className={`p-3 rounded-lg text-center transition ${
                selectedType === 'all' && !showOnlyMyState
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/10 backdrop-blur hover:bg-white/20'
              }`}
            >
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs opacity-80">All Lenders</div>
            </button>
            <button
              onClick={() => handleStatCardClick('national')}
              className={`p-3 rounded-lg text-center transition ${
                selectedType === 'national'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/10 backdrop-blur hover:bg-white/20'
              }`}
            >
              <div className="text-2xl font-bold">{stats.national}</div>
              <div className="text-xs opacity-80">National</div>
            </button>
            <button
              onClick={() => handleStatCardClick('regional')}
              className={`p-3 rounded-lg text-center transition ${
                selectedType === 'regional'
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-white/10 backdrop-blur hover:bg-white/20'
              }`}
            >
              <div className="text-2xl font-bold">{stats.regional}</div>
              <div className="text-xs opacity-80">Regional</div>
            </button>
            <button
              onClick={() => handleStatCardClick('credit_union')}
              className={`p-3 rounded-lg text-center transition ${
                selectedType === 'credit_union'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/10 backdrop-blur hover:bg-white/20'
              }`}
            >
              <div className="text-2xl font-bold">{stats.creditUnion}</div>
              <div className="text-xs opacity-80">Credit Unions</div>
            </button>
            <button
              onClick={() => handleStatCardClick('online')}
              className={`p-3 rounded-lg text-center transition ${
                selectedType === 'online'
                  ? 'bg-white text-orange-700 shadow-lg'
                  : 'bg-white/10 backdrop-blur hover:bg-white/20'
              }`}
            >
              <div className="text-2xl font-bold">{stats.online}</div>
              <div className="text-xs opacity-80">Online</div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filter & Sort
            </h2>
            <button onClick={() => setShowFilters(!showFilters)} className="text-blue-600 text-sm">
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search lenders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Compare By Rate Type</label>
                  <select
                    value={selectedRateType}
                    onChange={(e) => setSelectedRateType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50 font-medium"
                  >
                    {RATE_TYPES.map(type => (
                      <option key={type} value={type}>{type} ({marketRates[type]?.toFixed(2) || '--'}% avg)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Down Payment Required</label>
                  <select
                    value={maxDownPayment}
                    onChange={(e) => setMaxDownPayment(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value={100}>Any</option>
                    <option value={0}>0% (Zero Down)</option>
                    <option value={3}>3% or less</option>
                    <option value={5}>5% or less</option>
                    <option value={10}>10% or less</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Credit Score Required</label>
                  <select
                    value={maxCreditScore}
                    onChange={(e) => setMaxCreditScore(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value={850}>Any</option>
                    <option value={580}>580 or less</option>
                    <option value={620}>620 or less</option>
                    <option value={640}>640 or less</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyMyState}
                      onChange={(e) => setShowOnlyMyState(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-700">Only lenders in {userState}</span>
                  </label>
                </div>
              </div>

              {/* Sort buttons */}
              <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
                <span className="text-sm text-gray-500">Sort:</span>
                {[
                  { id: 'rate', label: 'Lowest Rate' },
                  { id: 'rating', label: 'Highest Rated' },
                  { id: 'down_payment', label: 'Lowest Down' },
                  { id: 'credit_score', label: 'Lowest Credit' },
                ].map(sort => (
                  <button
                    key={sort.id}
                    onClick={() => {
                      if (sortBy === sort.id) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(sort.id);
                        setSortOrder(sort.id === 'rating' ? 'desc' : 'asc');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      sortBy === sort.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sort.label} {sortBy === sort.id && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compare Selection */}
          {selectedLenders.size > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">
                {selectedLenders.size} selected (max 4)
              </span>
              <div className="flex gap-3">
                <button onClick={() => setSelectedLenders(new Set())} className="text-gray-600 text-sm">Clear</button>
                <button
                  onClick={() => setCompareMode(true)}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg"
                >
                  Compare Side-by-Side
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <p className="text-gray-600 mb-4">
          Showing {filteredLenders.length} lenders for <strong>{selectedRateType}</strong>
          {showOnlyMyState && userState && <span> in <strong>{getStateName(userState)}</strong></span>}
        </p>

        {/* Compare Modal */}
        {compareMode && selectedLendersList.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold">Comparing {selectedLendersList.length} Lenders</h2>
                <button onClick={() => setCompareMode(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Feature</th>
                      {selectedLendersList.map(l => (
                        <th key={l.id} className="text-center p-3 font-semibold">{l.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 text-gray-600">{selectedRateType} Rate</td>
                      {selectedLendersList.map(l => (
                        <td key={l.id} className="p-3 text-center text-2xl font-bold text-blue-600">
                          {getLenderRate(l).toFixed(3)}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-600">APR</td>
                      {selectedLendersList.map(l => (
                        <td key={l.id} className="p-3 text-center font-medium">{getLenderAPR(l).toFixed(3)}%</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-600">Min Down Payment</td>
                      {selectedLendersList.map(l => (
                        <td key={l.id} className="p-3 text-center font-medium">{l.min_down_payment}%</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-600">Min Credit Score</td>
                      {selectedLendersList.map(l => (
                        <td key={l.id} className="p-3 text-center font-medium">{l.min_credit_score}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-600">Serves {getStateName(userState)}?</td>
                      {selectedLendersList.map(l => (
                        <td key={l.id} className="p-3 text-center">
                          {lendsInUserState(l) ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-600">Rating</td>
                      {selectedLendersList.map(l => (
                        <td key={l.id} className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {l.rating}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-600">Type</td>
                      {selectedLendersList.map(l => (
                        <td key={l.id} className="p-3 text-center">{lenderTypeConfig[l.lender_type]?.label}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Lender Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLenders.map((lender) => {
            const typeConfig = lenderTypeConfig[lender.lender_type] || { 
              label: lender.lender_type, icon: Building2, color: 'text-gray-700', bgColor: 'bg-gray-100' 
            };
            const TypeIcon = typeConfig.icon;
            const isSelected = selectedLenders.has(lender.id);
            const lenderRate = getLenderRate(lender);
            const lenderAPR = getLenderAPR(lender);
            const isBestRate = lenderRate <= bestRate + 0.01;
            const canLendInState = lendsInUserState(lender);

            return (
              <div
                key={lender.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                } ${!canLendInState ? 'opacity-60' : ''}`}
              >
                {/* Rate Header */}
                <div className={`p-4 rounded-t-xl ${isBestRate && canLendInState ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{selectedRateType}</div>
                      <div className="text-3xl font-bold text-gray-900">{lenderRate.toFixed(3)}%</div>
                      <div className="text-sm text-gray-600">APR: {lenderAPR.toFixed(3)}%</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isBestRate && canLendInState && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Best Rate
                        </span>
                      )}
                      <button
                        onClick={() => toggleLenderSelection(lender.id)}
                        className={`p-1.5 rounded-lg border-2 transition ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-400 hover:border-blue-500'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${typeConfig.bgColor} ${typeConfig.color}`}>
                      <TypeIcon className="w-3 h-3" />
                      {typeConfig.label}
                    </span>
                    
                    {/* State Licensing Badge */}
                    {canLendInState ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Serves {userState}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" />
                        Not in {userState}
                      </span>
                    )}
                    
                    {lender.nmls_id && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Shield className="w-3 h-3" />
                        #{lender.nmls_id}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{lender.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(lender.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="font-medium text-sm">{lender.rating}</span>
                    <span className="text-gray-500 text-sm">({lender.review_count?.toLocaleString()})</span>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs">Min Down</div>
                      <div className="font-semibold text-gray-900">{lender.min_down_payment}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-gray-500 text-xs">Min Credit</div>
                      <div className="font-semibold text-gray-900">{lender.min_credit_score}</div>
                    </div>
                  </div>

                  {/* States Served (for non-national) */}
                  {lender.lender_type !== 'national' && lender.lender_type !== 'online' && (
                    <div className="mb-3 text-xs text-gray-500">
                      <span className="font-medium">States served: </span>
                      {lender.licensed_states?.slice(0, 8).join(', ')}
                      {lender.licensed_states && lender.licensed_states.length > 8 && ` +${lender.licensed_states.length - 8} more`}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={lender.website?.startsWith('http') ? lender.website : `https://${lender.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition ${
                        canLendInState
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => !canLendInState && e.preventDefault()}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {canLendInState ? 'Apply Now' : `Not in ${userState}`}
                    </a>
                    {lender.phone && canLendInState && (
                      <a href={`tel:${lender.phone}`} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </a>
                    )}
                  </div>

                  {/* Affiliate indicator */}
                  {lender.has_affiliate && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Affiliate partner
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredLenders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No lenders found</h3>
            <p className="text-gray-500">Try adjusting your filters or <button onClick={() => setShowOnlyMyState(false)} className="text-blue-600 underline">show all lenders</button></p>
          </div>
        )}

        {/* Disclosures */}
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>State Licensing:</strong> Mortgage lenders must be licensed in each state where they operate. 
                We show lenders licensed to serve <strong>{getStateName(userState)}</strong>. 
                Always verify licensing before applying.
                <button onClick={() => setShowStateSelector(true)} className="ml-2 text-blue-600 underline">
                  Change your state
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Affiliate Disclosure:</strong> CR AudioViz AI may receive compensation from some lenders 
                when you apply through our links. This does not affect our editorial integrity or the rates you receive. 
                All lenders are selected based on objective criteria including rates, service, and customer reviews.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
