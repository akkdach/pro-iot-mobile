# Checklist สิทธิ์และการเข้าถึง (Access Prerequisites) ก่อนขึ้นระบบจริง (Go-Live) - Refurbish System

เอกสารนี้ระบุรายการ "สิทธิ์การเข้าถึง (Access & Permissions)" และการเตรียมความพร้อมทางด้านข้อมูลระบบเครือข่าย ที่ต้องเตรียมและตรวจสอบให้พร้อมก่อนนำระบบ Refurbish ขึ้นใช้งานจริงบนสภาพแวดล้อม **Production**

---

## 1. สิทธิ์การเข้าถึงระดับผู้ใช้และแอปพลิเคชัน (Application & User Access)
- [ ] **Data Mapping User Accounts:** บัญชีผู้ปฏิบัติงานที่จะใช้งานระบบ (เช่น Inspector, ช่างสี, QA) ต้องถูกเพิ่มในระบบ Production และผูกเข้ากับ `Personnel Number` อย่างถูกต้อง เพื่อให้ข้อมูลใน `EmployeeMultiSelectModal` รันได้
- [ ] **Role-Based Access Control (RBAC):** ตรวจสอบสิทธิ์การเข้าถึง Station:
  - ผู้ใช้ที่มีสิทธิ์เข้า Station หลัก (เช่น `0050`) จะต้องมีสิทธิ์ทำเชื่อมโยงเข้าไปทำ Station พิเศษ (เช่น `0059`) โดยไม่โดน Block URL
- [ ] **Cross-Component Authentication (Iframe):** การฝังหน้าต่าง `ChecklistEmbed` ต้องตั้งค่า `checklistToken` แนบไปส่งใน Header/Cookie อย่างปลอดภัย และเช็คว่าเบราว์เซอร์เป้าหมาย (เช่น Chrome บน Tablet) ไม่ได้เปิดบล็อก Third-Party Cookies จนทำให้ Session หลุด
- [ ] **Session Expiry Policy:** ยืนยันการตั้งค่าอายุ Session (Token Life Time) หาก Token ตาย ระบบต้องเตะ Logout ออกมาหน้าแรกทันทีโดยไม่สร้าง Network Error ค้างอยู่ในระบบ

## 2. สิทธิ์ฝั่งโปรแกรมหลังบ้านและเซิร์ฟเวอร์ (Database, API, & File Storage)
- [ ] **Firewall & API Whitelisting:** ฝั่ง Production API Server จะต้องเปิดรับ `Incoming Traffic` เฉพาะจาก IP ของเครื่องหน้างาน หรือวง Network ภายในโรงงาน (VPN/VLAN)
- [ ] **CORS Configuration (Cross-Origin):** การยิง API เช่น `/WorkOrderList/*` และ `/Mobile/*` ต้องถูกระบุ Header: `Access-Control-Allow-Origin` ครอบคลุม URL ฝั่ง Frontend และอณุญาต Method `GET, POST, OPTIONS` ครบถ้วน
- [ ] **File Storage Read/Write Access:** Directory หรือ Cloud Bucket ฝั่งรัน Backend จะต้องเปิดสิทธิ์ `CHMOD 775` (หรือ IAM Role สำหรับ Cloud) ให้เขียนรูปภาพใหม่จากโฟลเดอร์ `ImgBox` และสิทธิ์ อ่านภาพ Master จาก `MasterWorkorderImage`
- [ ] **Database Connection Pool:** แอคเคานต์ SQL/Database ที่ใช้รันหลังบ้านต้องปรับ Max Connection รับโหลดจำนวนมาก ตอน Go-Live เผื่อเปิดใช้หลายสถานีพร้อมกัน

## 3. สิทธิ์การเชื่อมโยงระบบหลัก Microsoft Dynamics F&O (Integration Access)
- [ ] **Service Accounts / API Gateway:** บัญชีตัวกลาง (Middleware Client Secret) ที่ยิงหา Dynamics F&O ต้องถูกสวิตช์เป็นรหัสฝั่ง Production Environment ไม่ใช่ร่างจำลอง Sandbox
- [ ] **สิทธิ์จัดการ Master Data (Read Access):** ต้องมีสิทธิ์ดึงข้อมูล 2 ตัวหลักได้ตลอดเวลา:
  - โหลดแค็ตตาล็อกอะไหล่ ➡️ `/Mobile/GetMaterialMaster`
  - ค้นหาต้นทุนซ่อมเพื่อประเมิน Auto-Approve ➡️ `/WorkOrderList/Price/{orderId}` 
- [ ] **สิทธิ์จัดการ Transfer Order (Write / Post Access):**
  - อนุญาตให้สร้างใบเบิก (`ReservationRequest_create`) ไป **ตัดชิ้นส่วนอะไหล่ที่ Locator คลัง `1FL1` ได้**
  - อนุญาตให้เรียก API ยืนยัน Auto-Approve รายการ (`ReservationRequest_approve`) ได้ทันทีโดยไม่ติดสิทธิ์ User ทั่วไป
- [ ] **สิทธิ์แก้ไขตัวบิล Work Order แม่:** อนุญาตให้ Middleware สั่งเปลี่ยนหมวดหมู่การซ่อม (เช่น แปลงโค้ดเป็น `MJ1`, `MI1` ผ่านหน้า `/WorkOrderList/SaveChangeType`) และสามารถลงเวลา Actual Finish สู่ F&O ตอนกดจบงาน (Complete) ได้อย่างสมบูรณ์

## 4. โครงข่าย อุปกรณ์ฮาร์ดแวร์ และระดับ Physical (Hardware & Firewall)
- [ ] **Hardware Browser WebRTC Permission:** สิทธิ์การใช้งานกล้องใน Tablet เครื่องโรงงาน จะต้องถูกกด Allow (Always Permitted) สำหรับโดเมนเว็บล่วงหน้า เพื่อไม่ให้กล้องเด้งถามทุกครั้งที่ใช้ `UploadPicture.tsx` / `CameraCaptureFile`
- [ ] **Device Sync & Cache Processing:** เคลียร์ Cache ของเครื่องทดสอบเก่าทั้งหมด การรัน Production ครั้งแรกควรแน่ใจว่าไม่มี Storage (เช่น Local Storage ชุดเก่าจาก UAT) หลงเหลือคาอยู่ในอุปกรณ์
- [ ] **Network Stability / Wi-Fi Access Points:** จุดที่ติดตั้ง Tablet เช่น หน้าเตาสี หรือโซนประกอบ ต้องมีสัญญาณเน็ตเวิร์กที่ยิง IP ทะลุเข้าหา Server ได้สม่ำเสมอ หลีกเลี่ยงสัญญาณหลุดตอนส่งรูปหนักๆ

## 5. สิทธิ์ทีมระบบเบื้องหลังและแผนฉุกเฉิน (Admin & Fallback Operations)
- [ ] **Exception / Override Access:** หัวหน้าไลน์ผลิตหรือ Admin สามารถล็อคอินเข้าเพื่อแก้ไขสิ่งที่พนักงานทั่วไปทำผิดพลาด เช่น ย้อนกลับสถานะ (Undo Work Order) เคลียร์รายการที่กดเบิ้ล (Debounce Fail) 
- [ ] **Logging & Monitoring View:** ทีมโปรแกรมเมอร์และทีม Support ต้องได้รับสิทธิ์เข้าถึง Kibana / Splunk / Server Console ของ Production ได้ทันทีในวันแรกๆ เพื่องมหา Log กรณีระบบชนกับ Dynamics F&O แล้วพ่น Error Code ประหลาดออกมา
