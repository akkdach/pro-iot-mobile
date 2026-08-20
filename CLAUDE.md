# CLAUDE.md — กติกาสำหรับ AI ใน repo นี้

Pro Service (pro-iot-mobile) — mobile web app สำหรับงานภาคสนาม/ศูนย์บริการของ BevproAsia:
work station + refurbish, IoT device service, inventory/equipment, QC, safety checklist, defect dashboard
Frontend อย่างเดียว (Create React App + TypeScript) — API อยู่คนละ repo เรียกผ่าน axios

| | |
|---|---|
| Deploy จริง | Azure Web App `pro-iot-mobile` — auto deploy เมื่อ push `main` (GitHub Actions) |
| API production | `https://service.bevproasia.com/api/v1` (ตาม workflow) |
| มาตรฐานเอกสาร | `docs/ST-documentation-standard.md` — ไฟล์ใหม่ใน `docs/` ต้องชื่อ `<PREFIX>-<slug>.md` |

## โครง repo

| ที่ | คือ |
|---|---|
| `src/Pages/` | หน้าจอแยกตามโมดูล — `workStation/` (ใหญ่สุด: refurbish, spare part, stock), `Iotservice/`, `Equipment/`, `Inventory/`, `Qc/`, `Safety/`, `Defect/`, `Quiz/`, `Nespresso/`, `Login/` |
| `src/Services/` | ชั้นเรียก API — `callApi.tsx` (หลัก), `callApiProd.tsx`, `callApiOneleke.tsx`, `callUpload*.tsx`, `socket.tsx` |
| `src/Component/` · `src/Layout/` | component กลาง (กล้อง, QR scanner, map, charts) + Layout/TopBar |
| `src/Context/` | React Context ต่อโมดูล (user, workstation, timer, check-in) |
| `src/Utility/` | helper (เวลา, SLA timer, employee select, location permission) |
| `*.drawio` ที่ root | flowchart/sequence diagram ของแต่ละหน้า — เอกสารเดิมก่อนมาตรฐาน ST |
| `.github/workflows/main_pro-iot-mobile.yml` | pipeline build + deploy ขึ้น Azure |

## คำสั่งที่ใช้จริง (จาก `package.json`)

```bash
npm install --legacy-peer-deps   # ห้ามลืม flag — React 19 RC ชนกับ peer deps ของ react-scripts 5 (workflow ก็ใช้ flag นี้)
npm start                        # dev ที่ :3000 ใช้ .env (API ชี้ localhost:44496)
npm run start:uat                # ใช้ .env.uat ผ่าน env-cmd · start:prod ใช้ .env.prod
npm run build                    # production build ลง build/ · build:uat / build:prod เลือก env file
npm test                         # react-scripts test (jest watch mode)
```

- ตัวแปร env ต้องขึ้นต้น `REACT_APP_` และถูก **ฝังลง bundle ตอน build** — เปลี่ยนค่าแล้วต้อง build/restart dev server ใหม่ ไม่ใช่แค่ refresh
- key ที่ใช้จริง: `REACT_APP_API_BASE_URL` · `REACT_APP_API_PROD_BASE_URL` · `REACT_APP_API_ONELAKE_URL` · `REACT_APP_SERVICE_MANAGEMENT_URL`

## Deploy (จาก `.github/workflows/main_pro-iot-mobile.yml`)

push ขึ้น `main` = deploy production ทันที — ไม่มี staging gate:

1. build บน GitHub Actions (Node 24, `CI: false`, ตั้ง `REACT_APP_API_BASE_URL` + `REACT_APP_SERVICE_MANAGEMENT_URL` inline ใน workflow — **ไม่ได้อ่านจาก `.env.prod`**)
2. deploy โฟลเดอร์ `build/` ขึ้น Azure Web App `pro-iot-mobile` แล้วรันด้วย `pm2 serve --spa`
3. credential ฝั่ง Azure อยู่ใน GitHub Secrets (`AZUREAPPSERVICE_CLIENTID_*` ฯลฯ) — ไม่อยู่ใน repo

จะเปลี่ยน URL ปลายทางของ production ต้องแก้ **ใน workflow** ไม่ใช่ใน `.env.prod` (`.env.prod` มีผลเฉพาะ `build:prod`/`start:prod` ที่รันเอง)

## ข้อห้าม / กับดักที่มีหลักฐานในโค้ด

