import axios from 'axios';

const API_BASE_URL = 'https://phimapi.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
