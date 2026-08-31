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

// ผ่าน Kong gateway (/prod catch-all) — เดิม fallback ตรง prod-service
const DEFAULT_PROD_BASE = 'https://bevprogateway.southeastasia.cloudapp.azure.com/prod/api/v1';
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
    const token = localStorage.getItem('token'); // à¸«à¸£à¸·à¸­à¸ˆà¸²à¸ secure storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return attachAppName(config);
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
callApiProd.interceptors.response.use(
  (response) => response,
  (error) => {
    // à¸ˆà¸±à¸”à¸à¸²à¸£ error à¹€à¸Šà¹ˆà¸™ token à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸
    if (error.response?.status === 401) {
      // à¸¥à¸šà¹€à¸‰à¸žà¸²à¸° token/profile â€” à¸­à¸¢à¹ˆà¸² clear() à¸—à¸±à¹‰à¸‡à¸à¹‰à¸­à¸™ à¹€à¸žà¸£à¸²à¸°à¸ˆà¸°à¸¥à¸š brake sso_logout + MSAL cache
      // à¸—à¸³à¹ƒà¸«à¹‰ auto-SSO à¹€à¸”à¹‰à¸‡ login à¹ƒà¸«à¸¡à¹ˆà¹à¸¥à¹‰à¸§à¹‚à¸”à¸™ 401 à¸‹à¹‰à¸³à¹€à¸›à¹‡à¸™à¸§à¸‡à¸§à¸™ (sessionStorage sso_hub à¸¢à¸±à¸‡à¸£à¸­à¸”)
      localStorage.removeItem('token');
      localStorage.removeItem('profile');
      // circuit breaker: à¸à¸±à¸™ auto-SSO à¸¢à¸´à¸‡à¸—à¸±à¸™à¸—à¸µà¸«à¸¥à¸±à¸‡à¹‚à¸”à¸™à¹€à¸•à¸°à¸­à¸­à¸ â€” Login à¸­à¹ˆà¸²à¸™ timestamp à¸™à¸µà¹‰à¹à¸¥à¹‰à¸§à¸‚à¹‰à¸²à¸¡ auto ~10 à¸§à¸´
      localStorage.setItem('forced_logout_at', String(Date.now()));
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default callApiProd;
