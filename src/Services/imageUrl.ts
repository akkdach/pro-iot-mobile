// src/services/imageUrl.ts

const KNOWN_LEGACY_ORIGINS = [
    "http://localhost:7887",
    "http://10.50.9.50:7887"
];
const DEFAULT_TO = "http://10.10.199.16:8080";

type ReplaceImageUrlOptions = {
    from?: string | string[]; // base เดิม เช่น http://localhost:7887 หรือ array
    to?: string;   // base ใหม่ เช่น http://10.10.199.16:8080
    // ถ้าอยากให้รองรับ https/พอร์ตอื่น ๆ ในอนาคต ค่อยเพิ่ม logic ได้
};

/**
 * Replace base url ของรูป (เช่น http://localhost:7887 -> http://10.10.199.16:8080)
 */
export function replaceImageBaseUrl(
    input: string | null | undefined,
    options: ReplaceImageUrlOptions = {}
): string {
    if (!input) return "";

    const to = options.to ?? DEFAULT_TO;

    // Regex Check: ถ้าขึ้นต้นด้วย http:// หรือ https:// ให้เปลี่ยน Domain/IP ทันทีโดยไม่สนของเดิม
    if (input.match(/^https?:\/\//)) {
        return input.replace(/^https?:\/\/[^\/]+/, to);
    }

    // ถ้าไม่ใช่ http และไม่ใช่ blob: (คือเป็น relative path แบบ refurbish/...)
    if (!input.startsWith("blob:") && !input.startsWith("data:")) {
        // ถ้าขึ้นต้นด้วย / ให้ตัดออกก่อนค่อยต่อ (จะได้ไม่เป็น //)
        const cleanPath = input.startsWith("/") ? input.slice(1) : input;
        return `${to}/${cleanPath}`;
    }

    return input;
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
