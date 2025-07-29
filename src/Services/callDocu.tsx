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

const callDocu = axios.create({
  baseURL: 'https://service.bevproasia.com/api', // เปลี่ยนเป็น URL จริงของคุณ
  timeout: 10000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
    
  
});


// Request Interceptor
callDocu.interceptors.request.use(
  (config) => {
    // console.log('callDocu', callDocu.request)
    const token = localStorage.getItem('token'); // หรือจาก secure storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type']= "multipart/form-data";
    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor
callDocu.interceptors.response.use(
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

export default callDocu;
