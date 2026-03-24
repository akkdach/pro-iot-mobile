// src/services/imageUrl.ts

const KNOWN_LEGACY_ORIGINS = [
    "http://localhost:7887",
    "http://10.50.9.50:7887"
];
const ENV_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:44496/api/v1";
const DEFAULT_TO = ENV_BASE.replace(/\/v1\/?$/, "");

type ReplaceImageUrlOptions = {
    from?: string | string[]; // base เดิม เช่น http://localhost:7887 หรือ array
    to?: string;   // base ใหม่ เช่น http://10.10.199.16:8080
};

/**
 * Replace base url ของรูป (เช่น http://localhost:7887 -> https://service.bevproasia.com)
 */
export function replaceImageBaseUrl(
    input: string | null | undefined,
    options: ReplaceImageUrlOptions = {}
): string {
    if (!input) return "";

    const to = options.to ?? DEFAULT_TO;

    // ถ้าเป็น blob: หรือ data: ไม่ต้องแปลง
    if (input.startsWith("blob:") || input.startsWith("data:")) {
        return input;
    }

    // ลบ legacy origins ออกจาก URL (ทุกรูปแบบ: http://, //, หรือ / นำหน้า)
    let cleaned = input;
    for (const origin of KNOWN_LEGACY_ORIGINS) {
        // แปลง "http://localhost:7887" → หลายรูปแบบ regex
        const host = origin.replace(/^https?:\/\//, ""); // "localhost:7887"
        const pattern = new RegExp(`^(https?:)?//?${host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, "i");
        cleaned = cleaned.replace(pattern, "");
    }

    // ลบ / ซ้ำที่ขึ้นต้น
    cleaned = cleaned.replace(/^\/+/, "/");

    // ถ้าเหลือ path → ต่อกับ base ใหม่
    if (cleaned.startsWith("/")) {
        return `${to}${cleaned}`;
    }

    // ถ้าเป็น URL เต็มอื่นๆ (เช่น https://prod-service.bevproasia.com/...) → ใช้ตรงๆ
    if (cleaned.match(/^https?:\/\//)) {
        return cleaned;
    }

    return `${to}/${cleaned}`;
}

/**
 * Replace หลายๆ ฟิลด์ใน object แบบปลอดภัย
 * ใช้เวลาคุณได้ DTO ที่มีหลายรูป เช่น CLOSE_IMAGE_URL1..8
 */
export function mapImageUrls<T extends Record<string, any>>(
    obj: T,
    keys: (keyof T)[],
    options?: ReplaceImageUrlOptions
): T {
    const cloned = { ...obj };
    for (const k of keys) {
        const v = cloned[k];
        if (typeof v === "string" || v == null) {
            cloned[k] = replaceImageBaseUrl(v, options) as any;
        }
    }
    return cloned;
}
