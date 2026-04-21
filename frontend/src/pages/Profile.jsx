import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import {
  User, MapPin, Phone, Save, CheckCircle2, Loader2,
  Sparkles, SlidersHorizontal
} from 'lucide-react';

const CATEGORIES = [
  'Electronics', 'Mobile Phones', 'Laptops & Computers', 'Home Appliances',
  'Kitchen Appliances', 'Clothing & Fashion', 'Footwear', 'Furniture',
  'Baby Products', 'Sports & Fitness', 'Automotive', 'Beauty & Skincare',
  'Books & Stationery', 'Gaming', 'Cameras & Photography',
];

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', city: '', phone: '' });
  const [selectedPrefs, setSelectedPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    api.get('/api/profile')
      .then(({ data }) => {
        setForm({ name: data.name || '', city: data.city || '', phone: data.phone || '' });
        setSelectedPrefs(data.preferences || []);
        setInterests(data.interests || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const togglePref = (cat) => {
    setSelectedPrefs(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/api/profile', {
        ...form,
        preferences: selectedPrefs,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary">My Profile</h1>
        <p className="text-secondary mt-1">Manage your personal info and shopping preferences</p>
      </div>

      {/* Avatar + Personal Info */}
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/30">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">{form.name || 'Your Name'}</h2>
            <p className="text-secondary text-sm">{user.email}</p>
            <p className="text-muted text-xs mt-0.5">Member since {new Date(user.createdAt || Date.now()).getFullYear()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={12} /> Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-theme bg-surface-solid text-primary text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone size={12} /> Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+92 300 0000000"
                className="w-full px-4 py-3 rounded-xl border border-theme bg-surface-solid text-primary text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Karachi, Lahore, Islamabad"
              className="w-full px-4 py-3 rounded-xl border border-theme bg-surface-solid text-primary text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal size={20} className="text-blue-500" />
          <h2 className="text-xl font-bold text-primary">Shopping Preferences</h2>
        </div>
        <p className="text-secondary text-sm mb-6">Select categories you're interested in — the AI uses these to personalize recommendations for you.</p>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => togglePref(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                selectedPrefs.includes(cat)
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'border-theme text-secondary hover:border-blue-400 hover:text-blue-500'
              }`}
            >
              {selectedPrefs.includes(cat) && <span className="mr-1">✓</span>}{cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interests (auto-tracked) */}
      {interests.length > 0 && (
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-amber-500" />
            <h2 className="text-xl font-bold text-primary">Your Taste Profile</h2>
          </div>
          <p className="text-secondary text-sm mb-5">Auto-learned from your searches — used to personalize your home feed.</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((kw, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
