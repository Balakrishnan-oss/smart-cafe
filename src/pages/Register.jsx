import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Register({ onNavigate, onRegisterSuccess, redirectTarget = null }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validations
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      // 1. Register with Supabase Auth
      // 2. Pass full_name in user metadata (options.data) so existing PostgreSQL trigger creates profile
      // Note: No role parameter is sent — users cannot choose their own admin role
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            phone: phone.trim() || undefined
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.user) {
        setSuccessMessage(`Account created for ${cleanName}! Welcome to Smart Café Salem.`);

        if (onRegisterSuccess) {
          onRegisterSuccess(data.user);
        }

        // If a session was returned (email confirmation disabled or auto-confirmed)
        if (data.session) {
          setTimeout(() => {
            onNavigate(redirectTarget || 'home');
          }, 800);
        } else {
          // If Supabase has email confirmation enabled
          setSuccessMessage(
            `Registration complete for ${cleanName}! If required by your project, check ${cleanEmail} for confirmation, or sign in now.`
          );
          setTimeout(() => {
            onNavigate('login');
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      let userFriendlyMsg = err.message || 'Registration failed. Please try again.';
      if (err.message?.includes('User already registered')) {
        userFriendlyMsg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.message?.includes('weak_password')) {
        userFriendlyMsg = 'The password is too weak. Please choose a stronger password.';
      }
      setErrorMessage(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 w-full">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f3ede1] shadow-sm mb-3">
          <span className="material-symbols-outlined text-[#a23f00] text-3xl">how_to_reg</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#250f03]">Create Account</h1>
        <p className="text-xs text-[#a23f00] font-semibold uppercase tracking-wider mt-1">
          Join Eswar, Bala &amp; Co • Salem Kaapi Club
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
          <span className="material-symbols-outlined text-red-600 text-base shrink-0 mt-0.5">error</span>
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold hover:underline shrink-0">
            ✕
          </button>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2.5 text-xs">
          <span className="material-symbols-outlined text-emerald-600 text-base shrink-0">check_circle</span>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Registration Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8e2d6]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#250f03] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#a23f00]">person</span>
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Karthik Subramanian"
              className="w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all"
            />
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#250f03] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#a23f00]">mail</span>
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. karthik.salem@gmail.com"
              className="w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all"
            />
          </div>

          {/* Mobile Phone (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#250f03] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#a23f00]">call</span>
              <span>Mobile Number (Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 94432 10890"
              className="w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#250f03] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#a23f00]">lock</span>
              <span>Password * (min. 6 characters)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password"
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#250f03] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#a23f00]">verified</span>
              <span>Confirm Password *</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#fd6c19] hover:bg-[#a23f00] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 pt-4 border-t border-[#ede8dc] text-center text-xs text-[#50443f]">
          <span>Already have an account? </span>
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-[#a23f00] hover:underline"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
