import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import CheckIn from './Pages/Checkin';
import Profile from './Pages/Profile';
import Layout from './Layout/Layout';
import Home from './Pages/Home';
import ProfileCard from './Pages/Profile';
import CarLoan from './Pages/Car';
import { DeviceHub, Login } from '@mui/icons-material';
import LoginPage from './Pages/Login/Login';
import { UserProvider } from './Context/userContext';
import TopBar from './Component/TopBar';
import InventoryList from './Pages/Inventory/InventoryList';
import NewInventoryCount from './Pages/Inventory/NewInventoryCount';
import FlatListDevice from './Pages/Iotservice/ListDevice';
import DeviceAction from './Pages/Iotservice/ActionDevices';
import Upload from './Pages/Upload/Upload';
import MyDocument from './Pages/Upload/MyDocument';
import EquipmentDashboard from './Pages/Equipment';
import ReceiveEquipment from './Pages/Equipment/ReceiveEquipment';
import WithdrawEquipment from './Pages/Equipment/WithdrawEquipment';
import ActionPages from './Pages/Iotservice/ActionPages';
import Chat from './Pages/Test/Chat';
import ReceiveManyEquipment from './Pages/Equipment/ReceiveManyEquipment';
import WithdrawManyEquipment from './Pages/Equipment/WithdrawManyEquipment';
import StandardTimeDashboard from './Pages/StandardTimeDashboard/StandardTimeDashboard';
import SetupAndRefurbish from './Pages/workStation/SetupAndRefurbish';
import DashboardRefurbish from './Pages/workStation/DashboardRefurbish';
import WorkOrderDetail from './Pages/workStation/WorkOrderDetail';
import ActionPage from './Pages/workStation/ActionPage';
import WorkStation from './Pages/workStation/WorkStation';
import SparePart from './Pages/workStation/SparePart';
import TestContextPage from './Pages/workStation/TestContextPage';
import TableSparePart from './Pages/workStation/TableSparePart';
import StockReport from './Pages/workStation/StockReport';
import StockReportItem from './Pages/workStation/StockReportItem';
import AddSpareFromStock from './Pages/workStation/AddSpareFromStock';
import DashboardMonitoring from './Pages/workStation/DashboardMonitoring';
import DashboardQC from './Pages/Qc/DashboardQC';
import CheckSheet from './Pages/Safety/CheckSheet';
import CheckList from './Pages/Safety/CheckList';
import QrCode from './Pages/QrCode/QrCode';
import DefectDashboard from './Pages/Defect/DefectDashboard';
import DetailEachOrder from './Pages/Defect/DetailEachOrder';
import QuizQuest from './Pages/Quiz/QuizQuest';
import DashboardQuiz from './Pages/Quiz/DashboardQuiz';
import NespressReceiveMachine from './Pages/Nespresso/NespressReceiveMachine';
import ChecklistEmbed from './Pages/workStation/ChecklistEmbed';

