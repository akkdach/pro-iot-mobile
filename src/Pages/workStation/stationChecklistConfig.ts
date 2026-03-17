// stationChecklistConfig.ts
// Checklist config ของทุก station — อ้างอิงจากใบงาน Setup / Refurbish

export interface ChecklistItem {
    id: string;
    label: string;
    type: "check" | "text" | "number" | "option";
    unit?: string;
    options?: string[];  // สำหรับ type: "option" — เลือกได้แค่อันเดียว
}

export interface StationChecklistGroup {
    station: string;
    title: string;
    categories: {
        name: string;
        items: ChecklistItem[];
    }[];
}
// ─── ข้อมูล config ย้ายไปอยู่ใน Database (Prisma) แล้ว ───
// ─── ดึงผ่าน API: GET /Checklist/master/grouped/:station ───
// ─── เก็บ hardcode ไว้เป็น reference ด้านล่าง (comment) ───

const stationChecklistConfig: StationChecklistGroup[] = [];

export default stationChecklistConfig;

/*  ════════════════════════════════════════════════════════════
    HARDCODE CONFIG (เก็บไว้เป็น reference — อย่าลบ)
    ════════════════════════════════════════════════════════════

const stationChecklistConfig: StationChecklistGroup[] = [
    // ─── Station 1: Inspector (0010) ───
    // แต่ละ item เลือกได้แค่อย่างเดียว: เปลี่ยน / ล้าง
    {
        station: "0010",
        title: "Inspector",
        categories: [
            // ── Section 1: ตรวจเช็คสภาพเครื่อง อุปกรณ์เครื่อง (5 items) ──
            {
                name: "ตรวจเช็คสภาพเครื่อง อุปกรณ์เครื่อง",
                items: [
                    { id: "INS-A01", label: "สภาพตัวตู้และโครงสร้างอุปกรณ์", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-A02", label: "ชุดเปิดตรวจและถอดของระบายทิ้ง", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-A03", label: "ชุดวาล์ว", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-A04", label: "แท่นแกนปรับสติ๊กเกอร์เย็น", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-A05", label: "Stopper (หล่อ)", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                ],
            },
            // ── Section 2: ตรวจเช็คความสะอาดเครื่องและอุปกรณ์ (19 items) ──
            {
                name: "ตรวจเช็คความสะอาดเครื่องและอุปกรณ์",
                items: [
                    { id: "INS-B01", label: "ตัวเครื่อง", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B02", label: "คอยล์ร้อน/เย็น", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B03", label: "ฝาบังลมราคา", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B04", label: "ขอบประตู", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B05", label: "ขอบประตู (2)", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B06", label: "สลักงอ", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B07", label: "ล้อ", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B08", label: "สติ๊กเกอร์น้ำหนัก", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B09", label: "ใบพัดลม", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B10", label: "ใบพัดลมแบน", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B11", label: "ฝาครอบหน้าตู้", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B12", label: "สายไฟ (สภาพ AC)", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B13", label: "ปลั๊กไฟที่ต้น 3ช่อง (Color)", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B14", label: "ถาดรองน้ำทิ้ง", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B15", label: "สปริงประตู", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B16", label: "สติ๊กเกอร์ว่าว้อน", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B17", label: "สติ๊กเกอร์ เปิดประตู", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B18", label: "สติ๊กเกอร์ติดตลอดท่อริ้น", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-B19", label: "สภาพอุปกรณ์", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                ],
            },
            // ── Section 3: ตรวจเช็คระบบไฟฟ้า / อุปกรณ์ไฟฟ้า (16 items) ──
            {
                name: "ตรวจเช็คระบบไฟฟ้า / อุปกรณ์ไฟฟ้า",
                items: [
                    { id: "INS-C01", label: "THERMOSTAT", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C02", label: "DIGITAL TEMPERATURE METER", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C03", label: "TEMP PROBE 5MM", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C04", label: "ปลั๊ก", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C05", label: "สายดิน", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C06", label: "แรงดันไฟฟ้า (volt)", type: "number", unit: "V" },
                    { id: "INS-C07", label: "กระแสไฟทำงาน (A.)", type: "number", unit: "A" },
                    { id: "INS-C08", label: "Motor Condenser", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C09", label: "Motor Evaporator", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C10", label: "หลอดไฟ", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C11", label: "Board Control", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C12", label: "Cap Run", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C13", label: "Cap Start", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C14", label: "Relay", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C15", label: "Over Load", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-C16", label: "LED DRIVER", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                ],
            },
            // ── Section 4: ตรวจเช็คชุดทำความเย็น (6 items) ──
            {
                name: "ตรวจเช็คชุดทำความเย็น",
                items: [
                    { id: "INS-D01", label: "น้ำยา Freon (R134/D2/R30/R600)", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-D02", label: "Evaporator", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-D03", label: "Condensor", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-D04", label: "Dyer", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-D05", label: "Insulation", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-D06", label: "Compressor", type: "number", unit: "Amp" },
                ],
            },
            // ── Section 5: ตรวจเช็คคุณภาพ (10 items) ──
            {
                name: "ตรวจเช็คคุณภาพ",
                items: [
                    { id: "INS-E01", label: "วัดอุณหภูมิภายในตู้", type: "number", unit: "°C" },
                    { id: "INS-E02", label: "วัดระบบแสงสว่าง", type: "number", unit: "Lux" },
                    { id: "INS-E03", label: "วัดความเร็วลม Motor Evap", type: "number", unit: "m/Sec" },
                    { id: "INS-E04", label: "วัดความเร็วลม Motor Condenser", type: "number", unit: "m/Sec" },
                    { id: "INS-E05", label: "วัดความเร็วรอบมอเตอร์ Evaporator", type: "number", unit: "rpm" },
                    { id: "INS-E06", label: "วัดความเร็วรอบมอเตอร์ Condenser", type: "number", unit: "rpm" },
                    { id: "INS-E07", label: "วัดระดับเสียง", type: "number", unit: "dB" },
                    { id: "INS-E08", label: "ระยะเวลาทดสอบระบบเย็นสมบูรณ์", type: "number", unit: "นาที" },
                    { id: "INS-E09", label: "เซ็ตชุดระบบไฟลอดราชร์", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                    { id: "INS-E10", label: "ฝาครอบจุด Start", type: "option", options: ["เปลี่ยน", "ล้าง"] },
                ],
            },
        ],
    },


    // ─── Station 2: Remove Part (0020) ───
    {
        station: "0020",
        title: "Remove Part",
        categories: [
            {
                name: "ถอดชิ้นส่วนเครื่อง",
                items: [
                    { id: "REM-01", label: "หัวจ่ายก๊าซ", type: "check" },
                    { id: "REM-02", label: "ชุดวาล์ว", type: "check" },
                    { id: "REM-03", label: "แผงคอมเพรสเซอร์", type: "check" },
                    { id: "REM-04", label: "สายไฟชุด", type: "check" },
                    { id: "REM-05", label: "บอร์ดควบคุม", type: "check" },
                    { id: "REM-06", label: "ฝาครอบด้านหน้า", type: "check" },
                    { id: "REM-07", label: "ใบพัดลม", type: "check" },
                    { id: "REM-08", label: "มอเตอร์พัดลม", type: "check" },
                ],
            },
        ],
    },

    // ─── Station 3: Clean (0030) ───
    {
        station: "0030",
        title: "Clean",
        categories: [
            {
                name: "ทำความสะอาด",
                items: [
                    { id: "CLN-01", label: "ทำความสะอาดตัวเครื่อง", type: "check" },
                    { id: "CLN-02", label: "ทำความสะอาดคอยล์ร้อน", type: "check" },
                    { id: "CLN-03", label: "ทำความสะอาดคอยล์เย็น", type: "check" },
                    { id: "CLN-04", label: "ทำความสะอาดถาดรองน้ำทิ้ง", type: "check" },
                    { id: "CLN-05", label: "ทำความสะอาดใบพัดลม", type: "check" },
                ],
            },
        ],
    },

    // ─── Station 4: Color (0040) ───
    {
        station: "0040",
        title: "Color",
        categories: [
            {
                name: "ทำสีเครื่องและอุปกรณ์",
                items: [
                    { id: "CLR-01", label: "พ่นสีตัวเครื่อง", type: "check" },
                    { id: "CLR-02", label: "พ่นสีฝาครอบ", type: "check" },
                    { id: "CLR-03", label: "พ่นสีถาดรองน้ำ", type: "check" },
                    { id: "CLR-04", label: "พ่นสีตะแกรง", type: "check" },
                    { id: "CLR-05", label: "สีสม่ำเสมอ ไม่มีหยดย้อย", type: "check" },
                ],
            },
        ],
    },

    // ─── Station 5: Fix Cooling (0050) ───
    {
        station: "0050",
        title: "Fix Cooling",
        categories: [
            {
                name: "ซ่อมระบบทำความเย็น",
                items: [
                    { id: "FIX-01", label: "Run Freon", type: "check" },
                    { id: "FIX-02", label: "R134a", type: "number", unit: "g" },
                    { id: "FIX-03", label: "R32", type: "number", unit: "g" },
                    { id: "FIX-04", label: "R600", type: "number", unit: "g" },
                    { id: "FIX-05", label: "เติมน้ำยาเรียบร้อย", type: "check" },
                ],
            },
        ],
    },

    // ─── Station 6: Assembly Part (0060) ───
    {
        station: "0060",
        title: "Assembly Part",
        categories: [
            {
                name: "การติดตั้งอุปกรณ์ไฟฟ้า / อุปกรณ์ไฟฟ้า",
                items: [
                    { id: "ASM-01", label: "THERMOSTAT", type: "check" },
                    { id: "ASM-02", label: "DIGITAL TEMPERATURE METER", type: "check" },
                    { id: "ASM-03", label: "TEMP PROBE 5MM", type: "check" },
                    { id: "ASM-04", label: "ปลั๊ก", type: "check" },
                    { id: "ASM-05", label: "สายไฟ (volt)", type: "number", unit: "V" },
                ],
            },
        ],
    },

    // ─── Station 7: Test (0070) ───
    {
        station: "0070",
        title: "Test",
        categories: [
            {
                name: "ทดสอบเครื่อง Test Run",
                items: [
                    { id: "TST-01", label: "กระแสไฟทำงาน (A.)", type: "number", unit: "A" },
                    { id: "TST-02", label: "Motor Condenser", type: "check" },
                    { id: "TST-03", label: "Motor Evaporator", type: "check" },
                    { id: "TST-04", label: "จานหมุน", type: "check" },
                    { id: "TST-05", label: "Board Control", type: "check" },
                    { id: "TST-06", label: "Cap Run", type: "check" },
                    { id: "TST-07", label: "Cap Start", type: "check" },
                    { id: "TST-08", label: "Relay", type: "check" },
                    { id: "TST-09", label: "Over Load", type: "check" },
                    { id: "TST-10", label: "LED DRIVER", type: "check" },
                ],
            },
        ],
    },

    // ─── Station 8: QC Packing (0080) ───
    {
        station: "0080",
        title: "QC Packing",
        categories: [
            {
                name: "การตรวจสอบคุณภาพ",
                items: [
                    { id: "QC-01", label: "วัดอุณหภูมิห้อง/ตู้อุณหภูมิในตู้", type: "check" },
                    { id: "QC-02", label: "วัดความเร็วลม Meter Evap", type: "number", unit: "m/Sec" },
                    { id: "QC-03", label: "วัดความเร็วลม Meter Condenser", type: "number", unit: "m/Sec" },
                    { id: "QC-04", label: "วัดความเร็วรอบมอเตอร์ (Evaporator)", type: "number", unit: "rpm" },
                    { id: "QC-05", label: "วัดความเร็วรอบมอเตอร์ (Condenser)", type: "number", unit: "rpm" },
                    { id: "QC-06", label: "วัดระดับเสียง", type: "number", unit: "dB" },
                    { id: "QC-07", label: "ภาพถ่ายตรวจสอบสินค้าสมบูรณ์ 2-4 มุม", type: "check" },
                ],
            },
        ],
    },
];

════════════════════════════════════════════════════════════ */
