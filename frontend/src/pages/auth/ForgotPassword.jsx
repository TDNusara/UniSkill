import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  ArrowLeft,
  Send,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
} from 'lucide-react';

const ForgotPassword = () => {
  // Step 1: 'request' | Step 2: 'otp' | Step 3: 'new_password' | Step 4: 'success'
  const [step, setStep] = useState('request');
  const [identifier, setIdentifier] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState(null);

  // OTP Step
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
  const [resetToken, setResetToken] = useState('');

  // New Password Step
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // STEP 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showError('Please enter your university email or Student ID');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.forgotPassword(identifier.trim());
      setAccountEmail(res.data.email);
      setMaskedEmail(res.data.maskedEmail);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setTimeLeft(600);
      setStep('otp');
      showSuccess(res.data.message || 'Verification code dispatched to your registered email.');
    } catch (err) {
      showError(
        err.response?.data?.message ||
          'Failed to send verification code. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      showError('Please enter the valid 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.verifyOtp(accountEmail, otp.trim());
      setResetToken(res.data.resetToken);
      setStep('new_password');
      showSuccess('Identity verified! Please set your new password.');
    } catch (err) {
      showError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await authAPI.forgotPassword(accountEmail);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setTimeLeft(600);
      setOtp('');
      showSuccess('A fresh 6-digit code has been sent to your email.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.resetPassword(resetToken, password);
      setStep('success');
      showSuccess(res.data?.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      showError(
        err.response?.data?.message || 'Failed to set new password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step Indicator Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-2 uppercase tracking-wider bg-slate-100 text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Secure Password Recovery</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900">
          {step === 'request' && 'Verify Account'}
          {step === 'otp' && 'Enter Verification Code'}
          {step === 'new_password' && 'Create New Password'}
          {step === 'success' && 'Password Updated!'}
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          {step === 'request' &&
            'To protect student accounts, a one-time 6-digit security code (OTP) will be sent to the registered email on file.'}
          {step === 'otp' &&
            `Enter the 6-digit verification code sent to ${maskedEmail || 'your email'}.`}
          {step === 'new_password' &&
            'Your identity has been verified. Enter and confirm your new password below.'}
          {step === 'success' && 'Your credentials have been securely updated.'}
        </p>
      </div>

      {/* STEP 1: Request OTP */}
      {step === 'request' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              University Email or Student ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="student@uniskill.edu or STU-2026-XXXX"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>The OTP will strictly be sent to the registered email on file.</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Sending Code...' : 'Send 6-Digit OTP Code'}</span>
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: Verify 6-Digit OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                6-Digit Security Code (OTP)
              </label>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(timeLeft)}</span>
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                required
                className="w-full text-center tracking-[0.6em] font-mono text-xl py-3 bg-slate-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all font-bold text-slate-900"
              />
            </div>

            {devOtp && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] font-semibold text-amber-800">
                  ⚡ Development Mode Simulated OTP: <strong>{devOtp}</strong>
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || timeLeft === 0}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Verifying Code...' : 'Verify & Continue'}</span>
          </button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Code</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-slate-500 hover:text-slate-800"
            >
              Change Email / ID
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Set New Password */}
      {step === 'new_password' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
          </button>
        </form>
      )}

      {/* STEP 4: Success Screen */}
      {step === 'success' && (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Password Reset Successfully!</h3>
            <p className="text-xs text-slate-500">
              Your password has been changed. You will now be redirected to the sign-in portal.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <span>Go to Login Now</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
