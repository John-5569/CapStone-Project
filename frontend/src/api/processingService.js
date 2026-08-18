import apiClient from './apiClient';

export const processingService = {
  async processDataset(fileId) {
    const response = await apiClient.post(`/user/process/${fileId}`);
    return response.data;
  },

  async getJobStatus(jobId) {
    const response = await apiClient.get(`/user/job/${jobId}`);
    return response.data;
  },

  async getHistory() {
    const response = await apiClient.get('/user/history');
    return Array.isArray(response.data) ? response.data : [];
  }
};
