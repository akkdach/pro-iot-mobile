# Use Case: QC Dashboard (DashboardQC)

## ภาพรวม
หน้า QC Dashboard ใช้สำหรับแสดงรายการ Work Order ที่ต้องตรวจสอบคุณภาพ (QC) แยกตาม Station โดยผู้ใช้สามารถกรอง ค้นหา และเปิดรายละเอียดเพื่อทำงาน QC ได้

---

## Actors
| Actor | คำอธิบาย |
|-------|----------|
| ผู้ตรวจสอบ QC | พนักงานที่รับผิดชอบตรวจสอบคุณภาพ |

---

## Use Case 1: ดูรายการ QC ทั้งหมด

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | ดูรายการ QC ทั้งหมด |
| **Actor** | ผู้ตรวจสอบ QC |
| **วัตถุประสงค์** | ดูภาพรวมรายการ Work Order ที่ต้อง QC พร้อม KPI แยกตาม Station |
| **Pre-condition** | ผู้ใช้เข้าสู่ระบบแล้ว |
| **Post-condition** | แสดงรายการ Work Order + KPI Card (QC สี, QC ทดสอบ, QC final) |

### Main Flow
1. ผู้ใช้เปิดหน้า QC Dashboard
2. ระบบดึงข้อมูลจาก API `/WorkOrderList/Qc_Check`
3. ระบบคำนวณ KPI แยกตาม Station (0049 QC สี, 0079 QC ทดสอบ, 0080 QC final)
4. ระบบแสดง KPI Card 3 ใบ + รายการ Work Order แบบ Card พร้อม Pagination

### Alternative Flow
- **ไม่มีข้อมูล**: แสดงข้อความ "ไม่พบรายการ"
- **API Error**: แสดงรายการว่าง

---

## Use Case 2: กรองตาม Station

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | กรองตาม Station |
| **Actor** | ผู้ตรวจสอบ QC |
| **วัตถุประสงค์** | แสดงเฉพาะรายการ Work Order ของ Station ที่ต้องการ |
| **Pre-condition** | มีข้อมูล Work Order แสดงอยู่ |
| **Post-condition** | แสดงเฉพาะรายการของ Station ที่เลือก |

### Main Flow
1. ผู้ใช้คลิก KPI Card ของ Station ที่ต้องการ (QC สี / QC ทดสอบ / QC final)
2. ระบบกรองรายการเฉพาะ Station นั้น (0049 / 0079 / 0080)
3. ระบบแสดงผลลัพธ์ที่กรองแล้ว

### Alternative Flow
- **คลิก Card ซ้ำ**: ยกเลิกการกรอง แสดงทั้งหมด

---

## Use Case 3: ค้นหาและเรียงลำดับ

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | ค้นหาและเรียงลำดับ |
| **Actor** | ผู้ตรวจสอบ QC |
| **วัตถุประสงค์** | ค้นหา Work Order ที่ต้องการ หรือเรียงลำดับรายการ |
| **Pre-condition** | มีข้อมูล Work Order แสดงอยู่ |
| **Post-condition** | แสดงผลลัพธ์ตามเงื่อนไขที่กำหนด |

### Main Flow
1. ผู้ใช้พิมพ์คำค้นหา (order / station / description / equipment)
2. ระบบกรองรายการที่ตรงกับคำค้นหา (client-side)
3. ผู้ใช้เลือกวิธีเรียงลำดับ (Updated desc / SLA / OrderId)
4. ระบบเรียงลำดับผลลัพธ์ตามที่เลือก

---

## Use Case 4: เปิดรายละเอียดเพื่อตรวจ QC

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | เปิดรายละเอียดเพื่อตรวจ QC |
| **Actor** | ผู้ตรวจสอบ QC |
| **วัตถุประสงค์** | เข้าหน้า WorkStation เพื่อดำเนินการตรวจ QC |
| **Pre-condition** | มี Work Order ที่ต้องการตรวจ |
| **Post-condition** | นำทางไปหน้า WorkStation ของ Work Order นั้น |

### Main Flow
1. ผู้ใช้กดปุ่ม "Open" ที่ Card ของ Work Order
2. ระบบนำทางไปหน้า `/WorkStation/{orderId}/{operationId}`
3. แสดงหน้า WorkStation สำหรับดำเนินงาน QC

---

## Use Case 5: รีเฟรชข้อมูล

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | รีเฟรชข้อมูล |
| **Actor** | ผู้ตรวจสอบ QC |
| **วัตถุประสงค์** | โหลดข้อมูลล่าสุดจากระบบ |
| **Pre-condition** | อยู่ในหน้า QC Dashboard |
| **Post-condition** | แสดงข้อมูลที่อัปเดตล่าสุด |

### Main Flow
1. ผู้ใช้กดปุ่ม Refresh หรือ Icon Refresh
2. ระบบดึงข้อมูลจาก API `/WorkOrderList/Qc_Check` ใหม่
3. ระบบอัปเดตรายการ + KPI ด้วยข้อมูลล่าสุด
