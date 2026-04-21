import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import api from '../api/api';
import {
  Search, Loader2, ExternalLink, BadgeCheck, AlertCircle, Sparkles,
  ShieldCheck, ShieldAlert, Shield, CheckCircle2, Instagram, Facebook,
  Star, ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Personalized recommendations state
  const [recs, setRecs] = useState(null);
  const [recsLoading, setRecsLoading] = useState(true);

  // Fetch personalized recs on mount
  useEffect(() => {
    api.get('/api/profile/recommendations')
      .then(({ data }) => setRecs(data))
      .catch(() => setRecs(null))
      .finally(() => setRecsLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/api/search', { query });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTrustBadge = (rating) => {
    const r = (rating || '').toLowerCase();
    if (r.includes('high')) return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
        <ShieldCheck size={12} /> High Trust
      </span>
    );
    if (r.includes('medium')) return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
        <Shield size={12} /> Medium Trust
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
        <ShieldAlert size={12} /> Low Trust
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

      {/* ── Hero Search ──────────────────────────────────────────────────── */}
      <div className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Sparkles size={15} /> AI-Powered Pakistan Shopping
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">
          Find the best deals in{' '}
          <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
            Pakistan
          </span>
        </h1>
        <p className="text-secondary max-w-xl mx-auto text-base">
          Search any product — AI scours Daraz, Telemart, PriceOye, Instagram & more to find verified prices, trust ratings, and real links.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-0 bg-blue-500/15 blur-2xl rounded-full -z-10 group-hover:bg-blue-500/25 transition-all duration-300" />
          <div className="glass flex items-center p-2 rounded-2xl border border-theme shadow-xl">
            <div className="pl-4 text-muted"><Search size={22} /></div>
            <input
              type="text"
              className="flex-1 px-4 py-3.5 bg-transparent outline-none text-base text-primary font-medium placeholder:text-muted"
              placeholder="e.g. iPhone 15 Pro, Dawlance Refrigerator..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-7 rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Searching…' : 'Find Deals'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="glass rounded-2xl p-5 flex items-start gap-3 border-l-4 border-red-500">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-primary">Search Failed</p>
            <p className="text-secondary text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Search Loading ───────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center py-16 gap-5">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full" />
            <div className="w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={22} />
          </div>
          <div className="text-center">
            <p className="font-bold text-primary text-lg">AI is deep-analyzing listings…</p>
            <p className="text-secondary text-sm mt-1">Fetching real prices, reading specs & evaluating seller trust</p>
          </div>
        </div>
      )}

      {/* ── Search Results ───────────────────────────────────────────────── */}
      {result?.recommendation?.recommendations && (
        <div className="space-y-10">
          {/* AI Summary */}
          <div className="glass rounded-3xl p-8 border-t-4 border-blue-500 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="text-blue-500" size={24} />
              <h2 className="text-2xl font-extrabold text-primary">AI Market Summary</h2>
            </div>
            <p className="text-secondary leading-relaxed text-base relative z-10">
              {result.recommendation.summary}
            </p>
          </div>

          {/* Recommendations Grid */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-6">Top Recommendations for "{result.query}"</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.recommendation.recommendations.map((item, i) => (
                <div key={i} className="glass rounded-3xl p-6 flex flex-col border border-theme hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                      <BadgeCheck size={12} /> {item.source}
                    </span>
                    {getTrustBadge(item.trust_rating)}
                  </div>

                  <h3 className="font-bold text-primary text-base leading-snug mb-2">{item.title}</h3>

                  <div className="text-3xl font-black bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-4">
                    {item.price}
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 mb-4">
                    <p className="text-xs font-semibold text-secondary mb-0.5">Trust Evaluation</p>
                    <p className="text-xs text-muted leading-relaxed">{item.trust_reasoning || item.reasoning}</p>
                  </div>

                  {item.features?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-primary mb-2">Verified Specs</p>
                      <ul className="space-y-1.5">
                        {item.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-secondary">
                            <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all group"
                  >
                    Visit Store <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          {result.recommendation.social_links?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-primary mb-5">Social Media Sellers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendation.social_links.map((s, i) => {
                  const isInsta = s.platform?.toLowerCase().includes('insta');
                  return (
                    <a
                      key={i}
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass p-4 rounded-2xl flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all border border-theme group"
                    >
                      <div className={`p-3 rounded-xl shrink-0 ${isInsta
                        ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500'
                        : 'bg-blue-600'} text-white`}>
                        {isInsta ? <Instagram size={22} /> : <Facebook size={22} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-primary text-sm truncate">{s.title || 'Social Listing'}</p>
                        <p className="text-muted text-xs flex items-center gap-1 mt-0.5">
                          {s.platform} <ExternalLink size={10} />
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Personalized Recommendations (shown when no active search) ──── */}
      {!result && !loading && (
        <div className="space-y-6">
          {recsLoading && (
            <div className="flex items-center gap-3 text-secondary text-sm">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              Loading personalized picks…
            </div>
          )}

          {!recsLoading && recs?.recommendations?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <Star className="text-amber-400" size={24} /> Picked For You
                  </h2>
                  <p className="text-secondary text-sm mt-1">Based on your search history & preferences</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {recs.recommendations.map((rec, i) => (
                  <a
                    key={i}
                    href={rec.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-200 border border-theme group"
                  >
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start">
                      {rec.category || 'For You'}
                    </span>
                    <h3 className="font-bold text-primary text-sm leading-snug">{rec.title}</h3>
                    <p className="text-xl font-black bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
                      {rec.price}
                    </p>
                    <p className="text-muted text-xs leading-relaxed flex-1">{rec.reason}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-theme">
                      <span className="text-xs font-semibold text-secondary">{rec.source}</span>
                      <ArrowRight size={14} className="text-muted group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!recsLoading && recs?.message && (
            <div className="glass rounded-3xl p-12 text-center border border-theme">
              <Sparkles size={40} className="text-blue-400 mx-auto mb-4" />
              <h3 className="text-primary font-bold text-lg">{recs.message}</h3>
              <p className="text-secondary text-sm mt-2">The more you search, the smarter your recommendations become.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
