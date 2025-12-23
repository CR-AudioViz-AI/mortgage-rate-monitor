// CR AudioViz AI - Mortgage Rate Monitor
// Down Payment Assistance Finder
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RotatingAds from '@/components/RotatingAds';

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

interface DPAProgram {
  name: string;
  type: string;
  amount: string;
  forgivable: boolean;
  requirements: string[];
  incomeLimit: string;
  firstTimeOnly: boolean;
  link: string;
}

// Federal programs available nationwide
const FEDERAL_PROGRAMS: DPAProgram[] = [
  {
    name: 'FHA Loan',
    type: 'Federal',
    amount: '3.5% down (vs 20%)',
    forgivable: false,
    requirements: ['580+ credit score', 'Primary residence', 'Mortgage insurance required'],
    incomeLimit: 'No limit',
    firstTimeOnly: false,
    link: 'https://www.hud.gov/buying/loans',
  },
  {
    name: 'VA Loan',
    type: 'Federal',
    amount: '0% down',
    forgivable: false,
    requirements: ['Military service', 'Certificate of Eligibility', 'Primary residence'],
    incomeLimit: 'No limit',
    firstTimeOnly: false,
    link: 'https://www.va.gov/housing-assistance/home-loans/',
  },
  {
    name: 'USDA Loan',
    type: 'Federal',
    amount: '0% down',
    forgivable: false,
    requirements: ['Rural area', 'Income limits apply', 'Primary residence'],
    incomeLimit: '115% of area median income',
    firstTimeOnly: false,
    link: 'https://www.rd.usda.gov/programs-services/single-family-housing-programs',
  },
  {
    name: 'Good Neighbor Next Door',
    type: 'HUD',
    amount: '50% off list price',
    forgivable: true,
    requirements: ['Teacher, firefighter, EMT, or law enforcement', '3-year occupancy', 'HUD-foreclosed homes only'],
    incomeLimit: 'No limit',
    firstTimeOnly: false,
    link: 'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot',
  },
  {
    name: 'HomeReady (Fannie Mae)',
    type: 'Federal',
    amount: '3% down',
    forgivable: false,
    requirements: ['620+ credit', 'Income limits in some areas', 'Homeownership education'],
    incomeLimit: '80% of area median income',
    firstTimeOnly: false,
    link: 'https://singlefamily.fanniemae.com/originating-underwriting/mortgage-products/homeready-mortgage',
  },
  {
    name: 'Home Possible (Freddie Mac)',
    type: 'Federal',
    amount: '3% down',
    forgivable: false,
    requirements: ['660+ credit', 'Income limits apply', 'Homeownership education'],
    incomeLimit: '80% of area median income',
    firstTimeOnly: false,
    link: 'https://sf.freddiemac.com/working-with-us/origination-underwriting/mortgage-products/home-possible',
  },
];

// State-specific programs (sample data - would be API in production)
const STATE_PROGRAMS: Record<string, DPAProgram[]> = {
  'FL': [
    {
      name: 'Florida Hometown Heroes',
      type: 'State',
      amount: 'Up to $35,000',
      forgivable: true,
      requirements: ['Florida worker (50+ eligible professions)', 'First-time buyer', 'Primary residence'],
      incomeLimit: 'Varies by county',
      firstTimeOnly: true,
      link: 'https://www.floridahousing.org/programs/homebuyer-overview-page/hometown-heroes',
    },
    {
      name: 'FL Assist',
      type: 'State',
      amount: 'Up to $10,000',
      forgivable: false,
      requirements: ['First-time buyer', 'Income limits', 'Homebuyer education'],
      incomeLimit: 'Varies by county',
      firstTimeOnly: true,
      link: 'https://www.floridahousing.org/programs/homebuyer-overview-page/florida-assist',
    },
    {
      name: 'FL HLP Second Mortgage',
      type: 'State',
      amount: 'Up to $10,000',
      forgivable: false,
      requirements: ['0% interest', 'Deferred payment', 'Due on sale/refinance'],
      incomeLimit: 'Varies by county',
      firstTimeOnly: true,
      link: 'https://www.floridahousing.org/programs/homebuyer-overview-page/florida-hlp-second-mortgage',
    },
  ],
  'TX': [
    {
      name: 'Texas State Affordable Housing Corp',
      type: 'State',
      amount: '5% of loan amount',
      forgivable: true,
      requirements: ['First-time buyer or veteran', 'Income limits', 'Homebuyer education'],
      incomeLimit: 'Varies by county',
      firstTimeOnly: true,
      link: 'https://www.tsahc.org/homebuyers-renters/loans-down-payment-assistance',
    },
  ],
  'CA': [
    {
      name: 'CalHFA MyHome Assistance',
      type: 'State',
      amount: 'Up to 3.5% of purchase price',
      forgivable: false,
      requirements: ['First-time buyer', 'Income limits', 'Homebuyer education'],
      incomeLimit: 'Varies by county',
      firstTimeOnly: true,
      link: 'https://www.calhfa.ca.gov/homeownership/programs/myhome.htm',
    },
  ],
  'NY': [
    {
      name: 'SONYMA Down Payment Assistance',
      type: 'State',
      amount: 'Up to $15,000 or 3%',
      forgivable: false,
      requirements: ['First-time buyer', 'Income limits', 'Credit score 620+'],
      incomeLimit: 'Varies by county',
      firstTimeOnly: true,
      link: 'https://hcr.ny.gov/sonyma',
    },
  ],
};

