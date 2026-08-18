import apiClient from './apiClient';

export const storageService = {
  async connectCloud(email, password) {
    const response = await apiClient.post('/user/connect', { email, password });
    return response.data;
  },

  async connectAlready() {
    const response = await apiClient.post('/user/connectAlready');
    return response.data;
  }
};
