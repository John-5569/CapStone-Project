import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Database, Cloud, FileText, ArrowRight } from 'lucide-react';
import { datasetService } from '../api/datasetService';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const dSets = await datasetService.getDatasets();
      setDatasets(dSets);
    };
    
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-4xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">Welcome back, {user?.email?.split('@')[0] || 'User'}. Here's an overview of your platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Database className="w-32 h-32 text-blue-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Datasets</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-display font-bold mt-2">{datasets.length}</div>
              <p className="text-xs text-muted-foreground mt-2">Connected cloud datasets</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Cloud className="w-32 h-32 text-primary" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cloud Connection</CardTitle>
              <div className="p-2 rounded-xl bg-primary/10">
                <Cloud className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-display font-bold mt-2">{datasets.length > 0 ? 'Connected (MEGA)' : 'Not Connected'}</div>
              <p className="text-xs text-muted-foreground mt-2">Storage integration status</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
            <div>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription className="mt-1">Manage your cloud storage and clean datasets</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Cloud className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Cloud Storage</h4>
                    <p className="text-sm text-muted-foreground">Connect or manage your MEGA account</p>
                  </div>
                </div>
                <Link to="/storage">
                  <Button variant="glass" className="w-full justify-between">
                    Connect Storage <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Datasets</h4>
                    <p className="text-sm text-muted-foreground">View and clean available datasets</p>
                  </div>
                </div>
                <Link to="/datasets">
                  <Button variant="primary" className="w-full justify-between">
                    View Datasets <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
