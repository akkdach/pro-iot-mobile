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

const callDevice = axios.create({
  // ผ่าน Kong gateway (route iot-v1: /iot/v1 -> iotservice.bevproasia.com/api/v1) — เดิมยิงตรง iotservice
  baseURL: 'https://bevprogateway.southeastasia.cloudapp.azure.com/iot/v1/Devices',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
callDevice.interceptors.request.use(
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
callDevice.interceptors.response.use(
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

export default callDevice;
