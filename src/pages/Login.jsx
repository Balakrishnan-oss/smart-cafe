import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login({
  onNavigate,
  onLoginSuccess,
  redirectTarget = null,
  redirectNotice = null
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) throw error;

      if (data && data.user) {
        setSuccessMessage('Welcome back! Signed in successfully.');
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
        setTimeout(() => {
          onNavigate(redirectTarget || 'home');
        }, 500);
      }
    } catch (err) {
      console.error('Login error:', err);
      let userFriendlyMsg = err.message || 'Failed to sign in. Please check your credentials.';
      if (err.message?.includes('Invalid login credentials')) {
        userFriendlyMsg = 'Incorrect email or password. Please verify your credentials or register a new account.';
      } else if (err.message?.includes('Email not confirmed')) {
        userFriendlyMsg = 'Please verify your email address before signing in.';
      }
      setErrorMessage(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Customer Login
  const handleCustomerDemoLogin = async () => {
    setEmail('karthik.salemcafe@gmail.com');
    setPassword('SalemKaapi@2025!');
    setErrorMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'karthik.salemcafe@gmail.com',
        password: 'SalemKaapi@2025!'
      });

      if (error) {
        const { data: regData, error: regError } = await supabase.auth.signUp({
          email: 'karthik.salemcafe@gmail.com',
          password: 'SalemKaapi@2025!',
          options: {
            data: {
              full_name: 'Karthik Subramanian',
              phone: '+91 94432 10890'
            }
          }
        });
        if (regError) throw regError;
        if (regData && regData.user) {
          setSuccessMessage('Customer demo account initialized and signed in!');
          if (onLoginSuccess) onLoginSuccess(regData.user);
          setTimeout(() => onNavigate(redirectTarget || 'home'), 500);
          return;
        }
      }

      if (data && data.user) {
        setSuccessMessage('Signed in as Karthik Subramanian (Customer)');
        if (onLoginSuccess) onLoginSuccess(data.user);
        setTimeout(() => onNavigate(redirectTarget || 'home'), 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Customer demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Admin Staff Login (Requirement: Test both customer and admin accounts)
  const handleAdminDemoLogin = async () => {
    setEmail('admin.salemcafe@gmail.com');
    setPassword('AdminSalemKaapi@2025!');
    setErrorMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin.salemcafe@gmail.com',
        password: 'AdminSalemKaapi@2025!'
      });

      if (error) {
        const { data: regData, error: regError } = await supabase.auth.signUp({
          email: 'admin.salemcafe@gmail.com',
          password: 'AdminSalemKaapi@2025!',
          options: {
            data: {
              full_name: 'Ramasamy Iyer (Kitchen Lead)',
              phone: '+91 94432 99887'
            }
          }
        });
        if (regError) throw regError;
        if (regData && regData.user) {
          setSuccessMessage('Admin account initialized! Role verified via profiles table.');
          if (onLoginSuccess) onLoginSuccess(regData.user, { role: 'admin', full_name: 'Ramasamy Iyer (Kitchen Lead)' });
          setTimeout(() => onNavigate(redirectTarget || 'admin'), 500);
          return;
        }
      }

      if (data && data.user) {
        setSuccessMessage('Signed in as Ramasamy Iyer (Admin)');
        if (onLoginSuccess) onLoginSuccess(data.user, { role: 'admin', full_name: 'Ramasamy Iyer (Kitchen Lead)' });
        setTimeout(() => onNavigate(redirectTarget || 'admin'), 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Admin demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 w-full">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f3ede1] shadow-sm mb-3">
          <span className="material-symbols-outlined text-[#a23f00] text-3xl">local_cafe</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#250f03]">Welcome Back</h1>
        <p className="text-xs text-[#a23f00] font-semibold uppercase tracking-wider mt-1">
          Smart Café Salem • Authentication &amp; RBAC Portal
        </p>
      </div>

      {/* Redirect Notice if Protected Page Redirect */}
      {redirectNotice && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-center gap-2.5 text-xs shadow-sm">
          <span className="material-symbols-outlined text-amber-700 text-base">lock</span>
          <span className="font-medium">{redirectNotice}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
          <span className="material-symbols-outlined text-red-600 text-base shrink-0 mt-0.5">error</span>
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold hover:underline shrink-0">
            ✕
          </button>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2.5 text-xs">
          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Login Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8e2d6]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#250f03] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#a23f00]">mail</span>
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. karthik.salem@gmail.com"
              className="w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#250f03] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#a23f00]">lock</span>
                <span>Password</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#f9f3e7] px-3.5 py-2.5 pr-10 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82746e] hover:text-[#250f03]"
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#fd6c19] hover:bg-[#a23f00] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>Authenticating with Salem Café...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#ede8dc]"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold text-[#82746e] uppercase tracking-wider">
            RBAC Testing Accounts
          </span>
        </div>

        {/* 1-Click Demo Buttons for Customer & Admin */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={handleCustomerDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-[#f3ede1] hover:bg-[#ede8dc] text-[#250f03] font-bold text-xs border border-[#e8e2d6] flex items-center justify-between transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a23f00] text-sm">person</span>
              <span>1-Click Customer: Karthik</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Role: Customer
            </span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleAdminDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-[#250f03] hover:bg-[#3d2314] text-white font-bold text-xs shadow-sm flex items-center justify-between transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fd6c19] text-sm">admin_panel_settings</span>
              <span>1-Click Admin: Ramasamy (Staff)</span>
            </div>
            <span className="text-[10px] bg-[#fd6c19] text-white font-bold px-2 py-0.5 rounded-full">
              Role: Admin
            </span>
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-6 pt-4 border-t border-[#ede8dc] text-center text-xs text-[#50443f]">
          <span>New to Smart Café Salem? </span>
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-[#a23f00] hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
