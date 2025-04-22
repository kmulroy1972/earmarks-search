import { useState } from 'react';
import { supabase } from '../utils/supabase';

interface SearchResults {
  data: any[];
  count: number;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Basic text search across multiple columns
      const { data, error: searchError, count } = await supabase
        .from('earmarks')
        .select('*', { count: 'exact' })
        .or(`recipient.ilike.%${query}%, budget_function.ilike.%${query}%, agency.ilike.%${query}%`)
        .limit(10);

      if (searchError) throw searchError;

      setResults({ data: data || [], count: count || 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center p-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
          Get Pro
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold mb-8 text-center">Search Earmarks Data</h1>
        
        {/* Search Input */}
        <div className="w-full mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by recipient, budget function, or agency..."
              className="w-full p-4 pr-32 rounded-2xl border border-gray-200 focus:outline-none focus:border-gray-300"
            />
            <div className="absolute right-2 top-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-black text-white p-2 rounded-xl hover:bg-gray-800 disabled:bg-gray-400"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Found {results.count} results
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.data.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.recipient}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${new Intl.NumberFormat().format(item.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.agency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
