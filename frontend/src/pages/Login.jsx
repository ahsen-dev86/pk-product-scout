import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto relative z-10">
      <div className="glass p-10 rounded-3xl w-full transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShoppingBag size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-10 font-medium">Smart AI Shopping in Pakistan</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 lg:mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
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
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] mt-4"
          >
            Sign In to Dashboard
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-600 font-medium text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
}
