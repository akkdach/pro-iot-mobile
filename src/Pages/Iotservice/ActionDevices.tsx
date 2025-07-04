import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import StopIcon from '@mui/icons-material/Stop';
import callDevice from '../../Services/callDevice';

export default function DeviceAction() {
  const [deviceList, setDeviceList] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const result = await callDevice.get('/List_Devices');
        if (result.data.dataResult) {
          const list = result.data.dataResult.map((item: any) => item.deviceNo);
          setDeviceList(list);
        }
      } catch (error) {
        console.error('Error fetching device list:', error);
      }
    }

    fetchDevices();
  }, []);

  const handleAction = async (simEmi: string, action: 'start' | 'stop') => {
    try {
      const url = `/device/${action}`;
      const result = await callDevice.post(url, { simEmi });
      console.log(`${action} sent to ${simEmi}`, result.data);
    } catch (error) {
      console.error(`Failed to ${action} device ${simEmi}:`, error);
    }
  };

  return (
    <Box sx={{ p: 2, marginTop: '65px'}}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#004e64' }}>
        Device Control 
      </Typography>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'flex-start',
        }}
      >
        {deviceList.map((simEmi, index) => (
          <div
            key={index}
            style={{
              flex: '1 1 300px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SensorsIcon sx={{ fontSize: 28, color: '#1cc4c4', mr: 1 }} />
              <Typography
                sx={{
                  fontWeight: 500,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                }}
              >
                {simEmi}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<PowerSettingsNewIcon />}
                onClick={() => handleAction(simEmi, 'start')}
                fullWidth
              >
                Start
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<StopIcon />}
                onClick={() => handleAction(simEmi, 'stop')}
                fullWidth
              >
                Stop
              </Button>
            </Box>
          </div>
        ))}
      </div>
    </Box>
  );
}
