// utils/api-client.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
const baseURLOneleke = process.env.REACT_APP_API_ONELAKE_URL || "http://10.10.199.16:3005/api/";
const apiClient = axios.create({
    baseURL: baseURLOneleke,
    timeout: 0,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor (optional): เพิ่ม token หรือจัดการ response
apiClient.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token'); // หรือจาก context
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response: any) => response,
    (error: any) => {

        const status = error.response?.status;

        if (status === 401 || status === 403) {
            // ลบ token และ redirect ไปหน้า login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);

    }
);

// ฟังก์ชันกลาง
export async function callApiOneleke<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    dataOrConfig?: any,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    // Handle smart parameter detection
    // If method is GET or DELETE and third parameter has 'params', treat it as config
    const isReadMethod = method === 'GET' || method === 'DELETE';
    const hasParams = dataOrConfig && typeof dataOrConfig === 'object' && 'params' in dataOrConfig;

    let finalConfig: AxiosRequestConfig;
    let finalData: any;

    if (isReadMethod && hasParams) {
        // For GET/DELETE with params in third argument, use it as config
        finalConfig = { ...dataOrConfig, ...config };
        finalData = undefined;
    } else {
        // For POST/PUT or GET/DELETE without params in third argument
        finalData = dataOrConfig;
        finalConfig = config || {};
    }

    return apiClient({
        method,
        url,
        data: finalData,
        ...finalConfig,
    });
}
