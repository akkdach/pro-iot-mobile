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

const token = localStorage.getItem('token');
function App() {
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
          <Route path="WithdrawManyEquipmentScan" element={<WithdrawManyEquipment/>}></Route>
          <Route path="Chat" element={<Chat />}></Route>
          <Route path="SetupAndRefurbish" element={<SetupAndRefurbish />}></Route>
          <Route path="DashboardRefurbish" element={<DashboardRefurbish />}></Route>
          <Route path="WorkOrderDetail" element={<WorkOrderDetail />}></Route>
          <Route path="WorkStation" element={<WorkStation />}></Route>
          <Route path="ActionPage" element={<ActionPage />}></Route>
          <Route path="SparePart" element={<SparePart />}></Route>
          <Route path="TestContextPage" element={<TestContextPage />}></Route>
          <Route path="TableSparePart" element={<TableSparePart />}></Route>
          <Route path="StockReport" element={<StockReport />}></Route>
          <Route path="StockReportItem/:resId" element={<StockReportItem />}></Route>
          <Route path="AddSpareFromStock" element={<AddSpareFromStock />}></Route>
        </Routes></Layout></UserProvider>): (<Routes><Route path='*' element={<LoginPage />}></Route></Routes>)}
      
      </div>
    </div>

  );
}

export default App;
