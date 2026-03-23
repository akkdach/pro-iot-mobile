# DefectDashboard - Sequence Diagram (ภาพรวม)

## 1. เปิดหน้า Defect Dashboard (โหลดข้อมูล)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DD as ระบบ Refurbish System
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>DD: เปิดหน้า Defect Dashboard
    DD->>API: ดึงรายการ Defect
    API->>DB: Query Work Order ที่มี Defect
    DB-->>API: ส่งข้อมูลกลับ
    API-->>DD: รายการ Work Order
    DD-->>U: แสดง Summary Card + รายการ Defect Order
```

---

## 2. ค้นหาและเรียงลำดับ

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DD as ระบบ Refurbish System

    U->>DD: ค้นหา (order / station / desc / equipment) หรือเปลี่ยน Sort
    DD->>DD: กรอง + เรียงลำดับจากข้อมูลที่โหลดไว้
    DD-->>U: แสดงผลลัพธ์ที่กรองแล้ว + Pagination
```

---

## 3. เปิดรายละเอียด Work Order

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DD as ระบบ Refurbish System
    participant Detail as หน้า DetailEachOrder

    U->>DD: กดปุ่ม "Open" ที่ Card รายการ
    DD->>Detail: นำทางไป /DetailEachOrder/{orderId}/{operationId}
    Detail-->>U: แสดงหน้ารายละเอียด Work Order
```

---

## 4. อนุมัติ (Approve)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DD as ระบบ Refurbish System
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>DD: กดปุ่ม Approve ที่ Card รายการ
    DD->>API: อนุมัติ Work Order   
    API->>DB: อัปเดตสถานะอนุมัติ
    DB-->>API: ยืนยัน
    API-->>DD: ผลลัพธ์
    DD->>API: โหลดข้อมูลใหม่
    API-->>DD: รายการที่อัปเดตแล้ว
    DD-->>U: แสดงรายการที่อัปเดต
```

---

## 5. ส่งกลับแก้ไข (Rework / Not Approve)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DD as ระบบ Refurbish System
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>DD: กดปุ่ม Rework ที่ Card รายการ
    DD->>API: ไม่อนุมัติ 
    API->>DB: อัปเดตสถานะส่งกลับแก้ไข
    DB-->>API: ยืนยัน
    API-->>DD: ผลลัพธ์
    DD->>API: โหลดข้อมูลใหม่
    API-->>DD: รายการที่อัปเดตแล้ว
    DD-->>U: แสดงรายการที่อัปเดต
```
