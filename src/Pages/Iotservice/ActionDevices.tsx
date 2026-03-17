import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import StopIcon from '@mui/icons-material/Stop';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import callDevice from '../../Services/callDevice';
import WifiIndicator from '../../Component/WifiIndicator';
import BatteryIndicator from '../../Component/BatteryIndicator';
import Swal from 'sweetalert2';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import QRScanner from '../../Component/QRScanner';
import './ActionPages.css';

export default function DeviceAction() {
  const { simEmi } = useParams();
  const [deviceInfo, setDeviceInfo] = useState<{ deviceNo: string; orderId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stopTime, setStopTime] = useState<Dayjs | null>(null);
  const [battValue, setBattValue] = useState<number | null>(null);
  const [rssiValue, setRssiValue] = useState<number | null>(null);
  const [StartAt, setStartAt] = useState<string | null>(null);
  const [FinishAt, setFinishAt] = useState<string | null>(null);
  const [countdownTarget, setCountdownTarget] = useState<string | null>(null);
  const [openScanner, setOpenScanner] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    async function fetchDeviceInfo() {
      try {
        const allDevices = await callDevice.get('/get_Devices_by_sn/' + simEmi);
        const match = allDevices.data.dataResult.devices;
        if (!match) {
          throw new Error(`ไม่พบอุปกรณ์ที่มี simEmi = ${simEmi}`);
        }
        if (match.finishAt) {
          setCountdownTarget(match.finishAt);
        }

        const deviceId = match.id;
        const deviceNo = match.deviceNo;
        const orderId = match.orderId;

        setDeviceInfo({ deviceNo, orderId });

        if (match) {
          setBattValue(parseFloat(match?.battValue) || 0);
          setRssiValue(parseInt(match?.rssiValue) || 0);
          setStartAt(match?.startAt ?? null);
          setFinishAt(match?.finishAt ?? null);
        }
      } catch (error) {
        console.error('Error fetching device info or work order record:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeviceInfo();
  }, []);

  const handleCountDown = async (action: 'Start' | 'Stop') => {
    if (action === 'Start') {
      const now = new Date().toISOString();
      setStartAt(now);
      if (stopTime) {
        setCountdownTarget(stopTime.toISOString());
      }
    }
    if (action === 'Stop') {
      setCountdownTarget(null);
    }
  };

  const handleAction = async (action: 'Start' | 'Stop') => {
    if (!deviceInfo) return;

    handleCountDown(action);
    let stopTimeLocal: string | null = null;

    if (stopTime) {
      const combined = new Date();
      combined.setHours(stopTime.hour(), stopTime.minute(), 0, 0);
      stopTimeLocal = combined.toString();
    }
    const now = new Date().toISOString();
    if (action === 'Start') {
      setStartAt(now);
      if (stopTime) {
        setCountdownTarget(stopTime.toISOString());
      }
    }

    if (action === 'Stop') {
      setCountdownTarget(null);
    }

    try {
      const result = await callDevice.post('/WorkOrderRecordProcess', {
        deviceNo: deviceInfo.deviceNo,
        orderId: deviceInfo.orderId,
        action,
        startAt: now,
        finishAt: stopTime,
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

  const handleInputChange = async (e: any) => {
    const { name, value } = e.target;
    var newData: any = { ...deviceInfo, [name]: value };
    setDeviceInfo(newData);
  };

  // Countdown display helper
  const getCountdownDisplay = () => {
    if (!countdownTarget) return null;
    const diff = +new Date(countdownTarget) - +new Date();
    if (diff <= 0) return '00:00:00';
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="action-loading">
        <CircularProgress size={48} sx={{ color: '#1cc4c4' }} />
        <span className="action-loading-text">Loading device info...</span>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        {/* Device Hero */}
        <div className="device-hero">
          <div className="hero-icon-ring">
            <SensorsIcon style={{ fontSize: 42, color: '#1cc4c4' }} />
          </div>
          <span className="hero-device-label">Device No.</span>
          <span className="hero-device-number">{simEmi}</span>
          <span className="hero-subtitle">Device Control Panel</span>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-card-title">Device Information</div>

          <div className="info-card-row">
            <div className="info-card-icon">
              <AssignmentIcon style={{ fontSize: 17, color: '#6b7fa3' }} />
            </div>
            <span className="info-card-label">Order ID</span>
            <span className="info-card-value">{deviceInfo?.orderId || '—'}</span>
          </div>

          <div className="info-card-row">
            <div className="info-card-icon">
              <AccessTimeIcon style={{ fontSize: 17, color: '#6b7fa3' }} />
            </div>
            <span className="info-card-label">Start Time</span>
            <span className="info-card-value">
              {StartAt ? new Date(StartAt).toLocaleString('th-TH') : '—'}
            </span>
          </div>

          <div className="info-card-row">
            <div className="info-card-icon">
              <EventAvailableIcon style={{ fontSize: 17, color: '#6b7fa3' }} />
            </div>
            <span className="info-card-label">Finish Time</span>
            <span className="info-card-value">
              {stopTime
                ? stopTime.format('D/M/YYYY HH:mm:ss')
                : FinishAt
                  ? new Date(FinishAt).toLocaleString('th-TH')
                  : '—'}
            </span>
          </div>
        </div>

        {/* Countdown */}
        {countdownTarget && (
          <div className="countdown-card">
            <div className="countdown-label">Countdown</div>
            <div className="countdown-timer">{getCountdownDisplay()}</div>
          </div>
        )}

        {/* Indicators */}
        <div className="indicators-row">
          <BatteryIndicator level={battValue ?? 0} />
          <WifiIndicator strength={rssiValue ?? 0} isConnected={true} />
        </div>

        {/* Form Inputs */}
        <div className="form-section">
          <TextField
            name="orderId"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value);
              handleInputChange(e);
            }}
            variant="outlined"
            placeholder="Enter Order ID"
            className="styled-input"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                boxShadow: '0px 2px 12px rgba(0, 50, 100, 0.06)',
                '& fieldset': { borderColor: 'rgba(0, 50, 100, 0.1)' },
                '&:hover fieldset': { borderColor: '#1cc4c4' },
                '&.Mui-focused fieldset': { borderColor: '#1cc4c4' },
              },
              '& input': { padding: '14px 16px' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" size="small" onClick={() => setOpenScanner(true)}>
                    <QrCode2Icon sx={{ color: '#6b7fa3' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

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

          <TimePicker
            label="Stop Time"
            value={stopTime}
            onChange={(newValue) => setStopTime(newValue)}
            ampm={false}
            slotProps={{
              textField: {
                className: 'styled-input',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 2px 12px rgba(0, 50, 100, 0.06)',
                    '& fieldset': { borderColor: 'rgba(0, 50, 100, 0.1)' },
                    '&:hover fieldset': { borderColor: '#1cc4c4' },
                    '&.Mui-focused fieldset': { borderColor: '#1cc4c4' },
                  },
                  '& input': { padding: '14px 16px' },
                },
              },
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="action-btn start"
            onClick={() => handleAction('Start')}
            disabled={!deviceInfo}
          >
            <PowerSettingsNewIcon style={{ fontSize: 22 }} />
            START DEVICE
          </button>

          <button
            className="action-btn stop"
            onClick={() => handleAction('Stop')}
            disabled={!deviceInfo}
          >
            <StopIcon style={{ fontSize: 22 }} />
            STOP DEVICE
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
