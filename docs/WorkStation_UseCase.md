# Use Case Document: WorkStation

---

## Use Case 1: โหลดข้อมูล Work Order

**Use Case ID:** UC-WS-001

**Use Case Name:** โหลดข้อมูล Work Order เมื่อเปิดหน้า WorkStation

**Actor:** ระบบ (System)

**Purpose:** เพื่อโหลดข้อมูลทั้งหมดที่จำเป็นสำหรับการแสดงผลหน้า WorkStation รวมถึง Spare Part, Work Order Details, รูปภาพ, พนักงาน และ Checklist Status

**Pre-Conditions:**
- ผู้ใช้งานเลือก Work Order จากหน้า Dashboard แล้ว
- ระบบได้รับ orderId และ operationId จาก URL params

**Post-Conditions:**
- ระบบแสดงข้อมูล Work Order, Spare Parts, รูปภาพ, รายชื่อพนักงาน และ Checklist Status ครบถ้วน
- ระบบตรวจสอบสถานะงาน (isWorking) จาก acT_START_DATE / acT_END_DATE

**Main Flow:**
1. ระบบเรียก API 5 ตัวพร้อมกัน (onLoad ~ onLoad5):
   - `GET /WorkOrderList/items_component/{orderId}` → โหลดรายการ Spare Part
   - `GET /WorkOrderList/workOrder/{orderId}/{operationId}` → โหลดรายละเอียด Work Order
   - `GET /Mobile/GetMasterWorkorderImage?order_id={orderId}` + `GET /WorkOrderList/ImgBox/{orderId}` → โหลด Master Template รูปภาพ + รูปที่อัพโหลดแล้ว
   - `GET /WorkOrderList/GetEmployee/{orderId}/{station}` → โหลดรายชื่อพนักงานที่ assign
   - `GET /WorkOrderList/Checked/{orderId}` → โหลดสถานะ Checklist ของแต่ละ Station
2. ระบบ merge รูปภาพ Master Template กับรูปที่อัพโหลดแล้ว (case-insensitive key matching)
3. ระบบตรวจสอบ: ถ้ามี acT_START_DATE แต่ไม่มี acT_END_DATE → setIsWorking(true) (งานกำลังดำเนินอยู่)
4. ระบบแสดงหน้า WorkStation พร้อม 4 tabs: Work Order, Employee, Sparepart, Upload Image

**Alternate Condition:**
1. หาก API ใดตอบกลับเป็น null หรือ error → ระบบแสดงค่า default (รายการว่าง)
2. หาก station เป็น station พิเศษ (0049, 0079, 0089) → ระบบดึงพนักงานจากทั้ง station หลักและ station พิเศษรวมกัน

---

## Use Case 2: เริ่มงาน (Start Work)

**Use Case ID:** UC-WS-002

**Use Case Name:** เริ่มงานพร้อมเลือกพนักงาน

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานเลือกพนักงานที่จะทำงาน แล้วเริ่มจับเวลาการทำงาน

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Work Order
- งานยังไม่ได้เริ่ม (isWorking = false) และยังไม่เสร็จ (hasFinished = false)
- ปุ่ม "Start" แสดงอยู่บนหน้าจอ

**Post-Conditions:**
- ระบบบันทึกรายชื่อพนักงานที่เลือก
- ระบบเริ่มจับเวลา (Timer เริ่มนับ)
- ปุ่ม "Start" เปลี่ยนเป็นปุ่ม "Finish"

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "Start"
2. ระบบเปิด EmployeeMultiSelectModal ให้เลือกพนักงาน
3. ผู้ใช้งานเลือกพนักงานอย่างน้อย 1 คน แล้วกด "ยืนยัน"
4. ระบบเรียก `POST /WorkOrderList/Employee/{orderId}/{operation}` พร้อมข้อมูลพนักงานที่เลือก
5. ระบบเรียก startWork() ผ่าน WorkStationContext เพื่อบันทึกเวลาเริ่ม
6. ระบบโหลดรายชื่อพนักงานใหม่ (onLoad4)
7. Timer เริ่มนับจาก acT_START_DATE

**Alternate Condition:**
1. หากผู้ใช้งานกด "ปิด" ใน EmployeeMultiSelectModal → กลับไปหน้า Work Order (ไม่เริ่มงาน)
2. หากเกิด error ระหว่างบันทึก → ระบบ set isWorking = false กลับไปสถานะเดิม

---

