import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="glass fixed top-0 w-full z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
              PkProductScout
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">
              {user?.email}
            </span>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
