import { useState, useEffect } from 'react';
import api from '../api/api';
import {
  TrendingUp, Tag, Calendar, ExternalLink, Loader2,
  Flame, BadgePercent, RefreshCw, AlertCircle
} from 'lucide-react';

export default function Trending() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrending = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const { data: res } = await api.get('/api/profile/trending');
      setData(res);
    } catch (e) {
      setError('Failed to load trending data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrending(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3">
            <Flame className="text-orange-500" size={32} /> Trending & Deals
          </h1>
          <p className="text-secondary mt-1">Live market data — what's hot and what's discounted in Pakistan right now</p>
        </div>
        <button
          onClick={fetchTrending}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-theme text-secondary hover:text-primary hover:border-blue-400 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="glass rounded-2xl p-6 flex items-start gap-4 border-l-4 border-red-500">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-secondary">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
            <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
          </div>
          <div className="text-center">
            <p className="text-primary font-bold text-lg">AI is scanning Pakistan's market...</p>
            <p className="text-secondary text-sm mt-1">Fetching live trends and deals</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Trending Products */}
          {data.trending?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6">
                <TrendingUp size={22} className="text-blue-500" /> Trending Right Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {data.trending.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 group border border-theme"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        #{i + 1} Trending
                      </span>
                      <ExternalLink size={13} className="text-muted group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h3 className="text-primary font-bold text-sm leading-snug">{item.title}</h3>
                    <p className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                      {item.price}
                    </p>
                    <p className="text-muted text-xs">{item.reason}</p>
                    <div className="mt-auto text-xs font-semibold text-secondary">{item.source}</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Hot Deals */}
          {data.deals?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6">
                <BadgePercent size={22} className="text-green-500" /> Hot Deals & Discounts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.deals.map((deal, i) => (
                  <a
                    key={i}
                    href={deal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-200 group border border-theme relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg shadow-green-500/30">
                      {deal.discount}
                    </div>
                    <h3 className="text-primary font-bold text-sm leading-snug pr-16">{deal.title}</h3>
                    <div className="flex items-end gap-3">
                      <span className="text-2xl font-black text-green-500">{deal.sale_price}</span>
                      <span className="text-secondary line-through text-sm pb-0.5">{deal.original_price}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-muted">{deal.source}</span>
                      <span className="text-xs text-amber-500 font-semibold">{deal.expires}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Sales */}
          {data.upcoming_sales?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6">
                <Calendar size={22} className="text-purple-500" /> Upcoming Sales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.upcoming_sales.map((sale, i) => (
                  <div
                    key={i}
                    className="glass rounded-2xl p-6 border border-theme hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <h3 className="text-primary font-bold text-base mb-1">{sale.name}</h3>
                    <p className="text-blue-400 font-semibold text-sm mb-3">{sale.date}</p>
                    <p className="text-secondary text-sm leading-relaxed">{sale.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
