// LenderCard Component
// CR AudioViz AI - Mortgage Rate Monitor
// December 2025

'use client';

import { Star, Phone, ExternalLink, Shield, CheckCircle } from 'lucide-react';

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

interface LenderCardProps {
  lender: Lender;
  featured?: boolean;
}

const typeColors: Record<string, string> = {
  national: 'bg-blue-100 text-blue-800',
  regional: 'bg-purple-100 text-purple-800',
  credit_union: 'bg-green-100 text-green-800',
  online: 'bg-amber-100 text-amber-800',
  state: 'bg-indigo-100 text-indigo-800',
  local: 'bg-rose-100 text-rose-800'
};

const typeLabels: Record<string, string> = {
  national: 'National Lender',
  regional: 'Regional Bank',
  credit_union: 'Credit Union',
  online: 'Online Lender',
  state: 'State Specialist',
  local: 'Local Lender'
};

export default function LenderCard({ lender, featured = false }: LenderCardProps) {
  const rating = parseFloat(String(lender.rating)) || 4.0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={`bg-white rounded-xl border ${featured ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'} p-6 hover:shadow-lg transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-lg">{lender.name}</h3>
            {lender.nmls_id && (
              <Shield className="w-4 h-4 text-green-600" title={`NMLS #${lender.nmls_id}`} />
            )}
          </div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[lender.lender_type] || 'bg-gray-100 text-gray-800'}`}>
            {typeLabels[lender.lender_type] || lender.lender_type}
          </span>
        </div>
        {featured && (
          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg">
            Featured
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < fullStars
                  ? 'fill-amber-400 text-amber-400'
                  : i === fullStars && hasHalfStar
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({lender.review_count?.toLocaleString() || 0} reviews)</span>
      </div>

      {/* Description */}
      {lender.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {lender.description}
        </p>
      )}

      {/* Specialties */}
      {lender.specialties && lender.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {lender.specialties.slice(0, 4).map((specialty, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
          {lender.specialties.length > 4 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">
              +{lender.specialties.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Requirements */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Min. {lender.min_credit_score} credit</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{lender.min_down_payment}% down</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        {lender.website && (
          <a
            href={lender.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Site
          </a>
        )}
        {lender.phone && (
          <a
            href={`tel:${lender.phone}`}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        )}
      </div>

      {/* NMLS Footer */}
      {lender.nmls_id && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          NMLS #{lender.nmls_id} • {lender.headquarters_state || 'US'}
        </p>
      )}
    </div>
  );
}
