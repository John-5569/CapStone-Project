import apiClient from './apiClient';

export const authService = {
  async register(email, password) {
    const response = await apiClient.post('/auth/register', { email, password });
    return response.data;
  },

  async login(email, password, rememberMe = false) {
    const response = await apiClient.post('/auth/login', { email, password, rememberMe });
    return response.data;
  },

  async refresh() {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async verify(token) {
    const response = await apiClient.get(`/auth/verify/${token}`);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgotpassword', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await apiClient.post(`/auth/resetpassword/${token}`, { newPassword });
    return response.data;
  },

  async googleLogin(idToken) {
    const response = await apiClient.post('/auth/google', { idToken });
    return response.data;
  }
};
