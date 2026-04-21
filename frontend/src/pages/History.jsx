import { useState, useEffect } from 'react';
import api from '../api/api';
import { Clock, ExternalLink, Search, AlertCircle } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/search/history')
      .then(({ data }) => setHistory(data))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3">
          <Clock className="text-blue-500" size={28} /> Search History
        </h1>
        <p className="text-secondary mt-1">All your previous product searches</p>
      </div>

      {error && (
        <div className="glass rounded-2xl p-5 flex items-center gap-3 border-l-4 border-red-500">
          <AlertCircle className="text-red-500 shrink-0" />
          <p className="text-secondary">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="glass rounded-3xl p-16 text-center">
          <Search size={40} className="text-muted mx-auto mb-4" />
          <h3 className="text-primary font-bold text-lg">No searches yet</h3>
          <p className="text-secondary text-sm mt-2">Go to Home and search for a product to get started!</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="space-y-4">
          {history.map((entry, i) => {
            const recs = entry.recommendation?.recommendations || [];
            return (
              <div key={i} className="glass rounded-2xl p-6 border border-theme hover:border-blue-400/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Search size={14} className="text-blue-400" />
                      <h3 className="font-bold text-primary">{entry.query}</h3>
                    </div>
                    <p className="text-muted text-xs">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {recs.length} results
                  </span>
                </div>

                {entry.recommendation?.summary && (
                  <p className="text-secondary text-sm mb-4 leading-relaxed border-l-2 border-blue-500/30 pl-3">
                    {entry.recommendation.summary}
                  </p>
                )}

                {recs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recs.map((rec, j) => (
                      <a
                        key={j}
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-theme text-xs font-semibold text-secondary hover:text-blue-400 hover:border-blue-400/50 transition-all"
                      >
                        {rec.source}
                        <span className="font-bold text-primary">{rec.price}</span>
                        <ExternalLink size={11} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
