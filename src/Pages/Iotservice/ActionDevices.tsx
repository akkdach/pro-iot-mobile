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
import Swal from 'sweetalert2';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Countdown from '../../Component/Countdown';
import QRScanner from '../../Component/QRScanner';


export default function DeviceAction() {
  const { simEmi } = useParams();
  const [deviceInfo, setDeviceInfo] = useState<{ deviceNo: string; orderId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stopTime, setStopTime] = useState<Dayjs | null>(null);
  const [battValue, setBattValue] = useState<number | null>(null);
  const [rssiValue, setRssiValue] = useState<number | null>(null);
  const [StartAt, setStartAt] = useState<string | null >(null);
  const [FinishAt, setFinishAt] = useState<string | null >(null);
  const [countdownTarget, setCountdownTarget] = useState<string | null>(null);
  const [openScanner, setOpenScanner] = useState(false);
  const [orderId, setOrderId] = useState('');



  useEffect(() => {
    async function fetchDeviceInfo() {
      try {
        // 1. หาค่า id จาก simEmi ก่อน
        const allDevices = await callDevice.get('/List_Devices');
        const match = allDevices.data.dataResult.find(
          (item: any) => item.simEmi?.trim() === simEmi?.trim()
        );

        if (!match) {
          throw new Error(`ไม่พบอุปกรณ์ที่มี simEmi = ${simEmi}`);
        }

        const deviceId = match.id;
        const deviceNo = match.deviceNo;
        const orderId = match.orderId;

        setDeviceInfo({ deviceNo, orderId }); // เก็บ deviceNo, orderId สำหรับปุ่ม Start/Stop

        // 2. ใช้ id เรียกข้อมูลละเอียด
        const workOrderRes = await callDevice.get(`/get_Devices/${deviceId}`);
        const deviceData = workOrderRes.data.dataResult;

        if (deviceData) {
          setBattValue(parseFloat(deviceData.devices?.battValue) || 0);
          setRssiValue(parseInt(deviceData.devices?.rssiValue) || 0);
          setStartAt(deviceData.lastOrder?.startAt ?? null);
          setFinishAt(deviceData.lastOrder?.finishAt ?? null);
        }
      } catch (error) {
        console.error('Error fetching device info or work order record:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeviceInfo();
  }, [simEmi]);



  const handleAction = async (action: 'Start' | 'Stop') => {
  if (!deviceInfo) return;

  let stopTimeLocal: string | null = null;

  if (stopTime) {
    const combined = new Date();
    combined.setHours(stopTime.hour(), stopTime.minute(), 0, 0);
    stopTimeLocal = combined.toString();
  }

  if (action === 'Start') {
    const now = new Date().toISOString();
    setStartAt(now); // 👈 เก็บเวลาปัจจุบันไว้
    if (stopTime) {
      setCountdownTarget(stopTime.toISOString());
    }
  }

  if ( action === 'Stop') {
    setCountdownTarget(null);
  }

  try {
    const result = await callDevice.post('/WorkOrderRecordProcess', {
      deviceNo: deviceInfo.deviceNo,
      orderId: deviceInfo.orderId,
      action,
      stopTime: stopTimeLocal,
    });

    const { isSuccess, message } = result.data;

    if (isSuccess) {
      Swal.fire({
        icon: 'success',
        title: `${action} Device สำเร็จ`,
        text: `Device ${simEmi} ถูกสั่ง "${action}" เรียบร้อยแล้ว`,
        confirmButtonColor: '#1471b8',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'คำสั่งไม่สำเร็จ',
        text: message || `ไม่สามารถสั่ง "${action}" ไปยังอุปกรณ์ ${simEmi} ได้`,
        confirmButtonColor: '#d33',
      });
    }

  } catch (error) {
    console.error(`Failed to ${action} device ${simEmi}:`, error);

    Swal.fire({
      icon: 'error',
      title: `เกิดข้อผิดพลาด`,
      text: `ไม่สามารถสั่ง "${action}" ไปยังอุปกรณ์ ${simEmi} ได้`,
      confirmButtonColor: '#d33',
    });
  }
  };

  const handleInputChange = async(e : any) => {
    const {name, value} = e.target
    var newData : any = {...deviceInfo,[name]:value}
    setDeviceInfo(newData);
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <>
        <Box sx={{ p: 2, mb:-6 }}>
          <Container maxWidth="sm" sx={{ py: 3, mt:-8 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <SensorsIcon sx={{ fontSize: 60, color: '#1cc4c4', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#003264', mb: 1 }}>
                  Device Control
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                  Device No. : {simEmi}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1}}>
                  <Typography color="textSecondary" sx={{ fontWeight: 500, }}>
                    Start Time : {StartAt ? new Date(StartAt).toLocaleString('th-TH') : '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                    Finish Time : {
                      stopTime
                        ? stopTime.format('D/M/YYYY HH:mm:ss')
                        : FinishAt
                          ? new Date(FinishAt).toLocaleString('th-TH')
                          : '-'
                    }
                  </Typography>
                </Box>

                {countdownTarget && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <Countdown targetDate={countdownTarget} />
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <BatteryIndicator level={battValue ?? 0} />
                  <WifiIndicator strength={rssiValue ?? 0} isConnected={true} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', }}>
                <TextField
                  name="orderId"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    handleInputChange(e);
                  }}
                  variant="outlined"
                  placeholder="Enter OrderID"
                  sx={{
                    height: 50,
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
                        <IconButton edge="end" size="small" onClick={() => setOpenScanner(true)}>
                          <QrCode2Icon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                </Box>

                {openScanner && (
                  <QRScanner
                    open={openScanner}
                    onClose={() => setOpenScanner(false)}
                    onScan={(value) => {
                      setOrderId(value);
                      handleInputChange({ target: { name: 'orderId', value } });
                    }}
                  />
                )}


                <Box sx={{ display: 'flex', justifyContent: 'center',  mb: 1}}>
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
                        gap: 3,
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
                      mb: 1,
                      
                    },
                  },
                }}
              /></Box>


                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  sx={{ mb: 2, py: 0.2, fontSize: 18, borderRadius: 4, maxWidth: '100%', width: 300, }}
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
                  sx={{ mb: 1, py: 0.2, fontSize: 18, borderRadius: 4, maxWidth: '100%', width: 300 }}
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
