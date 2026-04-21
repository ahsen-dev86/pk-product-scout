import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto relative z-10">
      <div className="glass p-10 rounded-3xl w-full transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <UserPlus size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-2 tracking-tight">Create Account</h2>
        <p className="text-center text-slate-500 mb-10 font-medium">Join and find the best deals</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 lg:mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 lg:mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-green-500/25 active:scale-[0.98] mt-4"
          >
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-600 font-medium text-sm">
          Already have an account? <Link to="/login" className="text-green-600 hover:text-emerald-700 font-bold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
