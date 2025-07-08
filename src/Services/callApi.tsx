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

const callApi = axios.create({
  baseURL: 'http://10.50.9.41/api/v1', // เปลี่ยนเป็น URL จริงของคุณ
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
callApi.interceptors.request.use(
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
callApi.interceptors.response.use(
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

export default callApi;
