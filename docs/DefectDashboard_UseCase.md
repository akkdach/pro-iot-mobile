# Use Case: Defect Dashboard (DefectDashboard)

## ภาพรวม
หน้า Defect Dashboard ใช้สำหรับแสดงรายการ Work Order ที่มี Defect (Station 0000) โดยผู้ใช้สามารถค้นหา เรียงลำดับ ดูรายละเอียด อนุมัติ หรือส่งกลับแก้ไข (Rework) ได้

---

## Actors
| Actor | คำอธิบาย |
|-------|----------|
| ผู้ดูแลระบบ / หัวหน้างาน | ผู้มีสิทธิ์ตรวจสอบและจัดการรายการ Defect |

---

## Use Case 1: ดูรายการ Defect ทั้งหมด

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | ดูรายการ Defect ทั้งหมด |
| **Actor** | ผู้ดูแลระบบ |
| **วัตถุประสงค์** | ดูภาพรวมรายการ Work Order ที่มี Defect |
| **Pre-condition** | ผู้ใช้เข้าสู่ระบบแล้ว |
| **Post-condition** | แสดง Summary Card (จำนวน Defect ทั้งหมด) + รายการ Work Order |

### Main Flow
1. ผู้ใช้เปิดหน้า Defect Dashboard
2. ระบบดึงข้อมูลจาก API `/WorkOrderList/Defect`
3. ระบบกรองเฉพาะรายการที่อยู่ Station 0000
4. ระบบแสดง Summary Card (จำนวนรวม) + รายการ Work Order แบบ Card พร้อม Pagination

### Alternative Flow
- **ไม่มีข้อมูล**: แสดงข้อความ "ไม่พบรายการ"
- **API Error**: แสดงรายการว่าง

---

## Use Case 2: ค้นหาและเรียงลำดับ

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | ค้นหาและเรียงลำดับ |
| **Actor** | ผู้ดูแลระบบ |
| **วัตถุประสงค์** | ค้นหา Work Order ที่ต้องการจากรายการ Defect |
| **Pre-condition** | มีข้อมูล Work Order แสดงอยู่ |
| **Post-condition** | แสดงผลลัพธ์ตามเงื่อนไขที่กำหนด |

### Main Flow
1. ผู้ใช้พิมพ์คำค้นหา (order / station / description / equipment)
2. ระบบกรองรายการที่ตรงกับคำค้นหา (client-side)
3. ผู้ใช้เลือกวิธีเรียงลำดับ (Updated desc / SLA / OrderId)
4. ระบบเรียงลำดับและแสดงผลลัพธ์

---

## Use Case 3: ดูรายละเอียด Work Order

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | ดูรายละเอียด Work Order |
| **Actor** | ผู้ดูแลระบบ |
| **วัตถุประสงค์** | เปิดดูรายละเอียดของ Work Order ที่มี Defect |
| **Pre-condition** | มี Work Order ที่ต้องการดู |
| **Post-condition** | นำทางไปหน้ารายละเอียด |

### Main Flow
1. ผู้ใช้กดปุ่ม "Open" ที่ Card ของ Work Order
2. ระบบนำทางไปหน้า `/DetailEachOrder/{orderId}/{operationId}`
3. แสดงหน้ารายละเอียด Work Order

---

## Use Case 4: อนุมัติ Work Order (Approve)

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | อนุมัติ Work Order |
| **Actor** | ผู้ดูแลระบบ |
| **วัตถุประสงค์** | อนุมัติ Work Order ที่ผ่านการตรวจสอบแล้ว |
| **Pre-condition** | มี Work Order ที่พร้อมอนุมัติ |
| **Post-condition** | Work Order ถูกอนุมัติ + รายการอัปเดต |

### Main Flow
1. ผู้ใช้กดปุ่ม "Approve" ที่ Card ของ Work Order
2. ระบบเรียก API `POST /WorkOrderList/approve/{orderId}`
3. ระบบโหลดข้อมูลใหม่
4. แสดงรายการที่อัปเดตแล้ว

### Alternative Flow
- **API Error**: แสดง error ใน console

---

## Use Case 5: ส่งกลับแก้ไข (Rework / Not Approve)

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | ส่งกลับแก้ไข |
| **Actor** | ผู้ดูแลระบบ |
| **วัตถุประสงค์** | ไม่อนุมัติและส่ง Work Order กลับไปแก้ไข |
| **Pre-condition** | มี Work Order ที่ไม่ผ่านการตรวจสอบ |
| **Post-condition** | Work Order ถูกส่งกลับแก้ไข + รายการอัปเดต |

### Main Flow
1. ผู้ใช้กดปุ่ม "Rework" ที่ Card ของ Work Order
2. ระบบเรียก API `POST /WorkOrderList/notApprove/{orderId}`
3. ระบบโหลดข้อมูลใหม่
4. แสดงรายการที่อัปเดตแล้ว

### Alternative Flow
- **API Error**: แสดง error ใน console

---

## Use Case 6: รีเฟรชข้อมูล

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อ Use Case** | รีเฟรชข้อมูล |
| **Actor** | ผู้ดูแลระบบ |
| **วัตถุประสงค์** | โหลดข้อมูลล่าสุดจากระบบ |
| **Pre-condition** | อยู่ในหน้า Defect Dashboard |
| **Post-condition** | แสดงข้อมูลที่อัปเดตล่าสุด |

### Main Flow
1. ผู้ใช้กดปุ่ม Refresh
2. ระบบดึงข้อมูลจาก API `/WorkOrderList/Defect` ใหม่
3. ระบบอัปเดตรายการ + Summary Card ด้วยข้อมูลล่าสุด
