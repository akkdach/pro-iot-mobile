import React, { useEffect, useState } from 'react';
import { Box, Typography,  } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import callDevice from '../../Services/callDevice';
import { Link } from 'react-router-dom';
import WifiIndicator from '../../Component/WifiIndicator';
import BatteryIndicator from '../../Component/BatteryIndicator';
import IotHeader from './HeaderIot';


export default function FlatListDevice() {
  const [deviceList, setDeviceList] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const result = await callDevice.get('/List_Devices');
        if (result.data.dataResult) {
          // ดึงแค่ device_no ออกมาเป็น array ของ string
          const list = result.data.dataResult.map((item: any) => item.simEmi);
          setDeviceList(list);
        }
      } catch (error) {
        console.error('Error fetching device list:', error);
      }
    }

    fetchDevices();
  }, []);

  return (
    <>
    <IotHeader title="Device List"/>
    <Box sx={{ p: 2,  }}>
      {/* <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#00416e' }}>
        Device List
      </Typography> */}

      
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'flex-start',
        }}
      >
        {deviceList.map((simEmi, index) => (
        <Link
            to={`/Action/${simEmi}`} // หรือ `/Action/${deviceNo}` ถ้าอยากเจาะจง
            key={index}
            style={{
            textDecoration: 'none',
            color: 'inherit',
            flex: '1 1 280px',
            minWidth: 300,
            }}
        >
            <div
            style={{
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                flexWrap:'wrap'
            }}
            >
            <SensorsIcon style={{ fontSize: 30, color: '#1cc4c4', marginRight: 12 }} />
            <Typography
                sx={{
                fontWeight: 500,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
                }}
            >
                Device Number : {simEmi}
            </Typography>
            <BatteryIndicator level={60} />
            <WifiIndicator strength={2} isConnected={true} />
            </div>
        </Link>
        ))}
      </div>
      
    </Box>
    </>
  );
}
