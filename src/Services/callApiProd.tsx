// api.ts
import axios, { AxiosRequestConfig } from 'axios';
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
  request?: any;
}

const DEFAULT_PROD_BASE = 'https://prod-service.bevproasia.com/api/v1';
const PROD_BASE_URL = (process.env.REACT_APP_API_PROD_BASE_URL as string) || DEFAULT_PROD_BASE;

const callApiProd = axios.create({
  baseURL: PROD_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
callApiProd.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // หรือจาก secure storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
callApiProd.interceptors.response.use(
  (response) => response,
  (error) => {
    // จัดการ error เช่น token หมดอายุ
    if (error.response?.status === 401) {
      // redirect ไปหน้า login หรือ refresh token
      localStorage.clear();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default callApiProd;
