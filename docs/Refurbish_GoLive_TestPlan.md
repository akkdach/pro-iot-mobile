# แผนการทดสอบก่อนขึ้นระบบจริง (Go-Live Testing Plan) - Refurbish System (Detailed Version)

เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้เป็น Checklist กำหนดจุดประสงค์และขอบเขตการทดสอบอย่างละเอียด โดยเจาะลึกไปที่ 3 Module หลัก ได้แก่ **WorkStation (ระบบปฏิบัติงาน)**, **Defect (หน้าจัดการของเสีย)** และ **QC (ตรวจสอบคุณภาพ)**

---

## 1. Module: WorkStation (ระบบปฏิบัติงานแบบเจาะลึก 100%)

**1.1 การเข้าถึงระบบ (Routing & Fetch Data)**
- [ ] **การนำทางจาก Dashboard:** คลิกรายการแล้วตรวจสอบ `URL` ว่าเปลี่ยนไปที่ `/WorkStation/{orderId}/{operationId}` พร้อมข้อมูล `row state`
- [ ] **Refresh Resilience:** ทดสอบการกด `F5` หน้าเพจ ข้อมูลออเดอร์ต้องถูก Fetch ใหม่จาก `/WorkOrderList/workOrder/` และไม่เกิดจอขาว/พัง

**1.2 การจัดการทีมงานและสถานี (Employee & Station Selector)**
- [ ] **การดึงสมาชิก Station หลัก/รอง:** ดึง Member ทีม ตรวจสอบโลจิก `getParentStation` กรณี Station พิเศษ (เช่น `0059` ต้องดึงพนักงานรวมจาก `0050` และ `0059` มาโชว์ได้)
- [ ] **Employee Modal:** กรณีรายการใหม่ที่ `ACTUAL_START_DATE` ว่างเปล่า ระบบต้องบังคับเด้ง `EmployeeMultiSelectModal` เพื่อกดมอบหมายพนักงานก่อนเริ่ม
- [ ] **API กำหนดคนทำงาน:** กดยืนยันแล้ว API ปลายทาง `/WorkOrderList/Employee/{id}` ทำงานผ่าน อัปเดตรายชื่อคนรับผิดชอบ

**1.3 ระบบภาพถ่ายและ Diagram (Image Capture & Mapping)**
- [ ] **ภาพอ้างอิง (Master Image Mapping):** ดึงภาพ Diagram โครงสร้างจาก `GetMasterWorkorderImage` 
- [ ] **เปรียบเทียบภาพจริง (`ImgBox`):** นำโค้ด Key พิเศษ (เช่น `image_pull_condensor_evap` Map เข้ากับ `image_speed_condensor_evap`) มาจับคู่กล่องรูปให้ตรงกันเป๊ะ
- [ ] **การอัปโหลดไฟล์/ถ่ายรูป (`UploadPicture`):** ทดสอบปุ่มเลือกรูปจากเครื่อง / ถ่ายจากตัวกล้องตรงๆ และ Preview รูปภาพ (URL Preview) ก่อนกดส่ง (FormData) ว่ารันปกติ

**1.4 ระบบจำลองนาฬิกาและสถิติเวลา (Timers & SLA Engine)**
- [ ] **Resume State (งานค้าง):** ถ้าหากข้อมูลมี `ACT_START_DATE` เข้ามา แต่ยังไม่ระบุ `ACT_END_DATE` (ทำงานค้างไว้) ปุ่มกดต้องกลายเป็น Resume (กำลังทำ) อัตโนมัติ โดยไม่ต้องให้ User เด้งเลือก Employee อีกรอบ 
- [ ] **CountTime / ElapsedTimer:** ทดสอบกดลูกศร Start และ Pause ต้องเช็คว่าค่ารวม `accumulatedMs` ไม่หลุดลอย เมื่อเปลี่ยนแท็บออกและกลับมาใหม่ยังนับอย่างแม่นยำ

