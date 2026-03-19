# DashboardRefurbish - Sequence Diagram (ภาพรวม)

## 1. เปิดหน้า Dashboard (โหลดข้อมูล Work Order)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DB_UI as ระบบ Dashboard
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>DB_UI: เปิดหน้า Dashboard (เลือก Station หรือ Work Order List)
    alt เข้าจาก Station (เช่น 0010, 0020, ...)
        DB_UI->>API: ดึง Work Order ตาม Station (GET /WorkOrderList/workOrderList/{station})
    else เข้าจาก Work Order List (ไม่มี Station)
        DB_UI->>API: ดึง Work Order ทั้งหมด (GET /WorkOrderList/workOrderList)
    end
    API->>DB: Query รายการ Work Order
    DB-->>API: ส่งข้อมูลกลับ
    API-->>DB_UI: รายการ Work Order + SLA + สถานะ
    DB_UI-->>U: แสดงตาราง Work Order พร้อม SLA Timer
```

---

## 2. ค้นหาและกรอง Work Order

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DB_UI as ระบบ Dashboard

    U->>DB_UI: ค้นหา Work Order / กรอง SLA Status (🟢🟡🔴)
    DB_UI->>DB_UI: กรองข้อมูลจากรายการที่โหลดไว้แล้ว
    DB_UI-->>U: แสดงผลลัพธ์ที่กรองแล้ว
```

---

## 3. เลือก Work Order เพื่อเข้าหน้า WorkStation

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DB_UI as ระบบ Dashboard
    participant WS as หน้า WorkStation

    U->>DB_UI: คลิกเลือกแถว Work Order
    DB_UI->>WS: นำทางไป /WorkStation/{orderId}/{operationId}
    WS-->>U: แสดงหน้า WorkStation ของ Work Order ที่เลือก
```

---

## 4. จ่ายงาน (Dispatch Work Orders) — เฉพาะโหมด Work Order List

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant DB_UI as ระบบ Dashboard
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>DB_UI: เลือก Work Order หลายรายการ (Checkbox)
    U->>DB_UI: กดปุ่ม "จ่ายงาน"
    DB_UI->>U: ยืนยันการจ่ายงาน (จำนวน N รายการ)
    U->>DB_UI: ยืนยัน
    loop ทีละ Work Order
        DB_UI->>API: จ่ายงาน (POST /WorkOrderList/StartWorkOrder)
        API->>DB: อัปเดตสถานะ Work Order
        DB-->>API: ยืนยัน
    end
    API-->>DB_UI: ผลลัพธ์ (สำเร็จ / ล้มเหลว)
    DB_UI->>API: โหลดข้อมูลใหม่
    API-->>DB_UI: รายการ Work Order ที่อัปเดตแล้ว
    DB_UI-->>U: แสดงผลสำเร็จ + ตารางที่อัปเดต
```
