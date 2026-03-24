# DashboardQC - Sequence Diagram (ภาพรวม)

## 1. เปิดหน้า QC Dashboard (โหลดข้อมูล)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant QC as ระบบ Refurbish System
    participant API as Backend API
    participant DB as ฐานข้อมูล

    U->>QC: เปิดหน้า QC Dashboard
    QC->>API: ดึงรายการ QC
    API->>DB: Query Work Order ที่ต้อง QC
    DB-->>API: ส่งข้อมูลกลับ
    API-->>QC: รายการ Work Order (Station Color, Test)
    QC-->>U: แสดง Card แยกตาม Station + รายการ QC
```

---

## 2. กรองตาม Station (KPI Card)

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant QC as ระบบ Refurbish System

    U->>QC: คลิก KPI Card (QC สี / QC ทดสอบ / QC final)
    QC->>QC: กรองรายการตาม Station ที่เลือก (0049 / 0079 / 0080)
    QC-->>U: แสดงเฉพาะรายการของ Station นั้น
```

---

## 3. ค้นหาและเรียงลำดับ

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant QC as ระบบ Refurbish System

    U->>QC: ค้นหา (order / station / desc / equipment) หรือเปลี่ยน Sort
    QC->>QC: กรอง + เรียงลำดับจากข้อมูลที่โหลดไว้
    QC-->>U: แสดงผลลัพธ์ที่กรองแล้ว + Pagination
```

---

## 4. เปิดรายละเอียด Work Order เพื่อตรวจ QC

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant QC as ระบบ Refurbish System
    participant WS as หน้า WorkStation

    U->>QC: กดปุ่ม "Open" ที่ Card รายการ
    QC->>WS: นำทางไป หน้าทำงาน
    WS-->>U: แสดงหน้า WorkStation สำหรับตรวจ QC
```