**1.5 เช็กลิสต์ย่อยและ Iframe Data Binding (`ChecklistEmbed`)**
- [ ] **การจัดการ Token:** ก่อนยิง Iframe ต้องแน่ใจว่า `checklistToken` ถูกแนบไปอย่างปลอดภัย
- [ ] **ลอจิกเฉพาะ Station 0020 (Inspector):** รายการรหัสเช็กลิสต์ย่อย (0020->0090) ฝ่าย Inspector ต้องสามารถติ๊ก Checkbox เมนูพิเศษได้อย่างอิสระ ในขณะที่ Station อื่นจะถูกติ๊กตาม Backend ลงมาเท่านั้น (`checkedCodes`)

**1.6 การเบิกอะไหล่ซ่อม (Spare Parts Management & BomTab)**
- [ ] **ข้อมูลชื่ออะไหล่ชดเชย (Fallback Names):** ถ้า Data อะไหล่ไม่มีชื่อ `MatlDesc` ให้เช็คว่าระบบไปงัดชื่อมาจาก `GetMaterialMaster` มาเติมให้อัตโนมัติหรือยัง
- [ ] **กรณีขอเพิ่ม/ลบจำนวนชิ้นไหล่เปล่า (Edit QTY & Delta):**
  - กดไอคอนดินสอปรับเพิ่ม QTY ถ้าปรับจำนวน **"เพิ่ม" (Delta > 0)** ระบบต้องเด้งหน้าต่าง Warning `"สร้าง Transfer Order?"` 
  - เมื่อกดยอมรับ ระบบต้องยิง API `ReservationRequest_create` สั่งคลังเบิกชิ้นส่วนโดยอัตโนมัติ 
  - ทดสอบกดปุ่มถังขยะและรัน Alert ลบรายการสำเร็จ

**1.7 การคำนวณและประเมิน (Cost & Repair Remarks)**
- [ ] **การโชว์ราคา Cost:** ยิงเข้าเช็คลิสต์ `/WorkOrderList/Price/{orderId}` จะต้องโชว์ เปอร์เซ็นต์ความเสียหาย (`repair_cost_percent`) ทันที
- [ ] **บันทึก Remark (ช่อง Note):** กรอกตัวหนังสือลงปุ่ม Notes และบันทึกข้อมูลย้อนหลัง

**1.8 การควบคุมจบกระบวนการ (Close Work)**
- [ ] **กด ปิดงาน / Finish:** การกดส่งจะต้องเช็คว่าระบบตรวจสอบฟิลด์ต่างๆ (เช่น เช็กลิสต์ใน IFrame ทำครบหรือยัง)
- [ ] **API ปิดบิลลุล่วง:** รับ Respond กลับว่าสำเร็จหน้าจอ Navigate เด้งกลับไปสู่ Dashboard หลักเรียบร้อย

---

## 2. Module: Defect (ระบบจัดการของเสียและชำรุด)

**2.1 หน้า Defect Dashboard (`DefectDashboard.tsx`)**
- [ ] **Filter Station `0000` (Defects):** ตัว Dashboard ของ Defect จะต้องกรองข้อมูลหลุดมาเฉพาะ Work Order ที่ตกไปอยู่ `current_operation: 0000`
- [ ] **KPI Summary Card:** ยอดรวมแจ้งเตือน Defect ด้านบนซ้ายสีแดง ต้องตรงกับผลรวม List งานที่มีทั้งหมดจริง
- [ ] **การค้นหา & การเรียงลำดับ:** ทดสอบ Sort เรียงลำดับตาม Updated, SLA, หรือ OrderID และค้นหากล่องข้อความทำงานถูกต้อง

**2.2 การเข้าจัดการสถานะ Defect List**
- [ ] **การประเมินอนุมัติผ่าน (Approve):** กดปุ่ม Approve บนการ์ด -> ระบบเรียก API `/WorkOrderList/approve/{orderid}` -> มี Alert ยืนยัน "Yes, Approve" ติดเขียว และรายการหายไป
- [ ] **การประเมินตีกลับ (Not Approve / Rework):** กดปุ่ม Not Approve บนการ์ด -> ระบบเรียก API `/WorkOrderList/notApprove/{orderid}` ติด Alert สีแดงยืนยันตีกลับ

