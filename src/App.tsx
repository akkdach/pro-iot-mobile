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
import { Login } from '@mui/icons-material';
import LoginPage from './Pages/Login/Login';
import { UserProvider } from './Context/userContext';
import TopBar from './Component/TopBar';
import InventoryList from './Pages/Inventory/InventoryList';
import NewInventoryCount from './Pages/Inventory/NewInventoryCount';
import FlatListDevice from './Pages/Iotservice/ListDevice';
import DeviceAction from './Pages/Iotservice/ActionDevices';

const token = localStorage.getItem('token');
function App() {
  return (
    <div className="App">
              {/* <TopBar /> */}
        <div>
      

        {token ? (<UserProvider><Layout ><Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="checkin" element={<CheckIn />}></Route>
          <Route path="profile" element={<ProfileCard />}></Route>
          <Route path="List" element={<FlatListDevice />}></Route>
          <Route path="Action/:simEmi" element={<DeviceAction />}></Route>
          <Route path="InventoryList" element={<InventoryList />}></Route>
          <Route path="NewInventoryCount" element={<NewInventoryCount />}></Route>
        </Routes></Layout></UserProvider>): (<Routes><Route path='*' element={<LoginPage />}></Route></Routes>)}
      
      </div>
    </div>

  );
}

export default App;
