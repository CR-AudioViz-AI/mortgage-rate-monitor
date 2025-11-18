'use client';

import { useState } from 'react';

interface SavedSearch {
  id: number;
  name: string;
  filters: {
    loan_type?: string;
    state?: string;
  };
  results: number;
}

export default function DashboardPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Load saved searches on mount
  useState(() => {
    // For now, using dummy data
    setSavedSearches([
      { id: 1, name: 'FHA Loans in Florida', filters: { loan_type: 'fha', state: 'FL' }, results: 45 },
      { id: 2, name: '30-Year Fixed Best Rates', filters: { loan_type: '30-year-fixed' }, results: 120 },
    ]);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Saved Searches */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Searches</h2>
          {savedSearches.length === 0 ? (
            <p className="text-gray-500">No saved searches yet.</p>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div key={search.id} className="border rounded p-4">
                  <h3 className="font-medium">{search.name}</h3>
                  <p className="text-sm text-gray-600">{search.results} results</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
