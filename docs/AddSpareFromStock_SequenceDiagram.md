# AddSpareFromStock - Sequence Diagram (ภาพรวม)

## 1. เปิดหน้า + โหลดข้อมูล Work Center

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant AS as ระบบ AddSpareFromStock
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>AS: เปิดหน้า AddSpareFromStock
    AS->>API: ดึงรายการ Work Center (GET /Mobile/TranferRequestTo_ddl)
    API->>DB: Query รายการ Work Center
    DB-->>API: ส่งข้อมูลกลับ
    API-->>AS: รายการ Work Center
    AS-->>U: แสดงหน้าพร้อม Dropdown Work Center
```

---

## 2. เลือก Work Center → โหลดอะไหล่ในสต็อก

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant AS as ระบบ AddSpareFromStock
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>AS: เลือก Work Center
    AS->>API: ดึงอะไหล่ตาม Work Center (GET /Mobile/TranferRequestSparepartList)
    API->>DB: Query อะไหล่ที่มีในสต็อก
    DB-->>API: ส่งข้อมูลกลับ
    API-->>AS: รายการอะไหล่ + จำนวนสต็อก
    AS-->>U: แสดงรายการอะไหล่พร้อมสต็อกคงเหลือ
```

---

## 3. เลือกอะไหล่ใส่ตะกร้า

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant AS as ระบบ AddSpareFromStock

    U->>AS: กดปุ่ม "เลือกอะไหล่" → เปิด Dialog
    U->>AS: เลือกอะไหล่ + กำหนดจำนวน (+/-)
    AS-->>U: อัปเดตตะกร้า (จำนวนรายการ + ชิ้น)
    U->>AS: ค้นหาอะไหล่ (Material / Description)
    AS->>AS: กรองรายการจากข้อมูลที่โหลดไว้
    AS-->>U: แสดงผลลัพธ์ที่กรองแล้ว
```

---

## 4. บันทึกคำขอเบิกอะไหล่ (Reservation Request)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant AS as ระบบ AddSpareFromStock
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>AS: กดปุ่ม Save
    AS->>U: ยืนยันการบันทึก (จำนวนรายการ + ชิ้น)
    U->>AS: ยืนยัน
    AS->>API: สร้างคำขอเบิก (POST /Mobile/ReservationRequest_create)
    API->>DB: บันทึกคำขอเบิกอะไหล่
    DB-->>API: ยืนยันการบันทึก
    API-->>AS: ผลลัพธ์
    AS-->>U: แสดงผลสำเร็จ + ล้างตะกร้า
```
