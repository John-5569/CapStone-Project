import apiClient from './apiClient';

export const datasetService = {
  async getDatasets() {
    try {
      const response = await apiClient.get('/user/datasets');
      const datasets = response.data || [];
      localStorage.setItem('datasets', JSON.stringify(datasets));
      return datasets;
    } catch (error) {
      const cached = localStorage.getItem('datasets');
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    }
  },
  
  saveDatasets(datasets) {
    localStorage.setItem('datasets', JSON.stringify(datasets));
  }
};
