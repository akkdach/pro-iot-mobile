# Work Order Station Flow

> เอกสารอธิบาย flow การวิ่งของงาน (Work Order) ผ่าน station ต่างๆ ตั้งแต่เริ่มจนสิ้นสุด

## Station ทั้งหมด

| Station Code | ชื่อ | ประเภท |
|---|---|---|
| `0010` | Inspector | หลัก |
| `0020` | Remove Part | หลัก |
| `0030` | Clean | หลัก |
| `0040` | Color | หลัก |
| `0049` | QC สี | QC แทรก (ตรวจสอบงานสี) |
| `0050` | Fix Cooling | หลัก |
| `0060` | Assembly Part | หลัก |
| `0070` | Test | หลัก |
| `0079` | QC ทดสอบ | QC แทรก (ตรวจสอบงาน Test) |
| `0080` | QC Packing (Final) | หลัก |
| `0000` | Defect | Defect (งานมีปัญหา) |

---

## Flow ปกติ (Happy Path)

```
0010 → 0020 → 0030 → 0040 → 0049 → 0050 → 0060 → 0070 → 0079 → 0080 → Completed
```

### แต่ละ Station ทำอะไร

#### 1. `0010` Inspector
- ตรวจสอบสภาพเครื่อง
- กำหนด Checklist ว่างานต้องผ่าน station ไหนบ้าง (ติ๊ก checkbox)
- เลือกพนักงานเข้าทำงาน → กด **Start** → กด **Finish**

#### 2. `0020` Remove Part
- ถอดชิ้นส่วนที่ต้องเปลี่ยน/ซ่อม

#### 3. `0030` Clean
- ล้างทำความสะอาดเครื่อง
- มี Checklist ย่อย (iframe embed)

#### 4. `0040` Color
- พ่นสีเครื่อง

#### 5. `0049` QC สี *(station แทรก)*
- ตรวจสอบคุณภาพงานสี
- ถ้าไม่ผ่าน → **Return** กลับ `0040`
- พนักงานที่แสดง: **รวม** จาก station `0040` + `0049`

#### 6. `0050` Fix Cooling
- ซ่อม/เปลี่ยนระบบทำความเย็น

#### 7. `0060` Assembly Part
- ประกอบชิ้นส่วนกลับเข้าเครื่อง

#### 8. `0070` Test
- ทดสอบการทำงานของเครื่อง
- มี Checklist ย่อย (iframe embed)

#### 9. `0079` QC ทดสอบ *(station แทรก)*
- ตรวจสอบผลการทดสอบ
- ถ้าไม่ผ่าน → **Return** กลับ `0070`
- พนักงานที่แสดง: **รวม** จาก station `0070` + `0079`

#### 10. `0080` QC Packing (Final)
- ตรวจสอบขั้นสุดท้ายก่อนจัดส่ง
- ถ้าผ่าน → **Completed** (ปิดงาน)
- ถ้าไม่ผ่าน → **Return** กลับ station ก่อนหน้า

---

## Action ที่ทำได้ในแต่ละ Station

| Action | API | คำอธิบาย |
|---|---|---|
| **Start** | `POST /WorkOrderList/Start` | เริ่มทำงาน (บันทึก start time) |
| **Finish** | `POST /WorkOrderList/Finish` | เสร็จงาน station นี้ (ส่งต่อ station ถัดไป) |
| **Completed** | `POST /WorkOrderList/Completed` + `POST /Mobile/SetCheckOutCloseType` | ปิดงาน (ปกติ / ไม่ปกติ) |
| **Return** | `POST /WorkOrderList/Return` + `POST /WorkOrderList/RemarkReturn` | ส่งงานกลับ station ก่อนหน้า |
| **QC Return** | `POST /WorkOrderList/QcReturn` + `POST /WorkOrderList/RemarkReturn` | QC ส่งงานคืน station ที่ทำงาน |
| **Remark** | `POST /WorkOrderList/RemarkStop` | บันทึกหมายเหตุ (Delay / Waiting Part / Rework) |

---

## Flow พิเศษ

### Return (ส่งกลับ)
งานสามารถถูกส่งกลับ station ก่อนหน้าได้ โดย:
1. ดึง station ที่เคยผ่านมาจาก `GET /WorkOrderList/ReturnStation`
2. เลือก station ปลายทาง + เหตุผล (Delay / Waiting Part / Rework)
3. ส่ง `POST /WorkOrderList/Return` + `POST /WorkOrderList/RemarkReturn`

### QC Return
เหมือน Return แต่ใช้ `POST /WorkOrderList/QcReturn` (สำหรับ station QC 0049, 0079, 0080)

### Defect (`0000`)
- งานที่มีปัญหาจะถูกส่งไป station `0000`
- แสดงใน **Defect Dashboard** (`/DefectDashboard`)
- ใน Defect Dashboard มีปุ่ม:
  - **Approve** → `POST /WorkOrderList/approve/{orderId}` → ปิดงาน
  - **Not Approve** → `POST /WorkOrderList/notApprove/{orderId}` → ส่งกลับแก้ไข

---

## Mapping Station พิเศษ → Station หลัก

```typescript
const specialStationMap = {
  "0049": "0040",  // QC สี → Color
  "0079": "0070",  // QC ทดสอบ → Test
  "0089": "0080",  // (สำรอง) → QC Packing
};
```

ใช้สำหรับ:
- ดึงพนักงานร่วมจาก station หลัก + station พิเศษ
- Normalize station ก่อน Return/QC Return
