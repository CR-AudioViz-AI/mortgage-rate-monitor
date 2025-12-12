// components/MortgageRatesWidget.tsx
// CR AudioViz AI - Embeddable Mortgage Rates Widget
// Roy Henderson @ CR AudioViz AI, LLC
// Use this component in Realtor Platform or any other app

'use client';

import React, { useEffect, useState } from 'react';

interface Rate {
  rate_type: string;
  rate_code: string;
  current_rate: number;
  change: number;
  change_direction: 'up' | 'down' | 'unchanged';
  is_estimated: boolean;
}

interface MortgageRatesWidgetProps {
  variant?: 'compact' | 'full' | 'inline';
  showEstimated?: boolean;
  rateTypes?: string[];
  refreshInterval?: number;
  className?: string;
  apiEndpoint?: string;
}

export function MortgageRatesWidget({
  variant = 'compact',
  showEstimated = true,
  rateTypes,
  refreshInterval = 300000, // 5 minutes
  className = '',
  apiEndpoint = '/api/mortgage/rates',
}: MortgageRatesWidgetProps) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        if (data.success) {
          let filteredRates = data.rates;
          
          // Filter by rate types if specified
          if (rateTypes && rateTypes.length > 0) {
            filteredRates = filteredRates.filter((r: Rate) => 
              rateTypes.includes(r.rate_code)
            );
          }
          
          // Filter out estimated if not wanted
          if (!showEstimated) {
            filteredRates = filteredRates.filter((r: Rate) => !r.is_estimated);
          }
          
          setRates(filteredRates);
          setLastUpdated(data.rates[0]?.last_updated || '');
        }
        setError(null);
      } catch (err) {
        setError('Unable to load rates');
        console.error('Widget error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, refreshInterval);
    return () => clearInterval(interval);
  }, [apiEndpoint, rateTypes, showEstimated, refreshInterval]);

  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getChangeColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // Inline variant - single line display
  if (variant === 'inline') {
    const primaryRates = rates.filter(r => 
      ['30YR_FIXED', '15YR_FIXED'].includes(r.rate_code)
    );
    
    return (
      <div className={`flex items-center gap-4 text-sm ${className}`}>
        <span className="text-gray-500">Current Rates:</span>
        {primaryRates.map((rate, idx) => (
          <React.Fragment key={rate.rate_code}>
            <span className="font-medium">
              {rate.rate_type.replace('-Year Fixed', 'yr')}: {rate.current_rate.toFixed(2)}%
              <span className={`ml-1 ${getChangeColor(rate.change_direction)}`}>
                {getChangeIcon(rate.change_direction)}
              </span>
            </span>
            {idx < primaryRates.length - 1 && <span className="text-gray-300">|</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Compact variant - small card
  if (variant === 'compact') {
    const primaryRates = rates.slice(0, 4);
    
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Today&apos;s Rates</h3>
          <span className="text-xs text-gray-400">
            {lastUpdated && new Date(lastUpdated).toLocaleDateString()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {primaryRates.map(rate => (
            <div key={rate.rate_code} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {rate.rate_type.replace('-Year Fixed', 'yr').replace(' ARM', '')}
                {rate.is_estimated && '*'}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {rate.current_rate.toFixed(2)}%
              </div>
              <div className={`text-xs ${getChangeColor(rate.change_direction)}`}>
                {getChangeIcon(rate.change_direction)} {Math.abs(rate.change).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
        {rates.some(r => r.is_estimated) && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            *Estimated based on market spreads
          </p>
        )}
      </div>
    );
  }

  // Full variant - detailed display
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Current Mortgage Rates</h3>
          <span className="text-sm text-gray-500">
            Updated: {lastUpdated && new Date(lastUpdated).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Source: Federal Reserve Economic Data (FRED)
        </p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {rates.map(rate => (
          <div 
            key={rate.rate_code} 
            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium text-gray-900">
                  {rate.rate_type}
                  {rate.is_estimated && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      Est.
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {rate.is_estimated ? 'Based on market spread' : 'Official FRED data'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {rate.current_rate.toFixed(2)}%
              </div>
              <div className={`text-sm flex items-center justify-end gap-1 ${getChangeColor(rate.change_direction)}`}>
                <span>{getChangeIcon(rate.change_direction)}</span>
                <span>{Math.abs(rate.change).toFixed(2)}% from last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-3 bg-gray-50 rounded-b-xl">
        <p className="text-xs text-gray-500 text-center">
          Rates are national averages. Your actual rate may vary based on credit score, 
          down payment, and other factors.
        </p>
      </div>
    </div>
  );
}

export default MortgageRatesWidget;
