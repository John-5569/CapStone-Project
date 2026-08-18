import React, { useEffect, useState } from 'react';
import { processingService } from '../api/processingService';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ExternalLink } from 'lucide-react';

export const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await processingService.getHistory();
        // Sort by newest first
        setHistory(data.sort((a, b) => new Date(b.started) - new Date(a.started)));
      } catch {
        setHistory([]);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1e1915] dark:text-white">Processing History</h1>
        <p className="text-[#615951] dark:text-slate-400 mt-1">View the status of your past and current processing jobs.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-12 text-center text-[#615951] dark:text-slate-400">
              <p>No jobs found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#615951] dark:text-slate-300 uppercase bg-[#f7f5f2] dark:bg-slate-800/80 border-b border-[#e6e1da] dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Job ID</th>
                    <th className="px-6 py-4 font-semibold">Dataset</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Started</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e1da] dark:divide-slate-800">
                  {history.map((job) => (
                    <tr key={job.jobId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-[#1e1915] dark:text-slate-200">{job.jobId.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-[#615951] dark:text-slate-300 font-medium">{job.fileName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          job.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-200 dark:border-green-800/50' :
                          job.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/50' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#615951] dark:text-slate-300">
                        {new Date(job.started).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/processing?jobId=${job.jobId}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[#0061ff] dark:text-blue-400 hover:text-[#0052d6] dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-semibold"
                          >
                            <ExternalLink className="h-4 w-4 mr-1.5" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
