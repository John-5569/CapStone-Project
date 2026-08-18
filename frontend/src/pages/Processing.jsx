import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { processingService } from '../api/processingService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle2, CircleDashed, XCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Processing = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let interval;
    const fetchStatus = async () => {
      try {
        const res = await processingService.getJobStatus(jobId);
        setStatus(res);

        if (res.status === 'COMPLETED' || res.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch {
        setStatus({ status: 'FAILED', progress: 100 });
        clearInterval(interval);
      }
    };

    fetchStatus();
    // Poll every 2 seconds
    interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  if (!jobId) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-display font-semibold mb-6">No job specified</h2>
        <Button size="lg" className="rounded-full" onClick={() => navigate('/datasets')}>Go to Datasets</Button>
      </div>
    );
  }

  const renderProgress = () => {
    if (!status) return (
      <div className="space-y-4 mt-12 w-full max-w-md mx-auto">
        <div className="flex justify-between text-sm font-medium text-muted-foreground animate-pulse">
          <span>Initializing...</span>
          <span>0%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10"></div>
      </div>
    );
    
    return (
      <div className="space-y-4 mt-12 w-full max-w-md mx-auto relative z-10">
        <div className="flex justify-between text-base font-semibold tracking-wide">
          <span className={status.status === 'FAILED' ? 'text-red-500' : 'text-primary'}>{status.status}</span>
          <span className="text-foreground">{status.progress || 0}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
          <motion.div 
            className={`h-full relative overflow-hidden ${status.status === 'FAILED' ? 'bg-red-500' : status.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${status.progress || 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Shimmer inside progress bar */}
            {status.status !== 'FAILED' && status.status !== 'COMPLETED' && (
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
            )}
          </motion.div>
        </div>
      </div>
    );
  };

  const getStatusIcon = () => {
    if (!status) return <CircleDashed className="h-24 w-24 text-muted-foreground opacity-50 animate-spin" />;
    if (status.status === 'COMPLETED') return <CheckCircle2 className="h-24 w-24 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />;
    if (status.status === 'FAILED') return <XCircle className="h-24 w-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />;
    return <CircleDashed className="h-24 w-24 text-primary animate-spin drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]" />;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10">
      <Button variant="ghost" size="sm" className="mb-8 -ml-2 rounded-full hover:bg-white/10" onClick={() => navigate('/datasets')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Datasets
      </Button>
      
      <Card className="overflow-hidden border-border/50 shadow-2xl relative">
        {/* Decorative background glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 opacity-20 blur-3xl rounded-full mix-blend-screen pointer-events-none transition-colors duration-1000 ${
          status?.status === 'COMPLETED' ? 'bg-green-500' : 
          status?.status === 'FAILED' ? 'bg-red-500' : 
          'bg-primary'
        }`}></div>

        <CardHeader className="text-center pt-20 relative z-10">
          <div className="mx-auto mb-8 flex justify-center">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-3xl md:text-4xl">
            {status?.status === 'COMPLETED' ? 'Dataset Processed Successfully' :
             status?.status === 'FAILED' ? 'Processing Failed' :
             'Processing Dataset...'}
          </CardTitle>
          <CardDescription className="mt-4 text-base font-mono bg-white/5 border border-white/10 px-4 py-1.5 rounded-full inline-block">
            Job ID: {jobId}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-20 px-8 sm:px-16 text-center">
          {renderProgress()}

          <AnimatePresence>
            {status?.status === 'FAILED' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 p-6 bg-red-500/10 text-red-500 rounded-3xl text-sm border border-red-500/20 max-w-lg mx-auto backdrop-blur-md relative z-10"
              >
                <div className="font-semibold text-lg mb-2">Kubernetes Execution Error</div>
                An error occurred during the Kubernetes job execution. Please check the dataset format and try again.
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
