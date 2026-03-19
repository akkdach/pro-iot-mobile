# Use Case Document: AddSpareFromStock

---

## Use Case 1: โหลดรายการ Work Center

**Use Case ID:** UC-ASS-001

**Use Case Name:** โหลดรายการ Work Center (Storage Location)

**Actor:** ระบบ (System)

**Purpose:** เพื่อโหลดรายการ Work Center ที่มีสต็อกอะไหล่ สำหรับให้ผู้ใช้งานเลือกก่อนดูรายการอะไหล่

**Pre-Conditions:**
- ผู้ใช้งานเข้าสู่ระบบแล้ว
- ผู้ใช้งานมีสิทธิ์เข้าถึงหน้า AddSpareFromStock

**Post-Conditions:**
- ระบบแสดง Dropdown ของ Work Center ให้เลือก

**Main Flow:**
1. ผู้ใช้งานเข้าหน้า AddSpareFromStock
2. ระบบเรียก `GET /Mobile/TranferRequestTo_ddl` เพื่อโหลดรายการ Work Center
3. ระบบแสดง Work Center ใน Dropdown (TextField select)

**Alternate Condition:**
1. หาก API ตอบกลับเป็น null → ระบบใช้ค่า default (3FL1, NRTT222, NRTW152, Test123)

---

## Use Case 2: เลือก Work Center และโหลดรายการอะไหล่

**Use Case ID:** UC-ASS-002

**Use Case Name:** เลือก Work Center เพื่อดูรายการอะไหล่ในสต็อก

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อโหลดรายการอะไหล่ที่มีในสต็อกของ Work Center ที่เลือก

**Pre-Conditions:**
- Dropdown Work Center แสดงรายการแล้ว

**Post-Conditions:**
- ระบบแสดงรายการอะไหล่ของ Work Center ที่เลือก พร้อมข้อมูล Material, Description, Stock, สถานะค้างเบิก

**Main Flow:**
1. ผู้ใช้งานเลือก Work Center จาก Dropdown
2. ระบบเรียก `GET /Mobile/TranferRequestSparepartList?stge_loc={selectedWC}&material_type=`
3. ระบบแสดงรายการอะไหล่ในรายการ โดยแต่ละรายการแสดง:
   - Material (รหัสอะไหล่)
   - Material Description
   - Stock (จำนวนคงเหลือ)
   - สถานะค้างเบิก (Yes/No)

**Alternate Condition:**
1. หากไม่ได้เลือก Work Center → ระบบไม่เรียก API (ข้ามไป)
2. หากเกิด error → ระบบแสดง "โหลดรายการอะไหล่ไม่สำเร็จ" และแสดงรายการว่าง

---

## Use Case 3: ค้นหาอะไหล่

**Use Case ID:** UC-ASS-003

**Use Case Name:** ค้นหาอะไหล่จาก Material หรือ Description

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานค้นหาอะไหล่ที่ต้องการจากรายการที่โหลดมา

**Pre-Conditions:**
- ระบบโหลดรายการอะไหล่สำเร็จแล้ว
- Dialog เลือกอะไหล่เปิดอยู่

**Post-Conditions:**
- รายการอะไหล่ถูกกรองตาม keyword ที่พิมพ์

**Main Flow:**
1. ผู้ใช้งานพิมพ์ keyword ในช่อง "ค้นหา Material / Description..."
2. ระบบกรองข้อมูลแบบ client-side (useMemo: filteredSpareParts)
3. รายการอัปเดตทันทีตาม keyword

**Alternate Condition:**
1. หากไม่พิมพ์อะไร → แสดงรายการทั้งหมด
2. หากไม่พบรายการ → แสดง "ไม่พบรายการอะไหล่"

---

## Use Case 4: เลือกอะไหล่ใส่ตะกร้า

**Use Case ID:** UC-ASS-004

**Use Case Name:** เลือกอะไหล่และปรับจำนวนในตะกร้า

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานเลือกอะไหล่ที่ต้องการและกำหนดจำนวนก่อนบันทึก

**Pre-Conditions:**
- มีรายการอะไหล่แสดงอยู่ใน Dialog
- อะไหล่ที่ต้องการมี Stock > 0 (ไม่ out of stock)

