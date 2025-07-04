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
const token = localStorage.getItem('token');
function App() {
  return (
    <div className="App">
              {/* <TopBar /> */}
        <div >
      <Layout >

        {token ? (<UserProvider><Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="checkin" element={<CheckIn />}></Route>
          <Route path="profile" element={<ProfileCard />}></Route>
          <Route path="InventoryList" element={<InventoryList />}></Route>
          <Route path="NewInventoryCount" element={<NewInventoryCount />}></Route>
        </Routes></UserProvider>): (<Routes><Route path='*' element={<LoginPage />}></Route></Routes>)}
      </Layout>
      </div>
    </div>

  );
}

export default App;
