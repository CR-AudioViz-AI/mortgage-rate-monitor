// app/page.tsx
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ CR AudioViz AI, LLC
// Real-time mortgage rates from Federal Reserve (FRED)

import { Suspense } from 'react';
import Link from 'next/link';
import { getAllMortgageRates } from '@/lib/mortgage-rates';
import { MortgageRate } from '@/types/mortgage';

// Revalidate every hour
export const revalidate = 3600;

async function MortgageRatesDisplay() {
  try {
    const { rates, lastUpdated, dataSource } = await getAllMortgageRates();
    
    const fixedRates = rates.filter(r => 
      ['30YR_FIXED', '15YR_FIXED', '20YR_FIXED', '10YR_FIXED'].includes(r.rate_code)
    );
    const armRates = rates.filter(r => r.rate_code.includes('ARM'));
    const govRates = rates.filter(r => 
      r.rate_code.startsWith('FHA') || r.rate_code.startsWith('VA')
    );
    const jumboRates = rates.filter(r => r.rate_code.includes('JUMBO'));

    return (
      <>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Today&apos;s Mortgage Rates
              </h1>
              <p className="text-xl text-blue-200 mb-2">
                Real-time data from the Federal Reserve
              </p>
              <p className="text-sm text-blue-300">
                Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {/* Featured Rates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
              {rates.slice(0, 4).map(rate => (
                <div 
                  key={rate.rate_code}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                >
                  <div className="text-sm text-blue-200 mb-2">
                    {rate.rate_type}
                    {rate.is_estimated && ' *'}
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {rate.current_rate.toFixed(2)}%
                  </div>
                  <div className={`text-sm flex items-center justify-center gap-1 ${
                    rate.change_direction === 'down' ? 'text-green-400' :
                    rate.change_direction === 'up' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {rate.change_direction === 'up' && '↑'}
                    {rate.change_direction === 'down' && '↓'}
                    {rate.change_direction === 'unchanged' && '→'}
                    <span>{Math.abs(rate.change).toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Rates Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Complete Rate Overview
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {/* Fixed Rate Mortgages */}
              <RateCard 
                title="Fixed Rate" 
                icon="🏠"
                rates={fixedRates} 
              />
              
              {/* ARM Mortgages */}
              <RateCard 
                title="Adjustable Rate (ARM)" 
                icon="📊"
                rates={armRates} 
              />
              
              {/* Government Loans */}
              <RateCard 
                title="Government Loans" 
                icon="🏛️"
                rates={govRates} 
              />
              
              {/* Jumbo Loans */}
              <RateCard 
                title="Jumbo Loans" 
                icon="💎"
                rates={jumboRates} 
              />
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-8">
              * Estimated rates based on industry-standard spreads. 
              Official data from {dataSource}.
            </p>
          </div>
        </section>

        {/* Tools Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Mortgage Tools
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <ToolCard
                href="/calculators"
                icon="🧮"
                title="Payment Calculator"
                description="Calculate your monthly mortgage payment based on current rates"
              />
              <ToolCard
                href="/calculators"
                icon="💰"
                title="Affordability Calculator"
                description="Find out how much home you can afford"
              />
              <ToolCard
                href="/compare"
                icon="⚖️"
                title="Compare Scenarios"
                description="Compare different loan options side by side"
              />
            </div>
          </div>
        </section>

        {/* API Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Integrate Our Rates
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Use our free API to display real-time mortgage rates on your website or application.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 max-w-2xl mx-auto text-left">
              <code className="text-green-400 text-sm">
                GET /api/mortgage/rates
              </code>
            </div>
            <Link 
              href="/api-docs"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View API Documentation
            </Link>
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error('Error loading rates:', error);
    return (
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Unable to Load Rates
          </h2>
          <p className="text-red-600">
            Please try again later. Our data source may be temporarily unavailable.
          </p>
        </div>
      </section>
    );
  }
}

function RateCard({ title, icon, rates }: { 
  title: string; 
  icon: string;
  rates: MortgageRate[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {rates.map(rate => (
          <div key={rate.rate_code} className="px-6 py-4 flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-900">
                {rate.rate_type}
                {rate.is_estimated && (
                  <span className="ml-1 text-xs text-yellow-600">*</span>
                )}
              </div>
              <div className={`text-xs ${
                rate.change_direction === 'down' ? 'text-green-600' :
                rate.change_direction === 'up' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {rate.change_direction === 'up' && '↑ '}
                {rate.change_direction === 'down' && '↓ '}
                {Math.abs(rate.change).toFixed(2)}% from last week
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {rate.current_rate.toFixed(2)}%
            </div>
          </div>
        ))}
        {rates.length === 0 && (
          <div className="px-6 py-4 text-gray-500 text-center">
            No rates available
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ href, icon, title, description }: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link 
      href={href}
      className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-6 transition-colors border border-gray-200"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}

function LoadingRates() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<LoadingRates />}>
        <MortgageRatesDisplay />
      </Suspense>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Mortgage Rate Monitor</h4>
              <p className="text-gray-400 text-sm">
                Real-time mortgage rate data powered by the Federal Reserve 
                Economic Data (FRED) API. A CR AudioViz AI product.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/calculators" className="hover:text-white">Calculators</Link></li>
                <li><Link href="/compare" className="hover:text-white">Compare Loans</Link></li>
                <li><Link href="/api-docs" className="hover:text-white">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Data Source</h4>
              <p className="text-gray-400 text-sm">
                30-year and 15-year fixed rates from Freddie Mac Primary 
                Mortgage Market Survey® via FRED. Other rates estimated 
                using industry-standard spreads.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CR AudioViz AI, LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