**Post-Conditions:**
- อะไหล่ถูกเพิ่มในตะกร้า (cart) พร้อมจำนวนที่กำหนด
- Cart summary อัปเดตจำนวนรายการและจำนวนชิ้นรวม

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "เลือก" ที่รายการอะไหล่
2. ระบบเพิ่มอะไหล่เข้า cart (qty = 1)
3. ปุ่ม "เลือก" เปลี่ยนเป็น controls +/- และช่องใส่จำนวน
4. ผู้ใช้งานปรับจำนวนด้วย:
   - กดปุ่ม "+" เพิ่ม 1 (สูงสุดไม่เกิน stock)
   - กดปุ่ม "-" ลด 1 (ต่ำสุด = 0 → ลบออกจาก cart)
   - พิมพ์ตัวเลขโดยตรง (clamp: 1 ≤ qty ≤ stock)
5. Cart summary ด้านบนแสดง: จำนวนรายการ, จำนวนชิ้นรวม, และ preview 3 รายการแรก

**Alternate Condition:**
1. หากอะไหล่ out of stock (znew ≤ 0) → ปุ่ม "เลือก" เป็น disabled
2. หากกด "-" จนจำนวนเป็น 0 → ลบอะไหล่ออกจาก cart
3. หากกดปุ่ม "ลบ" → ลบอะไหล่ออกจาก cart ทันที
4. หากกด "ล้างทั้งหมด" → ล้าง cart ทั้งหมด

---

## Use Case 5: บันทึกรายการเบิกอะไหล่

**Use Case ID:** UC-ASS-005

**Use Case Name:** บันทึกรายการเบิกอะไหล่ (Save)

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อบันทึกรายการอะไหล่ที่เลือกไว้เป็นคำขอเบิก (Reservation Request)

**Pre-Conditions:**
- มีอะไหล่ในตะกร้าอย่างน้อย 1 รายการ

**Post-Conditions:**
- ระบบบันทึกคำขอเบิกอะไหล่สำเร็จ
- ตะกร้าถูกล้าง
- Dialog ปิด

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "Save" ใน Dialog
2. ระบบปิด Dialog
3. ระบบแสดง popup ยืนยัน "ยืนยันการบันทึก?" พร้อมแสดงจำนวนรายการและจำนวนชิ้น
4. ผู้ใช้งานกด "ยืนยัน"
5. ระบบแสดง Loading "กำลังบันทึก..."
6. ระบบเรียก `POST /Mobile/ReservationRequest_create` พร้อม payload:
   - stge_loc: Work Center ที่เลือก
   - material_type: "" (ว่าง)
   - items: รายการอะไหล่ [{ material, quantity, description }]
7. หากสำเร็จ → แสดง "บันทึกสำเร็จ" และล้างตะกร้า

**Alternate Condition:**
1. หากผู้ใช้งานกด "ยกเลิก" ใน popup ยืนยัน → ไม่บันทึก (กลับหน้าเดิม)
2. หากตะกร้าว่าง → ปุ่ม "Save" เป็น disabled
3. หากเกิด error → แสดง "บันทึกไม่สำเร็จ เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล"

---

## Use Case 6: เปิด/ปิด Dialog เลือกอะไหล่

**Use Case ID:** UC-ASS-006

**Use Case Name:** เปิดและปิด Dialog เลือกอะไหล่

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อเปิด Dialog สำหรับเลือกอะไหล่จากสต็อก หรือปิดเมื่อเสร็จ

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่หน้า AddSpareFromStock

**Post-Conditions:**
- Dialog เปิดหรือปิดตามการกระทำของผู้ใช้

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "เลือกอะไหล่" ที่หน้าหลัก
2. ระบบเปิด Dialog (fullWidth, maxWidth="md") แสดง:
   - ช่องค้นหา
   - Dropdown Work Center
   - Cart summary
   - รายการอะไหล่

**Alternate Condition:**
1. หากผู้ใช้งานกดปุ่ม "ปิด" → ปิด Dialog (ข้อมูลใน cart ยังคงอยู่)
2. หากผู้ใช้งานกดนอก Dialog → ปิด Dialog