## Use Case 3: เสร็จสิ้นงาน (Finish Work)

**Use Case ID:** UC-WS-003

**Use Case Name:** เสร็จสิ้นงานพร้อมบันทึก Checklist

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อบันทึกผลการทำงานเสร็จสิ้น พร้อม Checklist ที่ติ๊กไว้

**Pre-Conditions:**
- งานกำลังดำเนินอยู่ (isWorking = true)
- ปุ่ม "Finish" แสดงอยู่บนหน้าจอ

**Post-Conditions:**
- ระบบบันทึกเวลาสิ้นสุดการทำงาน
- ระบบบันทึก Checklist ที่เลือกไว้
- ระบบกลับไปหน้าก่อนหน้า (navigate back)

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "Finish"
2. ระบบรวบรวม checkedCodes (station ที่ติ๊กไว้) เป็น checklist payload
3. ระบบเรียก finishWork(checklist) ผ่าน WorkStationContext
4. หากสำเร็จ → ระบบ navigate กลับหน้าก่อนหน้า

**Alternate Condition:**
1. หาก finishWork ไม่สำเร็จ → ระบบไม่ navigate กลับ (อยู่หน้าเดิม)

---

## Use Case 4: จัดการ Checklist (Station Checkbox)

**Use Case ID:** UC-WS-004

**Use Case Name:** ติ๊ก/ยกเลิก Checklist ของ Station

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานเลือก Station ที่ต้องทำงาน ผ่าน Checkbox

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Work Order
- ระบบแสดง Checkbox ตาม Station ที่มีข้อมูลจาก Backend

**Post-Conditions:**
- checkedCodes อัปเดตตาม Station ที่ถูกติ๊ก/ยกเลิก

**Main Flow:**
1. ระบบแสดง Checkbox 8 รายการ: Inspector(0010), Remove Part(0020), Clean(0030), Color(0040), Fix Cooling(0050), Assembly Part(0060), Test(0070), QC Packing(0080)
2. ผู้ใช้งานติ๊ก/ยกเลิก Checkbox ที่ต้องการ
3. ระบบอัปเดต checkedCodes

**Alternate Condition:**
1. หาก Station ปัจจุบันไม่ใช่ "0010" (Inspector) → Checkbox เป็น disabled (แก้ไขไม่ได้)
2. หาก Station เป็น "0010" และไม่มีข้อมูลจาก Backend → ระบบติ๊กทั้งหมดเป็น default

---

## Use Case 5: เปิด Check List (iframe)

**Use Case ID:** UC-WS-005

**Use Case Name:** เปิด Check List ผ่าน iframe

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อเปิดหน้า Checklist แบบละเอียดใน Dialog สำหรับกรอกข้อมูลตรวจสอบ

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Work Order
- Station ปัจจุบันเป็น 0010, 0030 หรือ 0070 (แสดงปุ่ม Check List)

**Post-Conditions:**
- ระบบแสดง Checklist Dialog พร้อม iframe จาก Service Management URL

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "Check List"
2. ระบบเรียก `POST {SERVICE_MANAGEMENT_URL}/api/v1/checklist/token` เพื่อขอ JWT token
   - Payload: { orderId, updatedBy (จาก localStorage profile) }
3. ระบบรับ token สำเร็จ → เปิด Dialog
4. ถ้า Station = 0010 (Inspector):
   - แสดง iframe เดียว (embed-inspector) สำหรับติ๊ก เปลี่ยน/ล้าง
5. ถ้า Station อื่น (0030, 0070):
   - แสดง 2 iframe เคียงข้างกัน:
     - ซ้าย: งานจาก Inspector (embed-work, read-only)
     - ขวา: Checklist ให้กรอก (embed)

**Alternate Condition:**
1. หากเรียก token ไม่สำเร็จ → ระบบ log error, ไม่เปิด Dialog
2. หากกำลังโหลด token → แสดง loading spinner

---

## Use Case 6: แก้ไขจำนวน Spare Part

**Use Case ID:** UC-WS-006

**Use Case Name:** แก้ไขจำนวน Spare Part

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานแก้ไขจำนวน (Quantity) ของ Spare Part ที่เชื่อมกับ Work Order

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Sparepart
- ระบบแสดงตาราง Spare Part ที่มีข้อมูลอยู่แล้ว

