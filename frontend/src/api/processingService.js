import apiClient from './apiClient';

export const processingService = {
  // Real backend endpoint to trigger processing
  async processDataset(fileId) {
    const response = await apiClient.post(`/user/process/${fileId}`);
    return response.data; // { message, fileId, jobId }
  },

  // Assumed endpoint to get job status. Isolate assumption here.
  async getJobStatus(jobId) {
    try {
      // If backend had this endpoint:
      // const response = await apiClient.get(`/user/job/${jobId}`);
      // return response.data;
      
      // Since it doesn't exist yet, we mock a progression for demonstration
      const statusMap = JSON.parse(localStorage.getItem('jobStatuses') || '{}');
      const currentStatus = statusMap[jobId] || { status: 'PENDING', progress: 0 };
      
      // Simulate progression
      if (currentStatus.status !== 'COMPLETED' && currentStatus.status !== 'FAILED') {
        currentStatus.progress += 25;
        if (currentStatus.progress >= 25) currentStatus.status = 'RUNNING';
        if (currentStatus.progress >= 100) {
          currentStatus.status = 'COMPLETED';
          currentStatus.progress = 100;
        }
        statusMap[jobId] = currentStatus;
        localStorage.setItem('jobStatuses', JSON.stringify(statusMap));
      }
      return currentStatus;
    } catch (error) {
      console.error(error);
      return { status: 'FAILED' };
    }
  },

  // Assumed endpoint to get job history
  async getHistory() {
    // Return a mock history or empty array since backend doesn't have this yet.
    return JSON.parse(localStorage.getItem('jobHistory') || '[]');
  },

  saveJobToHistory(job) {
    const history = JSON.parse(localStorage.getItem('jobHistory') || '[]');
    history.push({ ...job, started: new Date().toISOString() });
    localStorage.setItem('jobHistory', JSON.stringify(history));
  }
};
