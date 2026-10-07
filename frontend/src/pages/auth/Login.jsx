import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Lock,
  LogIn,
  ArrowRight,
  GraduationCap,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

const Login = () => {
  const [portal, setPortal] = useState('student'); // 'student' | 'staff'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showError('Please enter both username/email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(identifier, password, portal);
      const roleLabel =
        user.role === 'admin'
          ? 'Administrator'
          : user.role === 'supervisor'
          ? 'Supervisor'
          : 'Student';

      showSuccess(`Welcome back, ${user.name}! Signed in as ${roleLabel}.`);
      navigate(from, { replace: true });
    } catch (err) {
      showError(
        err.response?.data?.message || 'Failed to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Portal Selection Tabs */}
      <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-2 gap-1 mb-6 border border-slate-200/60 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setPortal('student');
            setIdentifier('');
            setPassword('');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            portal === 'student'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Portal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPortal('staff');
            setIdentifier('');
            setPassword('');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            portal === 'staff'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Staff & Faculty</span>
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-2 uppercase tracking-wider bg-slate-100 text-slate-600">
          {portal === 'student' ? (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Authentication</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Staff & Administrative Access</span>
            </>
          )}
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          {portal === 'student' ? 'Student Sign In' : 'Staff & Faculty Sign In'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {portal === 'student'
            ? 'Access your academic projects, team collaborations, and skill milestones.'
            : 'Unified portal for Academic Supervisors, Mentors, and Administrators.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {portal === 'student' ? 'Email or Student ID' : 'Staff / Admin Email or Username'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                portal === 'student'
                  ? 'student@uniskill.edu or STU-2026-XXXX'
                  : 'supervisor@uniskill.edu or admin@uniskill.edu'
              }
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 ${
            portal === 'staff'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to {portal === 'student' ? 'Student Portal' : 'Staff Portal'}</span>
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>



      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
        >
          Register here <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default Login;
