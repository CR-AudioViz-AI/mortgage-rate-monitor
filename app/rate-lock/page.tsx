// CR AudioViz AI - Mortgage Rate Monitor
// RATE LOCK ADVISOR - When to Lock Your Rate
// December 22, 2025

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RateAnalysis {
  currentRate: number;
  volatility: {
    trend: 'rising' | 'falling' | 'stable';
    trendStrength: number;
    volatilityRating: string;
    maxSwing: number;
  };
  recommendation: {
    recommendation: 'lock_now' | 'wait' | 'float_cautiously';
    confidence: number;
    rationale: string[];
    riskAssessment: {
      ifRatesRise: { probability: number; costImpact: number };
      ifRatesFall: { probability: number; savingsImpact: number };
    };
    optimalLockPeriod: number;
    targetRate: number | null;
    alerts: string[];
  };
  lockOptions: {
    days: number;
    description: string;
    rateAdjustment: number;
    effectiveRate: number;
    monthlyPayment: number;
    extraCost: number;
  }[];
  upcomingEvents: {
    date: string;
    event: string;
    impact: string;
  }[];
}

export default function RateLockAdvisor() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RateAnalysis | null>(null);
  const [formData, setFormData] = useState({
    currentRate: 6.22,
    closingDays: 30,
    loanAmount: 400000,
    targetRate: '',
  });

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rate-timing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRate: formData.currentRate,
          closingDays: formData.closingDays,
          loanAmount: formData.loanAmount,
          targetRate: formData.targetRate ? parseFloat(formData.targetRate) : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalysis({
          currentRate: data.input.currentRate,
          volatility: data.marketAnalysis.volatility,
          recommendation: data.recommendation,
          lockOptions: data.lockOptions,
          upcomingEvents: data.marketAnalysis.upcomingEvents,
        });
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'lock_now':
        return {
          bg: 'from-emerald-600 to-green-600',
          icon: '🔒',
          title: 'Lock Now',
          subtitle: 'Conditions favor locking today',
        };
      case 'wait':
        return {
          bg: 'from-blue-600 to-cyan-600',
          icon: '⏳',
          title: 'Wait',
          subtitle: 'Rates may improve soon',
        };
      case 'float_cautiously':
        return {
          bg: 'from-yellow-600 to-orange-600',
          icon: '⚖️',
          title: 'Float Cautiously',
          subtitle: 'Market is uncertain',
        };
      default:
        return {
          bg: 'from-slate-600 to-slate-700',
          icon: '❓',
          title: 'Analyzing',
          subtitle: 'Gathering data...',
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Rate Lock Advisor
          </h1>
          <p className="text-amber-100 text-lg">
            Should you lock today? AI-powered timing recommendations based on market analysis.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6">Your Scenario</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Current Rate Offered</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentRate}
                      onChange={(e) => setFormData({ ...formData, currentRate: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white text-xl focus:border-amber-500 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Days Until Closing</label>
                  <select
                    value={formData.closingDays}
                    onChange={(e) => setFormData({ ...formData, closingDays: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none"
                  >
                    <option value={15}>15 days</option>
                    <option value={21}>21 days</option>
                    <option value={30}>30 days</option>
                    <option value={45}>45 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Loan Amount</label>
                  <input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Target Rate (Optional)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 5.99"
                      value={formData.targetRate}
                      onChange={(e) => setFormData({ ...formData, targetRate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">We'll alert you when rates hit your target</p>
                </div>

                <button
                  onClick={fetchAnalysis}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-amber-500 hover:to-orange-500 transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Get Recommendation'}
                </button>
              </div>
            </div>

            {/* Market Status */}
            {analysis && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Market Status</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trend</span>
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{getTrendIcon(analysis.volatility.trend)}</span>
                      <span className={`font-bold capitalize ${
                        analysis.volatility.trend === 'rising' ? 'text-red-400' :
                        analysis.volatility.trend === 'falling' ? 'text-emerald-400' : 'text-yellow-400'
                      }`}>
                        {analysis.volatility.trend}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Volatility</span>
                    <span className={`font-bold capitalize ${
                      analysis.volatility.volatilityRating === 'low' ? 'text-emerald-400' :
                      analysis.volatility.volatilityRating === 'moderate' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {analysis.volatility.volatilityRating}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recent Swing</span>
                    <span className="text-white font-medium">{analysis.volatility.maxSwing}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trend Strength</span>
                    <span className="text-white font-medium">{analysis.volatility.trendStrength}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-400">Analyzing market conditions...</p>
              </div>
            ) : analysis ? (
              <>
                {/* Main Recommendation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-r ${getRecommendationStyle(analysis.recommendation.recommendation).bg} rounded-2xl p-8 text-white`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{getRecommendationStyle(analysis.recommendation.recommendation).icon}</span>
                    <div>
                      <p className="text-white/80">Our Recommendation</p>
                      <h2 className="text-3xl font-bold">{getRecommendationStyle(analysis.recommendation.recommendation).title}</h2>
                      <p className="text-white/80">{getRecommendationStyle(analysis.recommendation.recommendation).subtitle}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-white/80 text-sm">Confidence</p>
                      <p className="text-4xl font-bold">{analysis.recommendation.confidence}%</p>
                    </div>
                  </div>
                  
                  {analysis.recommendation.targetRate && (
                    <div className="bg-white/10 rounded-xl p-4 mt-4">
                      <p className="text-white/80">Target Rate to Lock</p>
                      <p className="text-2xl font-bold">{analysis.recommendation.targetRate}%</p>
                    </div>
                  )}
                </motion.div>

                {/* Rationale */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Why This Recommendation</h3>
                  <div className="space-y-3">
                    {analysis.recommendation.rationale.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-amber-400">✓</span>
                        <span className="text-slate-300">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Risk Assessment</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                      <p className="text-red-400 font-bold mb-2">⬆️ If Rates Rise</p>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-400">Probability</span>
                        <span className="text-white font-medium">{analysis.recommendation.riskAssessment.ifRatesRise.probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cost Impact (30yr)</span>
                        <span className="text-red-400 font-bold">{formatCurrency(analysis.recommendation.riskAssessment.ifRatesRise.costImpact)}</span>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                      <p className="text-emerald-400 font-bold mb-2">⬇️ If Rates Fall</p>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-400">Probability</span>
                        <span className="text-white font-medium">{analysis.recommendation.riskAssessment.ifRatesFall.probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Savings Impact (30yr)</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(analysis.recommendation.riskAssessment.ifRatesFall.savingsImpact)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lock Period Options */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">Lock Period Options</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Period</th>
                          <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate Adj</th>
                          <th className="text-right py-3 px-4 text-slate-400 font-medium">Effective Rate</th>
                          <th className="text-right py-3 px-4 text-slate-400 font-medium">Monthly Pmt</th>
                          <th className="text-right py-3 px-4 text-slate-400 font-medium">Extra Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.lockOptions.map((opt, i) => (
                          <tr key={i} className={`border-b border-slate-700/50 ${
                            opt.days === analysis.recommendation.optimalLockPeriod ? 'bg-amber-500/10' : ''
                          }`}>
                            <td className="py-3 px-4">
                              <span className="text-white font-medium">{opt.description}</span>
                              {opt.days === analysis.recommendation.optimalLockPeriod && (
                                <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded">Recommended</span>
                              )}
                            </td>
                            <td className="text-right py-3 px-4 text-slate-300">
                              {opt.rateAdjustment > 0 ? `+${opt.rateAdjustment}%` : 'None'}
                            </td>
                            <td className="text-right py-3 px-4 text-white font-medium">{opt.effectiveRate}%</td>
                            <td className="text-right py-3 px-4 text-white">{formatCurrency(opt.monthlyPayment)}</td>
                            <td className="text-right py-3 px-4 text-slate-300">
                              {opt.extraCost > 0 ? formatCurrency(opt.extraCost) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Upcoming Events */}
                {analysis.upcomingEvents && analysis.upcomingEvents.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">📅 Economic Events to Watch</h3>
                    <div className="space-y-3">
                      {analysis.upcomingEvents.map((event, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              event.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                              event.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {event.impact.toUpperCase()}
                            </span>
                            <span className="text-white">{event.event}</span>
                          </div>
                          <span className="text-slate-400">{event.date}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-500 text-sm mt-4">
                      High-impact events can cause significant rate movements. Consider locking before major announcements.
                    </p>
                  </div>
                )}

                {/* Alerts */}
                {analysis.recommendation.alerts && analysis.recommendation.alerts.length > 0 && (
                  <div className="bg-yellow-500/10 rounded-2xl p-6 border border-yellow-500/30">
                    <h3 className="text-lg font-bold text-yellow-400 mb-4">⚠️ Important Alerts</h3>
                    <div className="space-y-2">
                      {analysis.recommendation.alerts.map((alert, i) => (
                        <p key={i} className="text-slate-300">{alert}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Plan */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600">
                  <h3 className="text-lg font-bold text-white mb-4">Your Action Plan</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">1</div>
                      <div>
                        <p className="text-white font-medium">
                          {analysis.recommendation.recommendation === 'lock_now' 
                            ? `Lock your rate at ${analysis.currentRate}% for ${analysis.recommendation.optimalLockPeriod} days`
                            : `Monitor rates - target: ${analysis.recommendation.targetRate || (analysis.currentRate - 0.125).toFixed(3)}%`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">2</div>
                      <div>
                        <p className="text-white font-medium">
                          If rates rise above {(analysis.currentRate + 0.125).toFixed(3)}%, lock immediately
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">3</div>
                      <div>
                        <p className="text-white font-medium">
                          Set up rate alerts to get notified of significant movements
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-amber-500 hover:to-orange-500 transition-all">
                    Set Up Rate Alerts
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 text-center">
                <span className="text-6xl mb-4 block">🔒</span>
                <p className="text-slate-400">Enter your details and click "Get Recommendation"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
