import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { datasetService } from '../api/datasetService';
import { processingService } from '../api/processingService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { FileText, Search, Play, ArrowRight, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

const SUPPORTED_DATASET_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json', '.parquet'];

const isSupportedDataset = (fileName) => {
  if (!fileName) return false;
  const extension = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
  return SUPPORTED_DATASET_EXTENSIONS.includes(extension);
};

export const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const data = await datasetService.getDatasets();
        setDatasets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDatasets();
  }, []);

  const handleProcess = async (fileId) => {
    const selectedDataset = datasets.find(d => d.fileId === fileId);
    if (!selectedDataset || !isSupportedDataset(selectedDataset.fileName)) {
      alert('This file type cannot be processed. Supported formats: CSV, Excel, JSON, and Parquet.');
      return;
    }

    setProcessingId(fileId);
    try {
      const result = await processingService.processDataset(fileId);
      processingService.saveJobToHistory({
        jobId: result.jobId,
        fileId: fileId,
        fileName: selectedDataset.fileName,
        status: 'PENDING'
      });
      navigate(`/processing?jobId=${result.jobId}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start processing');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = datasets.filter(d => d.fileName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Datasets</h1>
          <p className="text-muted-foreground mt-2 text-lg">Select a dataset to clean and process.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search datasets..." 
            className="pl-12 h-12 text-base rounded-2xl"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Loading datasets...</div>
          ) : datasets.length === 0 ? (
            <div className="p-20 text-center">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-3">No datasets found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Connect your cloud storage to import and start processing your datasets.
              </p>
              <Link to="/storage">
                <Button size="lg" className="rounded-full shadow-lg">
                  Connect Cloud Storage <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((dataset, idx) => {
                const supported = isSupportedDataset(dataset.fileName);

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={dataset.fileId} 
                    className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group ${supported ? 'hover:bg-white/5' : 'bg-red-500/5 opacity-80'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border ${supported ? 'bg-gradient-to-br from-primary/20 to-purple-500/20 border-white/5' : 'bg-red-500/10 border-red-500/20'}`}>
                        <FileText className={`h-6 w-6 ${supported ? 'text-primary' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-foreground tracking-tight">{dataset.fileName}</p>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${supported ? 'bg-slate-500' : 'bg-red-400'}`}></span>
                          {supported ? `ID: ${dataset.fileId}` : 'Unsupported file type'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={processingId === dataset.fileId ? 'secondary' : supported ? 'primary' : 'ghost'}
                      size="lg"
                      className={`rounded-full sm:w-auto w-full ${!supported ? 'text-red-300 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10' : ''}`}
                      onClick={() => handleProcess(dataset.fileId)}
                      disabled={processingId === dataset.fileId || !supported}
                    >
                      {processingId === dataset.fileId ? (
                        <span className="flex items-center">
                          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                          Starting...
                        </span>
                      ) : supported ? (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Process Dataset
                        </>
                      ) : (
                        <>
                          <Ban className="h-5 w-5 mr-2" />
                          Cannot Process
                        </>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && search && (
                <div className="p-16 text-center text-muted-foreground text-lg">
                  No datasets match your search for "{search}".
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
