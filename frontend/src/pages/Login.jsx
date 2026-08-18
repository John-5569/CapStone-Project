import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { AuthCard } from '../components/ui/AuthCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const isVerifiedSuccess = new URLSearchParams(location.search).get('verified') === 'true';
  const infoMessage = location.state?.message || (isVerifiedSuccess ? 'Email verified successfully! Please log in.' : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        throw new Error('Google token not found in response.');
      }
      await loginWithGoogle(idToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <AuthCard title="Log in to DataFlow">
      <form onSubmit={handleSubmit} className="space-y-5">
        {infoMessage && (
          <div className="p-3 text-sm text-green-700 bg-green-50 dark:bg-green-950/60 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1e1915] dark:text-slate-200">Email</label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#1e1915] dark:text-slate-200">Password</label>
            <Link to="/forgot-password" className="text-sm text-[#0061ff] dark:text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[#615951] dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-[#d7d2cc] dark:border-slate-700 text-[#0061ff] focus:ring-[#0061ff]"
          />
          Remember me
        </label>

        <Button type="submit" className="w-full font-semibold" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>

        <>
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#e6e1da] dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#0f172a] px-2 text-[#8a8178] dark:text-slate-400">or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            {isGoogleEnabled ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                ux_mode="popup"
                auto_select
                text="continue_with"
                theme={isDark ? 'filled_black' : 'outline'}
                size="large"
                shape="pill"
                width="300"
              />
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled
                title="Set VITE_GOOGLE_CLIENT_ID to enable Google Sign-In"
              >
                Continue with Google
              </Button>
            )}
          </div>
        </>
      </form>

      <div className="mt-8 text-center text-sm text-[#615951] dark:text-slate-400 pt-6 border-t border-[#e6e1da] dark:border-slate-800">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-[#0061ff] dark:text-blue-400 hover:underline">
          Create account
        </Link>
      </div>
    </AuthCard>
  );
};