export default function DownPaymentAssistancePage() {
  const [selectedState, setSelectedState] = useState('');
  const [income, setIncome] = useState(75000);
  const [homePrice, setHomePrice] = useState(350000);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isVeteran, setIsVeteran] = useState(false);
  const [occupation, setOccupation] = useState('');
  const [programs, setPrograms] = useState<DPAProgram[]>([]);

  useEffect(() => {
    // Load saved location
    const saved = localStorage.getItem('mortgageMonitor_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.state) setSelectedState(parsed.state);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Filter programs based on criteria
    let available: DPAProgram[] = [...FEDERAL_PROGRAMS];
    
    // Add state programs
    if (selectedState && STATE_PROGRAMS[selectedState]) {
      available = [...available, ...STATE_PROGRAMS[selectedState]];
    }
    
    // Filter by first-time buyer
    if (!isFirstTime) {
      available = available.filter(p => !p.firstTimeOnly);
    }
    
    // Highlight VA for veterans
    if (isVeteran) {
      available = available.sort((a, b) => {
        if (a.name.includes('VA')) return -1;
        if (b.name.includes('VA')) return 1;
        return 0;
      });
    }
    
    setPrograms(available);
  }, [selectedState, isFirstTime, isVeteran, income]);

  const stateName = US_STATES.find(s => s.code === selectedState)?.name || '';
  const downPayment20 = homePrice * 0.2;
  const downPayment3 = homePrice * 0.03;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💵 Down Payment Assistance</h1>
          <p className="text-slate-400">Find programs that can help you buy a home with less money down</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filters */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Annual Household Income</label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Target Home Price</label>
                  <input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="firstTime"
                    checked={isFirstTime}
                    onChange={(e) => setIsFirstTime(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="firstTime" className="text-white">First-time homebuyer</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="veteran"
                    checked={isVeteran}
                    onChange={(e) => setIsVeteran(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="veteran" className="text-white">Veteran or active military</label>
                </div>
              </div>
            </div>

            {/* Down Payment Summary */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="text-emerald-400 font-bold mb-4">Down Payment Needed</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Traditional (20%)</span>
                  <span className="text-white font-medium">${downPayment20.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Low-down (3%)</span>
                  <span className="text-emerald-400 font-medium">${downPayment3.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VA/USDA (0%)</span>
                  <span className="text-emerald-400 font-bold">$0</span>
                </div>
                <div className="pt-3 border-t border-emerald-500/30">
                  <p className="text-emerald-300 text-sm">
                    💡 You could save up to ${downPayment20.toLocaleString()} with assistance programs!
                  </p>
                </div>
              </div>
            </div>

            <RotatingAds variant="sidebar" showMultiple={1} interval={12000} />
          </div>

          {/* Programs List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {programs.length} Programs Available
                {selectedState && ` for ${stateName}`}
              </h2>
            </div>

            <div className="space-y-4">
              {programs.map((program, idx) => (
                <div 
                  key={idx}
                  className={`bg-slate-800/50 rounded-2xl p-6 border transition-all hover:border-slate-500 ${
                    program.type === 'State' ? 'border-emerald-500/30' : 'border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{program.name}</h3>
                        {program.forgivable && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                            Forgivable
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{program.type} Program</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">{program.amount}</p>
                      {program.incomeLimit !== 'No limit' && (
                        <p className="text-slate-500 text-xs">Income limit: {program.incomeLimit}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-2">Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {program.requirements.map((req, i) => (
                        <span key={i} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                      {program.firstTimeOnly ? (
                        <span className="text-amber-400">⚠️ First-time buyers only</span>
                      ) : (
                        <span className="text-emerald-400">✓ Repeat buyers eligible</span>
                      )}
                    </div>
                    <a
                      href={program.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                    >
                      Learn More →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
              <p className="text-slate-500 text-sm">
                ⚠️ Program availability and requirements change frequently. Contact each program directly to verify current eligibility requirements and application procedures. This is not financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
