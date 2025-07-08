import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import StopIcon from '@mui/icons-material/Stop';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import callDevice from '../../Services/callDevice';
import WifiIndicator from '../../Component/WifiIndicator';
import BatteryIndicator from '../../Component/BatteryIndicator';
import IotHeader from './HeaderIot';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export default function DeviceAction() {
  const { simEmi } = useParams();
  const [deviceInfo, setDeviceInfo] = useState<{ deviceNo: string; orderId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stopTime, setStopTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    async function fetchDeviceInfo() {
      try {
        const result = await callDevice.get('/List_Devices');
        if (result.data.dataResult) {
          const match = result.data.dataResult.find(
            (item: any) => item.simEmi?.trim() === simEmi?.trim()
          );
          if (match) {
            setDeviceInfo({ deviceNo: match.deviceNo, orderId: match.orderId });
          }
        }
      } catch (error) {
        console.error('Error fetching device info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeviceInfo();
  }, [simEmi]);

  const handleAction = async (action: 'Start' | 'Stop') => {
    if (!deviceInfo || !stopTime) return;

    const combined = new Date();
    combined.setHours(stopTime.hour(), stopTime.minute(), 0, 0);

    const stopTimeLocal = combined.toString(); // หรือ toLocaleString()


    try {
      const result = await callDevice.post('/WorkOrderRecordProcess', {
        deviceNo: deviceInfo.deviceNo,
        orderId: deviceInfo.orderId,
        action,
        stopTime: stopTimeLocal,
      });
      console.log(`${action} sent to ${deviceInfo.deviceNo}`, result.data);
    } catch (error) {
      console.error(`Failed to ${action} device ${deviceInfo.deviceNo}:`, error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <>
        <IotHeader title="Device Control" />
        <Box sx={{ p: 2, marginTop: '10px' }}>
          <Container maxWidth="sm" sx={{ py: 3 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <SensorsIcon sx={{ fontSize: 60, color: '#1cc4c4', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#003264', mb: 1 }}>
                  Device Control
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
                  SIM: {simEmi}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <BatteryIndicator level={0} />
                  <WifiIndicator strength={2} isConnected={true} />
                </Box>

                <TextField
                  variant="outlined"
                  placeholder="Enter OrderID"
                  sx={{
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                    width: 300,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                      '& fieldset': {
                        borderColor: '#ddd',
                      },
                    },
                    '& input': {
                      padding: '12px 14px',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" size="small">
                          <QrCode2Icon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TimePicker
                label="เลือกเวลาหยุด (Stop Time)"
                value={stopTime}
                onChange={(newValue) => setStopTime(newValue)}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      sx: {
                        height: 50,
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                        '& fieldset': {
                          borderColor: '#ddd',
                        },
                        '& input': {
                          padding: '12px 14px',
                        },
                      },
                    },
                    sx: {
                      fontWeight: 500,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                      width: 300,
                      mb: 2,
                      
                    },
                  },
                }}
              />


                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  sx={{ mb: 2, py: 0.5, fontSize: 18, borderRadius: 4 }}
                  startIcon={<StopIcon />}
                  onClick={() => handleAction('Stop')}
                  disabled={!deviceInfo}
                >
                  STOP DEVICE
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  sx={{ mb: 2, py: 0.5, fontSize: 18, borderRadius: 4 }}
                  startIcon={<PowerSettingsNewIcon />}
                  onClick={() => handleAction('Start')}
                  disabled={!deviceInfo}
                >
                  START DEVICE
                </Button>
              </>
            )}
          </Container>
        </Box>
      </>
    </LocalizationProvider>
  );
}
