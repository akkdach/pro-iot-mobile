/**
 * Counting API Client
 * API functions สำหรับระบบตรวจนับอะไหล่บนรถ
 */

import {
    Vehicle,
    InventoryItem,
    CountSheet,
    CountSheetDetail,
    CountLine,
    SyncEvent,
    SyncResult,
    MismatchReason,
} from '../types/counting.types';
import callApi from './callApi';

const API_BASE = 'https://prod-service.bevproasia.com/api/v1';

/**
 * ดึงรายการใบตรวจนับ
 */
export const getCountingList = async (
    wk_ctr: string = '',
    count_status: string = '',
    count_no: number = 0
) => {
    const payload = {
        wk_ctr,
        count_status,
        count_no
    };
    const response = await callApi.post('/Inventory/List_counting', payload);
    return response.data;
};

/**
 * สร้างใบตรวจนับ (Custom)
 */
export const createCounting = async (
    wk_ctr: string,
    count_movement: boolean
) => {
    const payload = {
        wk_ctr,
        count_movement
    };
    const response = await callApi.post('inventory/create_counting', payload);
    return response.data;
};

/**
 * ดึงรายละเอียดใบตรวจนับ
 */
export const getCountingDetail = async (count_no: string) => {
    const response = await callApi.get(`Inventory/Get_counting/${count_no}`);
    return response.data;
};

/**
 * บันทึกใบตรวจนับ
 */
export const saveCounting = async (payload: any) => {
    const response = await callApi.post('Inventory/Save_counting', payload);
    return response.data;
};

/**
 * สร้าง headers พร้อม auth token
 */
const createHeaders = (token?: string, idempotencyKey?: string): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-API-Version': 'v1',
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
});

/**
 * HTTP wrapper พร้อม error handling
 */
async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, init);

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        // Handle specific error codes
        if (res.status === 401) {
            localStorage.clear();
            window.location.replace('/login');
        }

        if (res.status === 409) {
            throw new Error('CONFLICT: ' + (err.message || 'Data conflict detected'));
        }

        if (res.status === 503) {
            throw new Error('SERVER_UNAVAILABLE: Service temporarily unavailable');
        }

        throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}

// ============================================================
// GET Requests
// ============================================================

/**
 * ดึงรายการรถ/ทีมงานที่ผูกกับผู้ใช้
 */
export const getVehicles = (token?: string): Promise<{ vehicles: Vehicle[] }> =>
    http<{ vehicles: Vehicle[] }>('/vehicles', {
        headers: createHeaders(token),
    });

/**
 * ดึงสต๊อกอะไหล่บนรถ
 */
export const getVehicleInventory = (
    vehicleId: string,
    token?: string
): Promise<{ items: InventoryItem[] }> =>
    http<{ items: InventoryItem[] }>(`/inventory/vehicle/${vehicleId}`, {
        headers: createHeaders(token),
    });

/**
 * ดึงรายละเอียดใบตรวจนับ
 */
export const getCountSheet = (
    sheetId: string,
    token?: string
): Promise<{ sheet: CountSheetDetail }> =>
    http<{ sheet: CountSheetDetail }>(`/count-sheets/${sheetId}`, {
        headers: createHeaders(token),
    });

/**
 * แปลงบาร์โค้ดเป็นสินค้า
 */
export const resolveBarcode = (
    code: string,
    token?: string
): Promise<{ item: InventoryItem }> =>
    http<{ item: InventoryItem }>(
        `/barcode/resolve?code=${encodeURIComponent(code)}`,
        { headers: createHeaders(token) }
    );

// ============================================================
// POST Requests
// ============================================================

/**
 * สร้างใบตรวจนับใหม่
 * Backend จะดึง vehicleId/teamId จาก JWT token โดยอัตโนมัติ
 */
export const createCountSheet = (
    token?: string
): Promise<{ sheet: CountSheet }> =>
    http<{ sheet: CountSheet }>('/count-sheets', {
        method: 'POST',
        headers: createHeaders(token),
    });

/**
 * อัปเดตผลการตรวจนับของรายการ
 */
export const updateCountLine = (
    sheetId: string,
    lineId: string,
    data: { countedQty: number; reason?: MismatchReason },
    token?: string,
    idempotencyKey?: string
): Promise<{ line: CountLine }> =>
    http<{ line: CountLine }>(`/count-sheets/${sheetId}/lines/${lineId}`, {
        method: 'POST',
        headers: createHeaders(token, idempotencyKey),
        body: JSON.stringify(data),
    });

/**
 * บันทึกใบตรวจนับ (draft)
 */
export const saveCountSheet = (
    sheetId: string,
    token?: string
): Promise<{ sheet: CountSheetDetail }> =>
    http<{ sheet: CountSheetDetail }>(`/count-sheets/${sheetId}/save`, {
        method: 'POST',
        headers: createHeaders(token),
    });

/**
 * ส่งรายงานตรวจนับ
 */
export const submitCountSheet = (
    sheetId: string,
    token?: string
): Promise<{ status: 'submitted' }> =>
    http<{ status: 'submitted' }>(`/count-sheets/${sheetId}/submit`, {
        method: 'POST',
        headers: createHeaders(token),
    });

/**
 * ส่ง queue offline ขึ้นระบบกลาง
 */
export const syncQueue = (
    events: SyncEvent[],
    token?: string
): Promise<{ result: SyncResult }> =>
    http<{ result: SyncResult }>('/sync', {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ events }),
    });

// ============================================================
// Offline Queue Helpers
// ============================================================

const QUEUE_STORAGE_KEY = 'counting_sync_queue';

/**
 * บันทึก queue ลง localStorage
 */
export const saveQueueToStorage = (queue: SyncEvent[]): void => {
    try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error('Failed to save queue to storage:', e);
    }
};

/**
 * ดึง queue จาก localStorage
 */
export const loadQueueFromStorage = (): SyncEvent[] => {
    try {
        const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load queue from storage:', e);
        return [];
    }
};

/**
 * ลบ queue จาก localStorage
 */
export const clearQueueFromStorage = (): void => {
    try {
        localStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear queue from storage:', e);
    }
};

/**
 * สร้าง UUID สำหรับ idempotency key
 */
export const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