**2.3 ข้อมูลเชิงลึก Defect (`DetailEachOrder.tsx`)**
- [ ] **เช็ครายละเอียดรวม:** แถบข้อมูล Order Type, Equipment ตรงปก
- [ ] **SLA & Timeline:** เวลา Actual Start, Actual Finish ยืนยันตรงกับฐานข้อมูล และ `SlaTimer` โชว์กำหนดการ
- [ ] **ตาราง Spare Parts:** ถ้ารายการ Defect นั้นมีการใช้อะไหล่ ต้องแสดงในตารางเบิกวัสดุ (Material No,  Quantity, Unit) ครบถ้วน
- [ ] **Images Documents:** ทดสอบดึงภาพจากฐานข้อมูล `MasterWorkorderImage` มาจับคู่ขนานกับรูปภาพภายใน `ImgBox` ระบบขึ้นโชว์รูปสำเร็จ และหากกดเปิดรูป ต้องเด้งแท็บลิงก์อย่างถูกต้อง ไม่ติด 404

---

## 3. Module: QC (ระบบตรวจสอบคุณภาพ)

**3.1 หน้า QC Dashboard (`DashboardQC.tsx`)**
- [ ] **KPI Filter Tabs ย่อย:**
  - `Station 0059`: งาน QC สี
  - `Station 0089`: งาน QC ทดสอบ
  - `Station 0090`: งาน QC Final
  - **ทดสอบ:** คลิกการ์ดแต่ละใบ ขอบจะเปลี่ยนสี (ส้ม ฟ้า ม่วง) ข้อมูลในกล่องลิสต์ล่างจะต้อง Filter ออกมาตรงตามการ์ดที่กด
- [ ] **KPI Metric Count:** จำนวนงานรวม Completed, InProgress, Pending ต้องเปลี่ยนแบบ Dynamic ตามข้อมูลในตาราง

**3.2 ระบบ Todo List การเข้าทำ QC**
- [ ] **กดเข้าไปทำ QC (`onOpen`):** ที่ Todo Card เมื่อกดปุ่มทำ QC ระบบจะต้องพา `Navigate` ไปที่แท็บระบบ `/WorkStation/{orderId}/{operationId}` พร้อมข้อมูล State ที่ติดตัวไปด้วย เพื่อเปิดหน้าต่าง ChecklistQC สำหรับกรอกข้อมูลสอบตก/ผ่าน

---

## 4. ระบบเบิกอะไหล่ และ BOM Integration (F&O / ERP Sync)
- [ ] **การเลือกประเภทการซ่อม (Repair Type Mapping):** ทดสอบการเลือกประเภท (เช่น Major A1, Minor A1) ซึ่งะแปลเป็นรหัส `MJ1`, `MI1` เพื่อใช้เป็นพารามิเตอร์ส่งไปถามข้อมูล BOM จากหลังบ้าน
- [ ] **การดึง BOM จากระบบ (`fetchBom`):** เมื่อกด "ดึง BOM" ระบบต้องเรียกข้อมูล Standard Service Code จากฐานข้อมูล F&O / ERP กลับมาลิสต์รายการอะไหล่มาตรฐานประจำประเภทการซ่อมนั้นได้แม่นยำ
- [ ] **การบันทึกชิ้นส่วน (Save BOM to Work Order):** ทดสอบการกดบันทึกให้ยิง API `/Mobile/SetWorkOrderSparePart` เพื่ออัปเดต Data กลับไปผูกที่ฝั่งข้อมูล Order นั้นๆ (พร้อมกับยิง `/WorkOrderList/SaveChangeType` แจ้งการเปลี่ยน Type ของออเดอร์)
- [ ] **การสร้าง Transfer Order (TO) ติดต่อคลัง:** เมื่อรายการมีจำนวนให้เบิก (Delta > 0) ตรวจสอบว่าระบบส่ง API `/Mobile/ReservationRequest_create` สั่งคลัง (Locator: 1FL1) ให้สร้าง TO และได้รับค่า Response การสร้างสำเร็จมา

