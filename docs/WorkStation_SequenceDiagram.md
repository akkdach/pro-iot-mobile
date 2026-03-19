# WorkStation - Sequence Diagram (ภาพรวม)

## 1. เปิดหน้า WorkStation (Page Load)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>WS: เปิดหน้า WorkStation (orderId, operationId)
    WS->>API: ดึงข้อมูล Spare Part, Work Order, รูปภาพ, พนักงาน, Checklist
    API->>DB: Query ข้อมูลทั้งหมด
    DB-->>API: ส่งข้อมูลกลับ
    API-->>WS: ข้อมูล Work Order + Spare Part + รูปภาพ + พนักงาน + Checklist
    WS-->>U: แสดงหน้า WorkStation พร้อมข้อมูล
```

---

## 2. เริ่มงาน (Start Work)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>WS: กดปุ่ม Start
    WS->>U: แสดง Modal เลือกพนักงาน
    U->>WS: เลือกพนักงานและยืนยัน
    WS->>API: บันทึกพนักงาน (POST /WorkOrderList/Employee)
    API->>DB: บันทึกข้อมูลพนักงาน
    DB-->>API: ยืนยันการบันทึก
    WS->>API: เริ่มงาน (POST /WorkOrderList/Start)
    API->>DB: อัปเดตสถานะเริ่มงาน
    DB-->>API: ยืนยันการอัปเดต
    API-->>WS: ข้อมูลเวลาเริ่มงาน
    WS-->>U: แสดงสถานะ "กำลังทำงาน" + เริ่มนับเวลา
```

---

## 3. จบงาน (Finish Work)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>WS: กดปุ่ม Finish
    WS->>U: ยืนยันการจบงาน
    U->>WS: ยืนยัน
    WS->>API: จบงาน (POST /WorkOrderList/Finish) + ส่ง Checked Code
    API->>DB: อัปเดตสถานะจบงาน + บันทึก Checklist
    DB-->>API: ยืนยันการอัปเดต
    API-->>WS: ข้อมูลเวลาจบงาน
    WS-->>U: แสดงผลสำเร็จ + กลับหน้าก่อนหน้า
```

---

## 4. ปิดงานสมบูรณ์ (Completed / Close Work)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>WS: กดปุ่ม Completed
    WS->>U: เลือกโหมด (ปกติ / ไม่ปกติ)
    U->>WS: เลือกโหมด + ยืนยัน
    WS->>API: ส่งข้อมูลปิดงาน (POST /Mobile/SetCheckOutCloseType)
    API->>DB: บันทึกประเภทการปิดงาน
    DB-->>API: ยืนยันการบันทึก
    API-->>WS: ผลลัพธ์
    WS-->>U: แสดงผลสำเร็จ
```

---

## 5. ส่งงานกลับ (Return Work)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>WS: กดปุ่ม Return
    WS->>API: ดึง Station ที่สามารถส่งกลับได้ (GET /WorkOrderList/ReturnStation)
    API-->>WS: รายการ Station
    WS->>U: แสดงรายการ Station ให้เลือก + เหตุผล
    U->>WS: เลือก Station + เหตุผล + ยืนยัน
    WS->>API: ส่งกลับ (POST /WorkOrderList/Return + /WorkOrderList/RemarkReturn)
    API->>DB: อัปเดต Station + บันทึก Remark
    DB-->>API: ยืนยัน
    API-->>WS: ผลลัพธ์
    WS-->>U: แสดงผลสำเร็จ
```

---

## 6. จัดการอะไหล่ (Spare Part)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>WS: แก้ไขจำนวน / ลบอะไหล่
    WS->>API: อัปเดตอะไหล่ (POST /Mobile/SetWorkOrderSparePart)
    API->>DB: บันทึกข้อมูลอะไหล่
    DB-->>API: ยืนยัน
    API-->>WS: ผลลัพธ์
    WS-->>U: แสดงข้อมูลอะไหล่ที่อัปเดตแล้ว
```

---

## 7. อัปโหลดรูปภาพ (Upload Image)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>WS: เลือกรูปภาพตาม Master Template
    U->>WS: กดปุ่ม "บันทึกรูปภาพทั้งหมด"
    WS->>API: อัปโหลดรูปภาพทีละรูป (Upload Image API)
    API->>DB: บันทึกรูปภาพ
    DB-->>API: ยืนยัน
    API-->>WS: ผลลัพธ์
    WS-->>U: แสดงผลสำเร็จ (จำนวนที่อัปโหลดสำเร็จ)
```

---

## 8. เปิด Checklist (Station 0010, 0030, 0070)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant WS as ระบบ WorkStation
    participant CL as Service Checklist
    participant API as Backend API

    U->>WS: กดปุ่ม Check List
    WS->>CL: ขอ Token (POST /api/v1/checklist/token)
    CL-->>WS: Token
    WS->>U: เปิดหน้า Checklist (iframe พร้อม Token)
    U->>WS: กรอก Checklist + บันทึก
    WS->>API: บันทึก Checklist
    API-->>WS: ยืนยัน
    WS-->>U: แสดงผลสำเร็จ
```
