import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import { AuthCard } from '../components/ui/AuthCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const token = routeParams.token || searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      navigate('/login', { state: { message: 'Password reset successfully. Please log in with your new password.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create a new password" backLink="/login">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1e1915] dark:text-slate-200">New password</label>
          <Input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full font-semibold" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
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
