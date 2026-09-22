import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    localStorage.setItem('jwtToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('jwtToken');
  }
};

// Initialize token from localStorage if present
const existingToken = localStorage.getItem('jwtToken');
if (existingToken) {
  api.defaults.headers.common['Authorization'] = `Token ${existingToken}`;
}

export default api;
