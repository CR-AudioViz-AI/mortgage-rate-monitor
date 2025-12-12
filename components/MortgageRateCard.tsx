'use client';

// MortgageRateCard Component
// CR AudioViz AI - Mortgage Rate Monitor
// Roy Henderson @ December 2025

import { ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';
import type { MortgageRate } from '@/types/mortgage';

interface MortgageRateCardProps {
  rate: MortgageRate;
  showDetails?: boolean;
}

export default function MortgageRateCard({ rate, showDetails = true }: MortgageRateCardProps) {
  const isUp = rate.change > 0;
  const isDown = rate.change < 0;
  const isUnchanged = rate.change === 0;

  const getChangeColor = () => {
    if (isUp) return 'text-red-500';
    if (isDown) return 'text-green-500';
    return 'text-gray-500';
  };

  const getChangeBg = () => {
    if (isUp) return 'bg-red-50 border-red-200';
    if (isDown) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  const ChangeIcon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${getChangeBg()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{rate.rateType}</h3>
          {rate.source === 'CALCULATED' && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Info className="w-3 h-3" />
              Estimated
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getChangeColor()} ${isUp ? 'bg-red-100' : isDown ? 'bg-green-100' : 'bg-gray-100'}`}>
          <ChangeIcon className="w-4 h-4" />
          <span>{Math.abs(rate.change).toFixed(3)}%</span>
        </div>
      </div>

      {/* Main Rate */}
      <div className="mb-4">
        <span className="text-4xl font-bold text-gray-900">{rate.rate.toFixed(2)}</span>
        <span className="text-2xl text-gray-600">%</span>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Previous</span>
            <span className="font-medium text-gray-700">{rate.previousRate.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Change</span>
            <span className={`font-medium ${getChangeColor()}`}>
              {isUp ? '+' : ''}{rate.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Updated</span>
            <span className="font-medium text-gray-700">
              {new Date(rate.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Source</span>
            <span className="font-medium text-gray-700">
              {rate.source === 'FRED' ? 'Freddie Mac' : 'Calculated'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