**Post-Conditions:**
- จำนวน Spare Part ถูกอัปเดตใน Backend
- ตาราง Spare Part โหลดข้อมูลใหม่

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม Edit (ไอคอนดินสอ) ที่แถวของ Spare Part ที่ต้องการแก้ไข
2. ระบบเปิด Dialog "แก้ไขจำนวน" แสดง Material, Description และจำนวนปัจจุบัน
3. ผู้ใช้งานปรับจำนวนด้วยปุ่ม +/- หรือพิมพ์ตัวเลข (ต้อง ≥ 1)
4. ผู้ใช้งานกดปุ่ม "Save"
5. ระบบแสดง Loading "กำลังบันทึก..."
6. ระบบเรียก `POST /Mobile/SetWorkOrderSparePart?OrderId={orderId}` พร้อม payload ทุกรายการ (bulk update)
7. หากสำเร็จ → แสดง "สำเร็จ" แล้วโหลดข้อมูลใหม่ (onLoad)

**Alternate Condition:**
1. หาก API ตอบ isSuccess = false → แสดง error message จาก API
2. หากเกิด exception → แสดง "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
3. หากผู้ใช้งานกด "Cancel" → ปิด Dialog (ไม่บันทึก)

---

## Use Case 7: ลบ Spare Part

**Use Case ID:** UC-WS-007

**Use Case Name:** ลบ Spare Part ออกจาก Work Order

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อลบ Spare Part ที่ไม่จำเป็นออกจากรายการ Work Order

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Sparepart
- มี Spare Part อย่างน้อย 1 รายการในตาราง

**Post-Conditions:**
- Spare Part ถูกลบออกจาก Work Order
- ตารางโหลดข้อมูลใหม่

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม Delete (ไอคอนถังขยะ) ที่แถวของ Spare Part ที่ต้องการลบ
2. ระบบเรียก deletePart(workOrderComponentId) ผ่าน WorkStationContext
3. ระบบโหลดข้อมูล Spare Part ใหม่ (onLoad)

**Alternate Condition:**
1. หากเกิด error → ระบบ log error (ปัจจุบันไม่มี error UI)

---

## Use Case 8: นำทางไปแก้ไข Spare Part (TableSparePart)

**Use Case ID:** UC-WS-008

**Use Case Name:** เปิดหน้าแก้ไขรายการ Spare Part

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อนำทางไปหน้า TableSparePart สำหรับจัดการรายการ Spare Part แบบเต็มรูปแบบ

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Sparepart

**Post-Conditions:**
- ระบบนำทางไปหน้า /TableSparePart/{orderId}

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "แก้ไขรายการอะไหล่"
2. ระบบเรียก navigate(`/TableSparePart/${orderId}`)
3. แสดงหน้า TableSparePart

**Alternate Condition:**
- ไม่มี

---

## Use Case 9: อัพโหลดรูปภาพ

**Use Case ID:** UC-WS-009

**Use Case Name:** อัพโหลดรูปภาพ Work Order

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานเลือกรูปภาพตาม Master Template แล้วอัพโหลดทั้งหมดพร้อมกัน

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Upload Image
- ระบบแสดง Master Template รูปภาพ (จาก onLoad3)

**Post-Conditions:**
- รูปภาพทั้งหมดที่เลือกถูกอัพโหลดไปยัง Backend

**Main Flow:**
1. ระบบแสดงรายการ ImageUploadCard ตาม Master Template
2. ผู้ใช้งานเลือกรูปภาพ (เลือกไฟล์ หรือ ถ่ายรูป) สำหรับแต่ละ Template
3. ระบบแสดงจำนวนรูปที่เลือกไว้บนปุ่ม "บันทึกรูปภาพทั้งหมด (N)"
4. ผู้ใช้งานกดปุ่ม "บันทึกรูปภาพทั้งหมด"
5. ระบบแสดง Loading "กำลังอัพโหลด... (0/N)"
6. ระบบอัพโหลดทีละรูปผ่าน callUploadImage({ orderId, image, imageKey })
7. อัปเดต progress ทุกรูป: "กำลังอัพโหลด... (i/N) + ชื่อรูป"
8. เมื่ออัพโหลดเสร็จ → แสดงสรุป "อัพโหลดสำเร็จ X รูป"

