import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthCard } from '../components/ui/AuthCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isVerifiedSuccess = new URLSearchParams(location.search).get('verified') === 'true';
  const infoMessage = location.state?.message || (isVerifiedSuccess ? 'Email verified successfully! Please log in.' : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Log in to DataFlow">
      <form onSubmit={handleSubmit} className="space-y-5">
        {infoMessage && (
          <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1e1915]">Email</label>
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
            <label className="text-sm font-semibold text-[#1e1915]">Password</label>
            <Link to="/forgot-password" className="text-sm text-[#0061ff] hover:underline">
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-[#615951] pt-6 border-t border-[#e6e1da]">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-[#0061ff] hover:underline">
          Create account
        </Link>
      </div>
    </AuthCard>
  );
};
