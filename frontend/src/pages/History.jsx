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
      const data = await processingService.getHistory();
      // Sort by newest first
      setHistory(data.sort((a, b) => new Date(b.started) - new Date(a.started)));
    };
    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Processing History</h1>
        <p className="text-slate-500 mt-1">View the status of your past and current processing jobs.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>No jobs found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Job ID</th>
                    <th className="px-6 py-4 font-medium">Dataset</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Started</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((job) => (
                    <tr key={job.jobId} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-medium">{job.jobId.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-slate-500">{job.fileName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          job.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          job.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(job.started).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/processing?jobId=${job.jobId}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
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
