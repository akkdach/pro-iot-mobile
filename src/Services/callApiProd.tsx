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

export default callApiProd;
