import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api/authService';
import { AuthCard } from '../components/ui/AuthCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthCard title="Check your email">
        <div className="space-y-6 text-center">
          <p className="text-sm text-[#615951] dark:text-slate-400 leading-relaxed">
            If an account exists for <span className="font-semibold text-[#1e1915] dark:text-white">{email}</span>, you'll receive a password reset link shortly.
          </p>

          <Link to="/login" className="block w-full">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset your password."
      backLink="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <Button type="submit" className="w-full font-semibold" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm pt-6 border-t border-[#e6e1da] dark:border-slate-800">
        <Link to="/login" className="text-sm text-[#615951] dark:text-slate-400 hover:text-[#1e1915] dark:hover:text-white font-medium transition-colors">
          Back to login
        </Link>
      </div>
    </AuthCard>
  );
};
