# Use Case Document: DashboardRefurbish

---

## Use Case 1: โหลดรายการ Work Order ตาม Station

**Use Case ID:** UC-DR-001

**Use Case Name:** โหลดรายการ Work Order ตาม Station ที่เลือก

**Actor:** ระบบ (System)

**Purpose:** เพื่อโหลดรายการ Work Order ที่เกี่ยวข้องกับ Station ที่ผู้ใช้เลือกจากหน้า SetupAndRefurbish

**Pre-Conditions:**
- ผู้ใช้งานเลือก Station จากหน้า SetupAndRefurbish แล้ว
- ระบบได้รับ step data (id, title, station, type) จาก location.state

**Post-Conditions:**
- ระบบแสดงตาราง Work Order ของ Station ที่เลือก

**Main Flow:**
1. ระบบตรวจสอบ step.station และ step.type:
   - ถ้า station = null และ type = "workOrderList" → เรียก `GET /WorkOrderList/workOrderList` (รายการทั้งหมด)
   - ถ้า station = null และ type = "stockReport" → navigate ไปหน้า `/StockReport` ทันที
   - ถ้ามี station (เช่น "0010", "0020") → เรียก `GET /WorkOrderList/workOrderList/{station}`
2. ระบบแสดงตาราง (MaterialReactTable) ประกอบด้วยคอลัมน์:
   - SLA Timer, Work Order, Order Type, Production Start Date, Equipment, Start Date, Finish Date, Description
3. ตารางแสดง 30 รายการต่อหน้า

**Alternate Condition:**
1. หาก API ตอบกลับเป็น null → ระบบแสดงตารางว่าง
2. หากเข้ามาแบบ type = "stockReport" → ระบบ redirect ไปหน้า StockReport ทันที (ไม่แสดงตาราง)

---

## Use Case 2: กรองรายการตาม SLA Status

**Use Case ID:** UC-DR-002

**Use Case Name:** กรองรายการ Work Order ตามสถานะ SLA

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานกรองรายการตามสถานะ SLA (เขียว/เหลือง/แดง) เพื่อจัดลำดับความสำคัญ

**Pre-Conditions:**
- ระบบโหลดรายการ Work Order สำเร็จแล้ว

**Post-Conditions:**
- ตารางแสดงเฉพาะรายการที่ตรงกับ SLA Status ที่เลือก

**Main Flow:**
1. ผู้ใช้งานเลือก SLA Status จาก Dropdown:
   - 🟢 เวลาเหลือเยอะ (เหลือ > 31%)
   - 🟡 ใกล้ถึงเวลา (เหลือ ≤ 31%)
   - 🔴 เลย SLA (เลยเวลาแล้ว)
2. ระบบกรองข้อมูลแบบ client-side (useMemo) โดยคำนวณ SLA status จาก:
   - slA_START_DATE / slA_START_TIME
   - slA_FINISH_DATE / slA_FINISH_TIME
3. ตารางอัปเดตทันที

**Alternate Condition:**
1. หากเลือก "ทั้งหมด" → แสดงรายการทั้งหมด
2. หากไม่มี SLA data → status = "none" (ไม่แสดงในกลุ่มสีใดๆ)

---

## Use Case 3: เข้าดูรายละเอียด Work Order (WorkStation)

**Use Case ID:** UC-DR-003

**Use Case Name:** คลิกแถวเพื่อเข้าหน้า WorkStation

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อนำทางไปหน้า WorkStation สำหรับทำงานกับ Work Order ที่เลือก

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่หน้า Dashboard ที่มี station (ไม่ใช่ workOrderList mode)
- มีรายการ Work Order ในตาราง

**Post-Conditions:**
- ระบบนำทางไปหน้า /WorkStation/{orderId}/{operationId} พร้อม station data

**Main Flow:**
1. ผู้ใช้งานคลิกที่แถว Work Order ในตาราง
2. ระบบเรียก navigate พร้อมส่ง state:
   - current_operation: operation ปัจจุบัน
   - title: ชื่อ Station (เช่น "Inspector", "Clean")
   - station: รหัส Station (เช่น "0010", "0030")
3. แสดงหน้า WorkStation พร้อมข้อมูล Work Order

**Alternate Condition:**
1. หากอยู่ในโหมด workOrderList (step.station = null) → คลิกแถวไม่ทำอะไร (cursor เป็น default)

---

## Use Case 4: จ่ายงาน (Start Work Order) แบบ Batch

**Use Case ID:** UC-DR-004

**Use Case Name:** จ่ายงาน Work Order หลายรายการพร้อมกัน

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานเลือก Work Order หลายรายการแล้วจ่ายงาน (Start) พร้อมกัน

**Pre-Conditions:**
- ผู้ใช้งานอยู่ในโหมด workOrderList (step.type = "workOrderList")
- ปุ่ม "จ่ายงาน" และ Checkbox เลือกแถวแสดงอยู่
- ตาราง group by Production Start Date (default)

**Post-Conditions:**
- Work Order ที่เลือกถูก Start สำเร็จ
- ตารางโหลดข้อมูลใหม่
- Checkbox ถูก reset ทั้งหมด

**Main Flow:**
1. ผู้ใช้งานติ๊ก Checkbox เลือก Work Order ที่ต้องการจ่ายงาน (เลือกได้หลายรายการ)
2. ผู้ใช้งานกดปุ่ม "จ่ายงาน"
3. ระบบแสดง popup ยืนยัน "คุณต้องการจ่ายงานจำนวน N รายการใช่หรือไม่?"
4. ผู้ใช้งานกด "ยืนยัน"
5. ระบบแสดง Loading "กำลังดำเนินการ..."
6. ระบบวนลูปเรียก `POST /WorkOrderList/StartWorkOrder` ทีละรายการ:
   - Payload: { ORDERID: orderid }
7. นับจำนวนสำเร็จ/ล้มเหลว
8. Reset Checkbox และโหลดข้อมูลใหม่ (onLoad)
9. แสดงสรุป "จ่ายงานสำเร็จ X รายการ"

**Alternate Condition:**
1. หากไม่ได้เลือกรายการใดเลย → แสดง warning "กรุณาเลือกรายการที่ต้องการจ่ายงานอย่างน้อย 1 รายการ"
2. หากผู้ใช้งานกด "ยกเลิก" ใน popup ยืนยัน → ไม่จ่ายงาน
3. หากบางรายการ Start ไม่สำเร็จ → แสดง warning "จ่ายงานสำเร็จ X รายการ, ล้มเหลว Y รายการ"
4. ปุ่ม "จ่ายงาน" แสดงเฉพาะในโหมด workOrderList เท่านั้น

---

## Use Case 5: ค้นหา Work Order

**Use Case ID:** UC-DR-005

**Use Case Name:** ค้นหา Work Order จาก Global Search

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อค้นหา Work Order จากข้อมูลทุกคอลัมน์ในตาราง

**Pre-Conditions:**
- ระบบโหลดรายการ Work Order สำเร็จแล้ว

**Post-Conditions:**
- ตารางแสดงเฉพาะรายการที่ตรงกับ keyword

**Main Flow:**
1. ผู้ใช้งานพิมพ์ keyword ในช่อง "ค้นหา Work Order..." (Global Filter ของ MaterialReactTable)
2. ระบบกรองทุกคอลัมน์ตาม keyword
3. ตารางอัปเดตทันที

**Alternate Condition:**
1. หากไม่พิมพ์อะไร → แสดงรายการทั้งหมด
