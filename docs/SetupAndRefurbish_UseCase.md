# Use Case Document: SetupAndRefurbish

---

## Use Case 1: แสดงหน้าเมนู Station

**Use Case ID:** UC-SR-001

**Use Case Name:** แสดงหน้าเมนู Setup / Refurbish

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานเห็นรายการ Station ทั้งหมดในระบบ Setup / Refurbish และเลือกเข้าไปทำงานในแต่ละ Station ได้

**Pre-Conditions:**
- ผู้ใช้งานต้องเข้าสู่ระบบแล้ว
- ผู้ใช้งานต้องมีสิทธิ์เข้าถึงเมนู Setup / Refurbish

**Post-Conditions:**
- ระบบแสดงหน้า Menu พร้อม Hex button 10 รายการ แบ่งเป็น 2 แถว

**Main Flow:**
1. ผู้ใช้งานเข้าถึงหน้า SetupAndRefurbish
2. ระบบแสดง Header "SETUP / REFURBISH"
3. ระบบแสดง Hex button 10 รายการ แบ่งเป็น 2 แถว (สลับบน-ล่าง):
   - แถวบน: Work Order List, Inspector (0010), Clean (0030), Fix Cooling (0050), Test (0070)
   - แถวล่าง: Stock Report, Remove Part (0020), Color (0040), Assembly Part (0060), QC Packing (0080)
4. แต่ละ Hex button แสดง icon และชื่อ Station

**Alternate Condition:**
1. ไม่มี — หน้านี้ไม่มีการเรียก API จึงไม่มี error case

---

## Use Case 2: เลือก Station เพื่อเข้าทำงาน

**Use Case ID:** UC-SR-002

**Use Case Name:** เลือก Station เพื่อเข้าหน้า Dashboard

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานสามารถเลือก Station ที่ต้องการเข้าไปทำงาน แล้วนำทางไปหน้า Dashboard ของ Station นั้น

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่หน้า SetupAndRefurbish
- ระบบแสดง Hex button ครบทุก Station แล้ว

**Post-Conditions:**
- ระบบนำทางไปหน้า DashboardRefurbish พร้อมข้อมูล Station ที่เลือก (id, title, icon, station code)

**Main Flow:**
1. ผู้ใช้งานกดที่ Hex button ของ Station ที่ต้องการ (เช่น Inspector, Clean, Test เป็นต้น)
2. ระบบรับค่า step data ของ Station ที่เลือก ประกอบด้วย:
   - `id` — หมายเลข Station
   - `title` — ชื่อ Station
   - `icon` — รูป icon
   - `station` — รหัส Station (เช่น "0010", "0020", ...)
3. ระบบเรียก `navigate("/DashboardRefurbish", { state: step })` เพื่อนำทางไปหน้า Dashboard
4. หน้า DashboardRefurbish รับข้อมูล Station จาก `location.state` และแสดงผลตาม Station ที่เลือก

**Alternate Condition:**
1. หากผู้ใช้งานเลือก "Work Order List" (id: 0, type: workOrderList) → ระบบนำทางไป Dashboard ในโหมด Work Order List (ไม่มี station code)
2. หากผู้ใช้งานเลือก "Stock Report" (id: 0.1, type: stockReport) → ระบบนำทางไป Dashboard ในโหมด Stock Report (ไม่มี station code)

---

## Use Case 3: เข้าสู่ระบบผ่าน Dialog

**Use Case ID:** UC-SR-003

**Use Case Name:** เข้าสู่ระบบ (Login Dialog)

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานสามารถระบุรหัสพนักงานและเลือกประเภทงานก่อนเข้าใช้งาน Station

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่หน้า SetupAndRefurbish
- ระบบเปิด Login Dialog ขึ้นมา (ผ่าน handleClickOpen)

**Post-Conditions:**
- ผู้ใช้งานกรอกข้อมูลที่จำเป็นและเข้าสู่ระบบสำเร็จ หรือยกเลิกการเข้าสู่ระบบ

**Main Flow:**
1. ระบบแสดง Dialog "เข้าสู่ระบบ"
2. ผู้ใช้งานกรอกรหัสพนักงานในช่อง "ใส่รหัสพนักงาน" (จำกัดความยาว 10 ตัวอักษร)
3. ผู้ใช้งานเลือกประเภทงาน (Work) จาก Dropdown:
   - Hello
   - World
   - Margin
4. ผู้ใช้งานกดปุ่ม "เข้าสู่ระบบ"
5. ระบบเรียก handleSubmit เพื่อประมวลผล (ปัจจุบันยังไม่มี logic เพิ่มเติม — เป็น placeholder)

**Alternate Condition:**
1. หากผู้ใช้งานกดปุ่ม "ยกเลิก" → ระบบปิด Dialog กลับไปหน้า Menu
2. หากผู้ใช้งานกดนอก Dialog → ระบบปิด Dialog (onClose)
3. หากผู้ใช้งานไม่กรอกรหัสพนักงาน → ฟิลด์เป็น required (แต่ปัจจุบัน handleSubmit ยังไม่มี validation)

---

> **หมายเหตุ:** Use Case ที่ 3 (Login Dialog) ปัจจุบันยังไม่ถูกเรียกใช้งานจริงจาก UI — ไม่มี button ที่ trigger `handleClickOpen()` โดยตรง และ `handleSubmit` ยังเป็น placeholder ว่างเปล่า อาจเป็น feature ที่ยังพัฒนาไม่เสร็จ
