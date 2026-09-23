import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Menu, 
  Bell, 
  Search,
  ExternalLink 
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left Side: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                UniSkill
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ml-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                Academic Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search quick link */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, skills, or supervisors..."
              onClick={() => navigate('/projects')}
              readOnly
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white cursor-pointer transition-all"
            />
          </div>
        </div>

        {/* Right Side: User Profile & Actions */}
        <div className="flex items-center gap-3">
          {user?.role === 'student' && (
            <Link
              to={`/portfolio/${user._id}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              <span>Public Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <Link to="/profile" className="flex items-center gap-2 group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[11px] font-medium text-slate-400 capitalize">
                  {user?.role === 'supervisor' ? user.designation || 'Supervisor' : user?.role}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
