import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthCard } from '../components/ui/AuthCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password);
      navigate('/login', { state: { message: 'Account created successfully. Please check your email to verify.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create your account. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your DataFlow account">
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label className="text-sm font-semibold text-[#1e1915]">Password</label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign up'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-[#615951] pt-6 border-t border-[#e6e1da]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#0061ff] hover:underline">
          Log in
        </Link>
      </div>
    </AuthCard>
  );
};