**Alternate Condition:**
1. หากไม่ได้เลือกรูปเลย → แสดง warning "กรุณาเลือกรูปภาพอย่างน้อย 1 รูป"
2. หากบางรูปอัพโหลดไม่สำเร็จ → แสดง warning "อัพโหลดสำเร็จ X รูป, ล้มเหลว Y รูป"
3. หากผู้ใช้งานกดกากบาทล้างรูป → ลบรูปออกจาก selectedFiles (ไม่อัพโหลด)
4. ระบบตรวจสอบว่ารูปเป็น "new" หรือ "modified" (แก้ไขรูปที่มีอยู่แล้ว)

---

## Use Case 10: บันทึก Remark

**Use Case ID:** UC-WS-010

**Use Case Name:** บันทึก Remark (หมายเหตุหยุดงาน)

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ผู้ใช้งานบันทึกเหตุผลการหยุดงาน เช่น Delay, Waiting Part, Rework

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Work Order

**Post-Conditions:**
- ระบบบันทึก Remark ไปยัง Backend

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "Remark"
2. ระบบเปิด RemarkField Dialog พร้อม Dropdown: Delay, Waiting Part, Rework
3. ผู้ใช้งานเลือกเหตุผลจาก Dropdown
4. ผู้ใช้งานกด "บันทึก"
5. ระบบแสดง popup ยืนยัน "ยืนยันการบันทึก?" พร้อมแสดง Remark ที่เลือก
6. ผู้ใช้งานกด "บันทึก" ใน popup ยืนยัน
7. ระบบแสดง Loading "กำลังบันทึก..."
8. ระบบเรียก `POST /WorkOrderList/RemarkStop` พร้อม payload:
   - WORK_ORDER_OPERATION_ID, stop_remark, current_operation, ORDERID
9. หากสำเร็จ → แสดง "บันทึกสำเร็จ"

**Alternate Condition:**
1. หากผู้ใช้งานกด "ยกเลิก" ใน popup ยืนยัน → ไม่บันทึก (กลับหน้าเดิม)
2. หากเกิด error → แสดง "บันทึกไม่สำเร็จ" พร้อม error message

---

## Use Case 11: Completed (ปิดงานทั้งหมด)

**Use Case ID:** UC-WS-011

**Use Case Name:** ปิดงานทั้งหมด (Completed)

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อทำเครื่องหมายว่า Work Order เสร็จสมบูรณ์ทั้งหมด

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Work Order

**Post-Conditions:**
- Work Order ถูกทำเครื่องหมายว่า Completed ใน Backend

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "Completed"
2. ระบบเรียก completed() ผ่าน WorkStationContext

**Alternate Condition:**
- ขึ้นอยู่กับ logic ใน WorkStationContext

---

## Use Case 12: Return Work

**Use Case ID:** UC-WS-012

**Use Case Name:** ส่งงานคืน (Return Work)

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อส่งงานคืนไปยัง Station ก่อนหน้า

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Work Order

**Post-Conditions:**
- งานถูกส่งกลับไปยัง Station ก่อนหน้า

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "Return"
2. ระบบเรียก returnWork() ผ่าน WorkStationContext

**Alternate Condition:**
- ขึ้นอยู่กับ logic ใน WorkStationContext

---

## Use Case 13: QC Return Work

**Use Case ID:** UC-WS-013

**Use Case Name:** ส่งงานคืนจาก QC (QC Return)

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อให้ QC ส่งงานกลับไปแก้ไข

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่ tab Work Order

**Post-Conditions:**
- งานถูกส่งกลับจาก QC ไปยัง Station ที่ต้องแก้ไข

**Main Flow:**
1. ผู้ใช้งานกดปุ่ม "QC Return"
2. ระบบเรียก qcReturnWork() ผ่าน WorkStationContext

**Alternate Condition:**
- ขึ้นอยู่กับ logic ใน WorkStationContext

---

## Use Case 14: ดูรายชื่อพนักงาน

**Use Case ID:** UC-WS-014

**Use Case Name:** ดูรายชื่อพนักงานที่ assign

**Actor:** ผู้ใช้งาน (User)

**Purpose:** เพื่อแสดงรายชื่อพนักงานที่ถูก assign ให้ทำงานใน Work Order นี้

**Pre-Conditions:**
- ผู้ใช้งานอยู่ที่หน้า WorkStation

**Post-Conditions:**
- ระบบแสดงรายชื่อพนักงานใน tab Employee

**Main Flow:**
1. ผู้ใช้งานกดที่ tab "Employee"
2. ระบบแสดง WorkerRows component พร้อมรายชื่อพนักงาน (จาก onLoad4)

**Alternate Condition:**
1. หากไม่มีพนักงาน → แสดงรายการว่าง