- **`.env` `.env.uat` `.env.prod` ถูก commit อยู่ใน git** (`.gitignore` กันแค่ `.env.local`) — ปัจจุบันมีแต่ URL จึงยังพอไหว แต่**ห้ามใส่ secret จริง** (token, password, connection string) ลงไฟล์เหล่านี้เด็ดขาด เขียนได้แค่ชื่อ key
- **auth จริงคือ JWT ใน localStorage** — `Login.tsx` ยิง `POST /Authen/token` แล้วเก็บ `access_token`; interceptor ใน `callApi.tsx` แนบ `Bearer` ให้ทุก request และเจอ 401 จะ `localStorage.clear()` + redirect `/login`
- **MSAL (`@azure/msal-*`) ติดตั้งแต่ยังไม่ได้ใช้งาน** — `src/authConfig.js` เป็นค่า placeholder และไม่มีไฟล์ไหน import — อย่าเข้าใจผิดว่าแอป login ผ่าน Azure AD แล้ว
- **`src/Services/socket.tsx` hardcode `http://localhost:3000`** — ใช้บน production ไม่ได้จนกว่าจะย้ายไปอ่านจาก env
- **`REACT_APP_SERVICE_MANAGEMENT_URL` ไม่มีใน `.env` ไหนเลย** — ตั้งเฉพาะใน workflow; รัน local แล้วฟีเจอร์ใน `WorkStation.tsx` ที่เรียก URL นี้จะได้ `undefined`
- **`CI: false` ใน workflow คือของจำเป็น** — CRA ถือ ESLint warning เป็น error ตอน build บน CI (commit `691fb60`) ลบแล้ว deploy พังทั้งที่ local build ผ่าน
- **lib ซ้ำหน้าที่กันมีอยู่แล้วหลายคู่** — UI: MUI + Chakra · วันที่: moment + dayjs · QR: `html5-qrcode` + `@yudiel/react-qr-scanner` + `@zxing/library` · chart: recharts + `@mui/x-charts` — ก่อนเพิ่ม dependency ใหม่ เช็กก่อนว่าของเดิมทำได้ไหม
- `/checklist/embed/*` เป็น embed mode — `App.tsx` render โดยไม่มี Layout และไม่เช็ค auth — แก้เรื่อง routing/auth ต้องไม่ทำ path นี้พัง

## แก้โค้ดตรงไหน ต้องอัปเดตเอกสารตรงไหน (traceability)

PR ที่แก้โค้ดโดยไม่แก้เอกสารที่ผูกกัน ถือว่ายังไม่เสร็จ (ตาม `docs/ST-documentation-standard.md` ข้อ 8)

| แก้อะไร | ต้องอัปเดตด้วย |
|---|---|
| แก้ flow หน้า workStation / Defect / StockReport ฯลฯ | diagram `.drawio` ของหน้านั้น (ไฟล์ชื่อ `<หน้า>_Flowchart` / `_SequenceDiagram`) |
| เพิ่ม/เปลี่ยน endpoint ที่ frontend เรียก (`src/Services/`, หน้าใน `src/Pages/`) | ยังไม่มี `AS-*` — ถ้าเริ่มเขียนให้วางใน `docs/` ตามมาตรฐาน ST |
| เพิ่ม/แก้ key `REACT_APP_*` | `.env.example` + `.env.uat` + `.env.prod` + env ใน workflow (ถ้า production ต้องใช้) |
| แก้ auth flow (`Login.tsx`, interceptor ใน `callApi.tsx`) | หัวข้อ auth ในไฟล์นี้ |
| แก้ workflow / วิธี deploy | หัวข้อ Deploy ในไฟล์นี้ + `docs/RB-*` (ถ้าเริ่มมี) |
| ตัดสินใจเชิงสถาปัตยกรรม (เช่น เลิก CRA, เปิดใช้ MSAL, ยุบ lib ซ้ำ) | `AD-*` ฉบับใหม่ใน `docs/` — ไม่แก้ทับฉบับเก่า |

## แผนที่เอกสาร

| ไฟล์ | เรื่อง |
|---|---|
| `README.md` | ยังเป็น default ของ Create React App — คำสั่งจริงดูไฟล์นี้แทนไปก่อน |
| `docs/ST-documentation-standard.md` | มาตรฐานชื่อไฟล์/โครงเอกสารของทีม |
| `*.drawio` ที่ root + `docs/StockReport_SequenceDiagram.drawio` | flowchart/sequence ต่อหน้า — เอกสารเดิมก่อนมาตรฐาน ST แตะเมื่อไหร่ให้ย้ายเข้า `docs/` และตั้งชื่อตาม prefix (`SQ-*`, `BP-*`) |
| `263LBR-ITR.xlsx` | เอกสารงานเดิมที่ root — อย่าลบโดยไม่ถามเจ้าของ |
