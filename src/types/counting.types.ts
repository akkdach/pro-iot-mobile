/**
 * Counting Screen TypeScript Interfaces
 * สำหรับระบบตรวจนับอะไหล่บนรถ Field Service
 */

export type ID = string;

/**
 * รถ/ทีมงาน
 */
export interface Vehicle {
  id: ID;
  code: string;        // รหัสรถ
  name: string;        // ชื่อทีม/รถ
}

/**
 * รายการอะไหล่ในระบบ
 */
export interface InventoryItem {
  id: ID;
  sku: string;
  name: string;
  systemQty: number;   // จำนวนในระบบ
  uom: string;         // หน่วยนับ
  iconUrl?: string;
  location?: string;   // ตำแหน่งบนรถ (เช่น กล่องที่)
}

/**
 * สถานะใบตรวจนับ/รายการ
 */
export type CountStatus = "pending" | "matched" | "mismatch" | "over" | "submitted" | "saved";

/**
 * เหตุผลเมื่อจำนวนไม่ตรง
 */
export type MismatchReason = "lost" | "used" | "found" | "other";

/**
 * ใบตรวจนับ (Header)
 */
export interface CountSheet {
  id: ID;
  vehicleId: ID;
  code: string;        // รหัสใบตรวจนับ
  status: CountStatus; // pending/saved/submitted
  createdAt: string;
  createdBy: ID;
}

/**
 * รายการตรวจนับ (Line)
 */
export interface CountLine {
  id: ID;
  sheetId: ID;
  itemId: ID;
  item?: InventoryItem; // ข้อมูลสินค้าแบบ denormalized
  systemQty: number;
  countedQty: number | null;
  reason?: MismatchReason;
  status: "pending" | "matched" | "mismatch" | "over";
  updatedAt?: string;
}

/**
 * ใบตรวจนับพร้อมรายการ
 */
export interface CountSheetDetail extends CountSheet {
  lines: CountLine[];
  progress: { counted: number; total: number }; // X/Y
}

/**
 * Event สำหรับ offline sync
 */
export interface SyncEvent {
  id: ID;             // client-generated UUID
  type:
    | "COUNT_LINE_UPDATE"
    | "COUNT_SHEET_SAVE"
    | "COUNT_SHEET_SUBMIT";
  payload: Record<string, unknown>;
  timestamp: number;
  idempotencyKey: string;
}

/**
 * ผลลัพธ์การ sync
 */
export interface SyncResult {
  successIds: ID[];
  failed: { id: ID; reason: string; retryAfter?: number }[];
}

/**
 * Progress tracking
 */
export interface CountProgress {
  counted: number;
  total: number;
  percentage: number;
}

/**
 * Counting hook state
 */
export interface CountingState {
  vehicle: Vehicle | null;
  sheet: CountSheetDetail | null;
  items: InventoryItem[];
  progress: CountProgress;
  online: boolean;
  queue: SyncEvent[];
  loading: boolean;
  error: string | null;
}