## 5. ระบบประเมินต้นทุนการซ่อมและอนุมัติอัตโนมัติ (Cost & Auto-Approve)
- [ ] **การดึง Cost Analysis:** ก่อนระบบจะทำการสร้าง TO จนเสร็จ ระบบต้องไปเช็ค API `/WorkOrderList/Price/{orderId}` เพื่อดูสัดส่วนเปอร์เซ็นต์ราคาซ่อม (%)
- [ ] **Flow: อนุมัติอัตโนมัติตามเปอร์เซ็นต์ความเสียหาย (Repair %):**
  - **เคส ซ่อมคุ้มค่า (Repair Cost ≤ 50%):** ถือว่าปกติ ระบบทำการข้ามการ Approve ชั้นที่ 2 ปล่อยบิล TO ขึ้นสถานะสร้างสำเร็จ
  - **เคส ซ่อมเสี่ยง (Repair Cost > 50%):** สั่งการให้อนุมัติอัตโนมัติผ่านโค้ด โดยส่งลูป API `/WorkOrderList/ApproveTO_data` เพื่อดึงรหัส Request ทั้งหมด ตามด้วยการสั่ง `/Mobile/ReservationRequest_approve/{resId}` ทีละคิวจนสำเร็จทั้งหมด
  - หากระบบ Approve พัง ต้องขึ้นแจ้งเตือน "สร้าง TO สำเร็จ แต่อนุมัติไม่สำเร็จ กรุณาไปอนุมัติที่หน้า TO History"

## 6. การปิดจบกระบวนการและโยน Data กลับระบบคอร์หลัก (Complete & Dynamics F&O)
- [ ] **กด ปิดงานสะสางบิล (`FinishWork` / `CloseWorkMaster`):** เมื่อกดปิดงาน ระบบเช็ค Validation (เช่น กรอกฟอร์ม Checklist หมดหรือยัง) เมื่อผ่าน จะยิง API แจ้งจบงานและประทับตราเวลา Actual End Time 
- [ ] **การตรวจสอบ Flow ของ F&O Integration:** 
  - เช็คที่ UI ของ Refurbish ว่าสถานะ (Web Status) เป็น "Finish" 
  - นำรหัส Work Order นี้ไป **ตรวจสอบบนระบบ ERP F&O** ว่ายอดของเสีย, ลิสต์อะไหล่ที่เปลี่ยน (BOM), สถานะ Complete, และเวลาการปฏิบัติงาน (`Service Time` ในหน้าเว็บ) ถูก Submit เข้าไปบันทึกลงในระบบ ERP ครบทุก Field อย่างสมบูรณ์แบบโดยไม่ค้างกระดาน (Middleware Queue)
- [ ] **การแสดงผลย้อนหลัง (TO History):** สามารถกดกลับเข้าไปดู `TransferOrderHistory` ของ Order เก่าๆ ที่ปิดไปแล้วว่าตรงกับ Data บน F&O

## 7. ภาพรวมระบบด้านประสิทธิภาพ (Performance & Integrations Resilience)
- [ ] **การแสดงแบบ Responsive บนเครื่องสแกน/Tablet:** เปิดทดสอบจอขนาด `1024x768` หน้าต่าง TO และหน้าต่างสแกน QC ต้องไม่ล้นหรือเละ 
- [ ] **Crash Test (เมื่อ ERP Down):** ทดสอบการ Timeout ระหว่างบันทึก TO เข้า ERP, หน้าเว็บลูกข่ายจะต้องคาย Popup แจ้งเตือนข้อผิดพลาด ไม่ใช่ขึ้นหน้าจอขาวตายค้าง (White Screen)
- [ ] **ป้องกันขยะข้อมูล (Double Submit Target):** ทดสอบเบิ้ลคลิกสร้าง TO หรือเบิ้ลคลิก Approve Defect ระบบต้องตัดทิ้งและ Block Request สั้นๆ (Debounce) ส่งเข้าไปยังขบวน API เพียงครั้งเดียวด้ถูกต้อง
