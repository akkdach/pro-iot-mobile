# TableSparePart - Sequence Diagram (ภาพรวม)

## 1. เปิดหน้า Spare Part (โหลดข้อมูล)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant SP as ระบบ TableSparePart
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>SP: เปิดหน้า TableSparePart (orderId)
    SP->>API: ดึงอะไหล่ในคลัง (GET /Mobile/RemainingSparepart)
    API->>DB: Query รายการอะไหล่ทั้งหมด
    DB-->>API: ส่งข้อมูลกลับ
    SP->>API: ดึงอะไหล่เดิมของ Work Order (GET /WorkOrderList/items_component/{orderId})
    API->>DB: Query อะไหล่ที่เคยเลือกไว้
    DB-->>API: ส่งข้อมูลกลับ
    API-->>SP: รายการอะไหล่ในคลัง + อะไหล่เดิม
    SP-->>U: แสดงรายการอะไหล่ปัจจุบัน + ตะกร้า
```

---

## 2. เพิ่มอะไหล่จากคลัง

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant SP as ระบบ TableSparePart

    U->>SP: กดปุ่ม "เพิ่มอะไหล่"
    SP-->>U: แสดง Dialog รายการอะไหล่ในคลัง
    U->>SP: เลือกอะไหล่ + กำหนดจำนวน
    SP-->>U: อัปเดตตะกร้า (แสดงจำนวนรายการ + ชิ้น)
```

---

## 3. บันทึกรายการอะไหล่ทั้งหมด

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant SP as ระบบ TableSparePart
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>SP: กดปุ่ม "บันทึก"
    SP->>U: ยืนยันการบันทึก
    U->>SP: ยืนยัน
    SP->>API: บันทึกอะไหล่ทั้งหมด (POST /Mobile/SetWorkOrderSparePart)
    API->>DB: บันทึก/อัปเดตรายการอะไหล่
    DB-->>API: ยืนยันการบันทึก
    API-->>SP: ผลลัพธ์
    SP->>API: โหลดข้อมูลใหม่
    API-->>SP: รายการอะไหล่ที่อัปเดตแล้ว
    SP-->>U: แสดงผลสำเร็จ + ตารางที่อัปเดต
```

---

## 4. แก้ไขจำนวนอะไหล่

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant SP as ระบบ TableSparePart
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>SP: กดปุ่ม Edit (แก้ไข) ที่รายการอะไหล่
    SP-->>U: แสดง Dialog แก้ไขจำนวน
    U->>SP: กรอกจำนวนใหม่ + ยืนยัน
    SP->>API: บันทึกจำนวนใหม่ (POST /Mobile/SetWorkOrderSparePart)
    API->>DB: อัปเดตจำนวนอะไหล่
    DB-->>API: ยืนยัน
    API-->>SP: ผลลัพธ์
    SP-->>U: แสดงผลสำเร็จ + โหลดข้อมูลใหม่
```

---

## 5. ลบรายการอะไหล่

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant SP as ระบบ TableSparePart
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>SP: กดปุ่ม Delete (ลบ) ที่รายการอะไหล่
    SP->>API: ลบรายการอะไหล่ (Delete API)
    API->>DB: ลบข้อมูลอะไหล่
    DB-->>API: ยืนยันการลบ
    API-->>SP: ผลลัพธ์
    SP->>API: โหลดข้อมูลใหม่
    API-->>SP: รายการอะไหล่ที่อัปเดตแล้ว
    SP-->>U: แสดงตารางที่อัปเดต
```
