import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await authAPI.forgotPassword(email);
      setSent(true);
      showSuccess('Reset instructions sent (simulated for development)!');
    } catch (err) {
      showError(err.response?.data?.message || 'Error processing password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your university email to receive recovery instructions
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We have sent password recovery guidelines to <strong className="text-slate-900">{email}</strong>.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@uniskill.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
          </button>

          <div className="text-center pt-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