// â”€â”€ Hub account switch: à¹€à¸›à¸´à¸”à¸ˆà¸²à¸ Portal = à¸£à¸°à¸šà¸¸à¸•à¸±à¸§à¸„à¸™à¸—à¸µà¹ˆà¸à¸³à¸¥à¸±à¸‡à¹ƒà¸Šà¹‰à¹€à¸„à¸£à¸·à¹ˆà¸­à¸‡à¸­à¸¢à¸¹à¹ˆà¸•à¸­à¸™à¸™à¸µà¹‰ â”€â”€
// hub=1 + login_hint à¹„à¸¡à¹ˆà¸•à¸£à¸‡à¸à¸±à¸š email à¸‚à¸­à¸‡ session à¹€à¸”à¸´à¸¡ â†’ session à¸‚à¸­à¸‡à¸„à¸™à¸­à¸·à¹ˆà¸™à¸•à¹‰à¸­à¸‡à¹„à¸¡à¹ˆà¹€à¸‡à¸µà¸¢à¸š à¹†
// à¸žà¸²à¹€à¸‚à¹‰à¸²à¹€à¸›à¹‡à¸™à¸„à¸™à¸œà¸´à¸” â€” à¸¥à¹‰à¸²à¸‡à¹€à¸‰à¸žà¸²à¸° token/profile à¹ƒà¸«à¹‰ auto-SSO à¸žà¸²à¹€à¸‚à¹‰à¸²à¹€à¸›à¹‡à¸™à¸„à¸™à¸•à¸²à¸¡ hint à¹à¸—à¸™
// (à¸«à¹‰à¸²à¸¡à¸•à¸±à¹‰à¸‡ sso_logout â€” flag à¸™à¸±à¹‰à¸™à¸šà¸¥à¹‡à¸­à¸ auto-SSO; à¹„à¸¡à¹ˆà¹à¸™à¹ˆà¹ƒà¸ˆà¸§à¹ˆà¸² email à¹ƒà¸„à¸£ = à¹„à¸¡à¹ˆà¸¥à¹‰à¸²à¸‡ fail-open)
(() => {
  try {
    const sp = new URLSearchParams(window.location.search);
    let hub = sp.get('hub');
    let hint = sp.get('login_hint');
    // param à¸­à¸²à¸ˆà¸–à¸¹à¸à¸”à¸±à¸™à¹€à¸‚à¹‰à¸² redirectTo à¸•à¸­à¸™ redirect â†’ à¸­à¹ˆà¸²à¸™à¸—à¸±à¹‰à¸‡à¸ªà¸­à¸‡à¸—à¸µà¹ˆ (à¹€à¸«à¸¡à¸·à¸­à¸™à¸«à¸™à¹‰à¸² Login à¸‚à¸­à¸‡ hub)
    const rt = sp.get('redirectTo');
    if ((!hub || !hint) && rt && rt.includes('?')) {
      const rp = new URLSearchParams(rt.slice(rt.indexOf('?') + 1));
      hub = hub || rp.get('hub');
      hint = hint || rp.get('login_hint');
    }
    const t = localStorage.getItem('token');
    if (hub !== '1' || !hint || !t) return;
    // email à¸‚à¸­à¸‡ session à¹€à¸”à¸´à¸¡: claim à¹ƒà¸™ token (azure-login à¹ƒà¸ªà¹ˆ email à¸¡à¸²à¹ƒà¸«à¹‰) â†’ à¸ªà¸³à¸£à¸­à¸‡à¸ˆà¸²à¸ profile
    // decode payload à¸­à¸¢à¹ˆà¸²à¸‡à¹€à¸”à¸µà¸¢à¸§ à¹„à¸¡à¹ˆ verify signature (à¸à¸±à¹ˆà¸‡ client à¸—à¸³à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¹à¸¥à¸°à¹„à¸¡à¹ˆà¸•à¹‰à¸­à¸‡)
    // à¸£à¸±à¸šà¹€à¸‰à¸žà¸²à¸°à¸„à¹ˆà¸²à¸—à¸µà¹ˆà¸¡à¸µ @ â€” username à¹€à¸‰à¸¢ à¹† à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ email à¹€à¸­à¸²à¸¡à¸²à¹€à¸—à¸µà¸¢à¸šà¹à¸¥à¹‰à¸§à¸ˆà¸°à¹€à¸•à¸°à¸„à¸™à¸œà¸´à¸”
    let email = '';
    try {
      const part = t.split('.')[1] || '';
      const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
      // atob à¸„à¸·à¸™ binary string â€” à¹à¸›à¸¥à¸‡à¸à¸¥à¸±à¸šà¹€à¸›à¹‡à¸™ UTF-8 à¸à¹ˆà¸­à¸™ à¹„à¸¡à¹ˆà¸‡à¸±à¹‰à¸™ claim à¸ à¸²à¸©à¸²à¹„à¸—à¸¢à¸—à¸³ JSON.parse à¸žà¸±à¸‡
      const bin = atob(b64 + pad);
      const json = decodeURIComponent(
        Array.prototype.map
          .call(bin, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const claims = JSON.parse(json) || {};
      email = [claims.email, claims.preferred_username, claims.upn]
        .map((v: unknown) => (typeof v === 'string' ? v : ''))
        .find((v: string) => v.includes('@')) || '';
    } catch { /* decode à¹„à¸¡à¹ˆà¹„à¸”à¹‰ = à¹„à¸¡à¹ˆà¸£à¸¹à¹‰ email */ }
    if (!email) {
      try {
        const p = JSON.parse(localStorage.getItem('profile') || '{}');
        const pe = p?.email || p?.Email;
        if (typeof pe === 'string' && pe.includes('@')) email = pe;
      } catch { /* ignore */ }
    }
    if (!email) return; // à¹„à¸¡à¹ˆà¸£à¸¹à¹‰ email à¸‚à¸­à¸‡ session à¹€à¸”à¸´à¸¡ â†’ à¸›à¸¥à¹ˆà¸­à¸¢à¸œà¹ˆà¸²à¸™ (à¸­à¸¢à¹ˆà¸²à¹€à¸•à¸°à¸„à¸™à¹€à¸žà¸£à¸²à¸°à¸„à¸§à¸²à¸¡à¹„à¸¡à¹ˆà¹à¸™à¹ˆà¹ƒà¸ˆ)
    if (email.trim().toLowerCase() !== hint.trim().toLowerCase()) {
      localStorage.removeItem('token');
      localStorage.removeItem('profile');
      // à¹„à¸¡à¹ˆà¹à¸•à¸° sso_hub/sso_hint â€” à¸«à¸™à¹‰à¸² Login à¸ˆà¸°à¸­à¹ˆà¸²à¸™ hub/hint à¸ˆà¸²à¸ query à¹à¸¥à¹‰à¸§ auto-SSO à¸•à¹ˆà¸­à¹€à¸­à¸‡
    }
  } catch { /* fail-open */ }
})();

const token = localStorage.getItem('token');

// â”€â”€ à¸•à¸£à¸§à¸ˆà¸§à¹ˆà¸²à¸à¸³à¸¥à¸±à¸‡à¸­à¸¢à¸¹à¹ˆà¹ƒà¸™ embed mode à¸«à¸£à¸·à¸­à¹€à¸›à¸¥à¹ˆà¸² â”€â”€
const isEmbedRoute = window.location.pathname.startsWith('/checklist/embed');

// â”€â”€ Access check: super admin à¹€à¸•à¸°/à¸£à¸°à¸‡à¸±à¸šà¸ˆà¸²à¸à¸«à¸™à¹‰à¸² Login Management (Service Management)
// SPA à¹„à¸¡à¹ˆà¸¡à¸µ server à¸‚à¸­à¸‡à¸•à¸±à¸§à¹€à¸­à¸‡ â†’ à¹€à¸Šà¹‡à¸„à¹€à¸›à¹‡à¸™à¸£à¸­à¸š à¹† à¸—à¸¸à¸ 60 à¸§à¸´ / à¹‚à¸”à¸™à¹€à¸•à¸° = à¸¥à¹‰à¸²à¸‡ session à¹€à¸”à¹‰à¸‡à¸­à¸­à¸
// fail-open: SM à¸¥à¹ˆà¸¡à¸«à¸£à¸·à¸­ network à¸žà¸±à¸‡ â†’ à¹„à¸¡à¹ˆà¸—à¸³à¸­à¸°à¹„à¸£ (à¸­à¸¢à¹ˆà¸²à¹€à¸•à¸°à¸„à¸™à¹€à¸žà¸£à¸²à¸°à¸£à¸°à¸šà¸šà¹€à¸Šà¹‡à¸„à¸¥à¹ˆà¸¡)
const SM_API =
  process.env.REACT_APP_SM_API_BASE_URL ||
  'https://bevprogateway.southeastasia.cloudapp.azure.com/svc/api/v1';

function startAccessCheck() {
  const check = async () => {
    const t = localStorage.getItem('token');
    if (!t) return;
    try {
      const res = await fetch(`${SM_API}/auth/access-check`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('profile');
        localStorage.setItem('sso_logout', '1'); // à¸à¸±à¸™ auto-SSO à¸”à¸¶à¸‡à¸à¸¥à¸±à¸šà¸—à¸±à¸™à¸—à¸µ
        window.location.replace('/login');
      }
    } catch { /* fail-open */ }
  };
  check();
  setInterval(check, 60_000);
}
if (!isEmbedRoute && token) startAccessCheck();

function App() {
  // â”€â”€ Embed mode: render à¹€à¸‰à¸žà¸²à¸° ChecklistEmbed à¹‚à¸”à¸¢à¹„à¸¡à¹ˆà¸¡à¸µ Layout / auth â”€â”€
  if (isEmbedRoute) {
    return (
      <div className="App">
        <Routes>
          <Route path="/checklist/embed" element={<ChecklistEmbed />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="App">

      <div>
        {token ? (<UserProvider><Layout ><Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="StandardTimeDashboard" element={<StandardTimeDashboard />}></Route>
          <Route path="checkin" element={<CheckIn />}></Route>
          <Route path="profile" element={<ProfileCard />}></Route>
          <Route path="List" element={<FlatListDevice />}></Route>
          <Route path="Action/:simEmi" element={<ActionPages />}></Route>
          <Route path="InventoryList" element={<InventoryList />}></Route>
          <Route path="NewInventoryCount" element={<NewInventoryCount />}></Route>
          <Route path="MyDocument" element={<MyDocument />}></Route>
          <Route path="UploadFile" element={<Upload />}></Route>
          <Route path="EquipmentDashboard" element={<EquipmentDashboard />}></Route>
          <Route path="WithdrawEquipmentScan" element={<WithdrawEquipment />}></Route>
          <Route path="ReceiveEquipmentScan" element={<ReceiveEquipment />}></Route>
          <Route path="ReceiveManyEquipmentScan" element={<ReceiveManyEquipment />}></Route>
          <Route path="WithdrawManyEquipmentScan" element={<WithdrawManyEquipment />}></Route>
          <Route path="Chat" element={<Chat />}></Route>
          <Route path="SetupAndRefurbish" element={<SetupAndRefurbish />}></Route>
          <Route path="DashboardRefurbish" element={<DashboardRefurbish />}></Route>
          <Route path="WorkOrderDetail" element={<WorkOrderDetail />}></Route>
          <Route path="WorkStation/:orderId/:operationId" element={<WorkStation />}></Route>
          <Route path="ActionPage" element={<ActionPage />}></Route>
          <Route path="SparePart" element={<SparePart />}></Route>
          <Route path="TestContextPage" element={<TestContextPage />}></Route>
          <Route path="TableSparePart/:orderId" element={<TableSparePart />}></Route>
          <Route path="StockReport" element={<StockReport />}></Route>
          <Route path="StockReportItem/:resId" element={<StockReportItem />}></Route>
          <Route path="AddSpareFromStock" element={<AddSpareFromStock />}></Route>
          <Route path="DashboardMonitoring" element={<DashboardMonitoring />}></Route>
          <Route path="DashboardQC" element={<DashboardQC />}></Route>
          <Route path="CheckSheet" element={<CheckSheet />}></Route>
          <Route path="CheckList" element={<CheckList />}></Route>
          <Route path="QrCode" element={<QrCode />}></Route>
          <Route path="DefectDashboard" element={<DefectDashboard />}></Route>
          <Route path="DetailEachOrder/:orderId/:operationId" element={<DetailEachOrder />}></Route>
          <Route path="QuizQuest" element={<QuizQuest />}></Route>
          <Route path="DashboardQuiz" element={<DashboardQuiz />}></Route>
          <Route path="NespressReceiveMachine" element={<NespressReceiveMachine />}></Route>

        </Routes></Layout></UserProvider>) : (<Routes><Route path='*' element={<LoginPage />}></Route></Routes>)}

      </div >
    </div >

  );
}

export default App;
