import apiClient from './apiClient';

export const storageService = {
  // We know backend POST /user/connect takes email and password and returns files
  async connectCloud(email, password) {
    const response = await apiClient.post('/user/connect', { email, password });
    return response.data;
  }
};
