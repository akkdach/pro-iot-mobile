// X-App-Name — บอก Kong gateway ว่า request มาจากแอปไหน
// dashboard "Kong — ใครยิงอะไร" ใช้คอลัมน์ app_name แยก traffic รายแอป
// (consumer/JWT แยกไม่ได้เพราะทุกแอปใช้ token ชุดเดียวกัน)
//
// แนบเฉพาะ request ที่ปลายทางคือ gateway — host อื่น (เรียกตรง backend)
// ไม่ได้ประกาศ header นี้ใน CORS policy ใส่ไปแล้ว browser จะ block ทั้ง request
export const APP_NAME = 'pro-iot-mobile';
export const GATEWAY_HOST = 'bevprogateway.southeastasia.cloudapp.azure.com';

export function attachAppName(config: any) {
    try {
        const origin =
            typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        const url = new URL(config.url ?? '', config.baseURL ?? origin);
        if (url.host === GATEWAY_HOST && config.headers) {
            config.headers['X-App-Name'] = APP_NAME;
        }
    } catch {
        /* URL แปลก ๆ ก็แค่ไม่แนบ */
    }
    return config;
}
