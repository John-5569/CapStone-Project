import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../api/storageService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Cloud } from 'lucide-react';

export const StorageConnect = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingConnected, setCheckingConnected] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await storageService.connectCloud(email, password);
      
      setSuccess('Successfully connected to MEGA!');
      setTimeout(() => navigate('/datasets'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to connect. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAlready = async () => {
    setCheckingConnected(true);
    setError('');
    setSuccess('');

    try {
      await storageService.connectAlready();
      setSuccess('Cloud is already connected. Redirecting to datasets...');
      setTimeout(() => navigate('/datasets'), 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'No existing cloud connection found. Please connect with your MEGA credentials.');
    } finally {
      setCheckingConnected(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Connect your storage</h1>
        <p className="text-slate-500 mt-2">Connect your MEGA account to access your datasets.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-primary/50 shadow-md">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <Cloud className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle>MEGA</CardTitle>
              <CardDescription>Connect with your email and password</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  {success}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="MEGA account email"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="MEGA account password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Connecting...' : 'Connect MEGA Account'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={checkingConnected || loading}
                onClick={handleConnectAlready}
              >
                {checkingConnected ? 'Checking...' : 'Already Connected? Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
