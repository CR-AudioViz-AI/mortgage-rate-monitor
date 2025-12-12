'use client';

// Embeddable Mortgage Rate Widget
// CR AudioViz AI - For use in Realtor Platform and external sites
// Roy Henderson @ December 2025

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface MortgageRate {
  rateType: string;
  rate: number;
  previousRate: number;
  change: number;
  source: 'FRED' | 'CALCULATED';
}

interface MortgageWidgetProps {
  // API endpoint - use default or custom
  apiUrl?: string;
  // Which rate types to show
  showTypes?: string[];
  // Styling
  theme?: 'light' | 'dark';
  compact?: boolean;
  // Show only official rates
  officialOnly?: boolean;
}

export default function MortgageWidget({
  apiUrl = '/api/mortgage/rates',
  showTypes = ['30-Year Fixed', '15-Year Fixed'],
  theme = 'light',
  compact = false,
  officialOnly = true,
}: MortgageWidgetProps) {
  const [rates, setRates] = useState<MortgageRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        if (data.success) {
          let filteredRates = data.rates.filter((r: MortgageRate) => 
            showTypes.includes(r.rateType)
          );
          
          if (officialOnly) {
            filteredRates = filteredRates.filter((r: MortgageRate) => 
              r.source === 'FRED'
            );
          }
          
          setRates(filteredRates);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, [apiUrl, showTypes, officialOnly]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  if (loading) {
    return (
      <div className={`${bgColor} ${borderColor} border rounded-lg p-4 flex items-center justify-center`}>
        <RefreshCw className={`w-5 h-5 ${mutedColor} animate-spin`} />
      </div>
    );
  }

  if (error || !rates.length) {
    return (
      <div className={`${bgColor} ${borderColor} border rounded-lg p-4 text-center ${mutedColor}`}>
        Unable to load rates
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`${bgColor} ${borderColor} border rounded-lg p-3 flex items-center gap-4`}>
        {rates.map((rate) => (
          <div key={rate.rateType} className="flex items-center gap-2">
            <span className={`text-sm ${mutedColor}`}>
              {rate.rateType.replace('-Year Fixed', 'Y')}:
            </span>
            <span className={`font-bold ${textColor}`}>
              {rate.rate.toFixed(2)}%
            </span>
            {rate.change !== 0 && (
              rate.change > 0 ? (
                <TrendingUp className="w-3 h-3 text-red-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-green-500" />
              )
            )}
          </div>
        ))}
        <a 
          href="https://craudiovizai.com"
          className={`text-xs ${mutedColor} ml-auto hover:underline`}
          target="_blank"
          rel="noopener noreferrer"
        >
          CR AudioViz AI
        </a>
      </div>
    );
  }

  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-b ${borderColor}`}>
        <h3 className={`font-semibold ${textColor}`}>Current Mortgage Rates</h3>
        <p className={`text-xs ${mutedColor}`}>Source: Freddie Mac PMMS</p>
      </div>

      {/* Rates */}
      <div className="divide-y divide-gray-200">
        {rates.map((rate) => (
          <div key={rate.rateType} className="p-4 flex items-center justify-between">
            <div>
              <p className={`font-medium ${textColor}`}>{rate.rateType}</p>
              <p className={`text-xs ${mutedColor}`}>
                Previous: {rate.previousRate.toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${textColor}`}>
                {rate.rate.toFixed(2)}%
              </p>
              <div className={`flex items-center gap-1 text-sm ${
                rate.change > 0 ? 'text-red-500' : 
                rate.change < 0 ? 'text-green-500' : 
                mutedColor
              }`}>
                {rate.change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : rate.change < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span>
                  {rate.change > 0 ? '+' : ''}{rate.change.toFixed(3)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`px-4 py-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-t ${borderColor}`}>
        <a 
          href="https://craudiovizai.com"
          className={`text-xs ${mutedColor} hover:underline`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by CR AudioViz AI
        </a>
      </div>
    </div>
  );
}

// Export for use in Realtor Platform
export { MortgageWidget };
