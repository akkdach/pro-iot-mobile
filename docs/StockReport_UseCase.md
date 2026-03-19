# Use Case Document: StockReport

---

## Use Case 1: ดูรายงานสต็อก

**Use Case ID:** UC-STK-001

**Use Case Name:** ดูรายงานสต็อก / Movement Log

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานดูรายการเคลื่อนไหวสต็อก (Movement Log) ทั้งหมดพร้อม KPI สรุป

**Pre-Conditions:**
- ผู้ใช้งานเข้าสู่ระบบแล้ว
- ผู้ใช้งานมีสิทธิ์เข้าถึงหน้า Stock Report

**Post-Conditions:**
- ระบบแสดงตารางรายการสต็อกพร้อม KPI (จำนวนรายการ, จำนวน Work Center, ช่วงวันที่)

**Main Flow:**
1. ผู้ใช้งานเข้าหน้า StockReport
2. ระบบเรียก `GET /WorkOrderList/stockReport` เพื่อโหลดข้อมูลทั้งหมด
3. ระบบแสดง KPI 3 ตัว: จำนวนรายการ, จำนวน Work Center, ช่วงวันที่
4. ระบบแสดงตาราง (MaterialReactTable) ประกอบด้วยคอลัมน์:
   - ID, วันที่/เวลา, Work Center, Plant, Reservation No, สถานะการอนุมัติ, ผู้อนุมัติ, วันที่อนุมัติ
5. ตารางเรียงตามวันที่ล่าสุดก่อน (desc) และแสดง 30 รายการต่อหน้า

**Alternate Condition:**
1. หากเรียก API ไม่สำเร็จ → ระบบแสดงตารางว่าง
2. หากไม่มีข้อมูล → ตารางแสดง "ไม่พบข้อมูล"

---

## Use Case 2: กรองข้อมูลสต็อก

**Use Case ID:** UC-STK-002

**Use Case Name:** กรองข้อมูลด้วย Keyword, Work Center, Plant

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานค้นหาและกรองรายการสต็อกตามเงื่อนไขต่างๆ

**Pre-Conditions:**
- ระบบโหลดข้อมูลสต็อกสำเร็จแล้ว

**Post-Conditions:**
- ตารางแสดงเฉพาะรายการที่ตรงตามเงื่อนไข
- KPI อัปเดตตามข้อมูลที่กรองแล้ว

**Main Flow:**
1. ผู้ใช้งานกรอก keyword ในช่องค้นหา (ค้นหาจาก ID, Work Center, Plant, Material Type, Order ID)
2. และ/หรือ เลือก Work Center จาก Dropdown (ตัวเลือกดึงจากข้อมูลจริง)
3. และ/หรือ เลือก Plant จาก Dropdown (ตัวเลือกดึงจากข้อมูลจริง)
4. ระบบกรองข้อมูลแบบ client-side ทันที (useMemo)
5. ตารางและ KPI อัปเดตตามผลการกรอง

**Alternate Condition:**
1. หากไม่ได้เลือกตัวกรองใดๆ → แสดงข้อมูลทั้งหมด
2. หากไม่พบข้อมูลที่ตรงเงื่อนไข → ตารางแสดง "ไม่พบข้อมูล"

---

## Use Case 3: ดูรายละเอียดรายการ (Double Click)

**Use Case ID:** UC-STK-003

**Use Case Name:** ดูรายละเอียดรายการผ่าน Dialog

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อดูข้อมูลรายละเอียดของรายการสต็อกแต่ละรายการอย่างรวดเร็ว

**Pre-Conditions:**
- มีข้อมูลในตาราง

**Post-Conditions:**
- ระบบแสดง Dialog รายละเอียดของรายการที่เลือก

**Main Flow:**
1. ผู้ใช้งาน double-click ที่แถวในตาราง
2. ระบบเปิด Dialog "รายละเอียดรายการ" แสดง:
   - ID, Work Center, Material Type
   - วันที่บันทึก, Order ID
   - ข้อมูล Work Center: Plant, Description, Start/Finish/Break Time

**Alternate Condition:**
1. หากผู้ใช้งานกดปิด Dialog → กลับไปหน้าตาราง

---

## Use Case 4: นำทางไปหน้ารายละเอียด (StockReportItem)

**Use Case ID:** UC-STK-004

**Use Case Name:** เปิดหน้ารายละเอียดรายการสต็อก

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อนำทางไปหน้า StockReportItem สำหรับดูข้อมูลเชิงลึกของรายการนั้นๆ

**Pre-Conditions:**
- มีข้อมูลในตาราง

**Post-Conditions:**
- ระบบนำทางไปหน้า /StockReportItem/{reS_ID}

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "รายละเอียด" (ไอคอน Info) ที่คอลัมน์ Action ของแถว
2. ระบบเรียก `navigate(/StockReportItem/{reS_ID})`
3. แสดงหน้า StockReportItem พร้อมข้อมูลเชิงลึก

**Alternate Condition:**
- ไม่มี

---

## Use Case 5: เพิ่มรายการเบิกอะไหล่จากสต็อก

**Use Case ID:** UC-STK-005

**Use Case Name:** นำทางไปหน้าเพิ่มรายการ (AddSpareFromStock)

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อนำทางไปหน้า AddSpareFromStock สำหรับเลือกอะไหล่จากสต็อกเข้ามาเป็นรายการใหม่

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่หน้า StockReport

**Post-Conditions:**
- ระบบนำทางไปหน้า /AddSpareFromStock

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "เพิ่มรายการ" (มุมซ้ายบนของตาราง)
2. ระบบเรียก `navigate("/AddSpareFromStock")`
3. แสดงหน้า AddSpareFromStock

**Alternate Condition:**
- ไม่มี
