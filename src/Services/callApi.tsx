// api.ts
import axios, { AxiosRequestConfig } from 'axios';
import { attachAppName } from './appName';
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
  request?: any;
}

const DEFAULT_BASE = 'http://localhost:44496/api/v1';
const BASE_URL = (process.env.REACT_APP_API_BASE_URL as string) || DEFAULT_BASE;

const callApi = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
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
    return attachAppName(config);
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
callApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // จัดการ error เช่น token หมดอายุ
    if (error.response?.status === 401) {
      // ลบเฉพาะ token/profile — อย่า clear() ทั้งก้อน เพราะจะลบ brake sso_logout + MSAL cache
      // ทำให้ auto-SSO เด้ง login ใหม่แล้วโดน 401 ซ้ำเป็นวงวน (sessionStorage sso_hub ยังรอด)
      localStorage.removeItem('token');
      localStorage.removeItem('profile');
      // circuit breaker: กัน auto-SSO ยิงทันทีหลังโดนเตะออก — Login อ่าน timestamp นี้แล้วข้าม auto ~10 วิ
      localStorage.setItem('forced_logout_at', String(Date.now()));
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default callApi;
