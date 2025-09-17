// ReceiveEquipment.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { QrCode2 } from '@mui/icons-material';
import QRScanner from '../../Component/QRScanner';
import AppHearder from '../../Component/AppHeader';
import Swal from 'sweetalert2';
import callApi from '../../Services/callApi';

export interface Receive{
    equipmentSerialNo?: string
    orderID?: string
    activity?: string
    status?: string
    remarks?: string
}

export default function WithdrawEquipment() {
  const [formData, setFormData] = useState<Receive>({
    orderID: '',
    equipmentSerialNo: '',
  });
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanField, setScanField] = useState<"equipmentSerialNo" | "orderID" | null>(null);
  
  const orderIdRef = useRef<HTMLInputElement>(null);
  const equipmentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // focus ตอนเข้ามาหน้าแรก
    orderIdRef.current?.focus();
  }, []);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ยกเลิก
  const handleCancel = () => {
    setFormData({
      orderID: '',
      equipmentSerialNo: '',
    });
    setShowScanner(false);
    console.log("ยกเลิกการกรอกข้อมูล");
    //กดยกเลิกแล้วให้กลับไปfocusที่ช่องorderID
    orderIdRef.current?.focus();
  };

  // บันทึก (call API)
  const handleSave = async () => {
    if (!formData.orderID || !formData.equipmentSerialNo) {
      Swal.fire({
        icon: "error",
        title: 'กรุณากรอกข้อมูลให้ครบ'});
      return;
    }

    setLoading(true);
    try {
      const res = await callApi.post('/EquipmentTransaction/receive', formData);

      if (res.data?.isSuccess) {
        Swal.fire('รับเครื่องสำเร็จ', '', 'success');
        setFormData({ orderID: '', equipmentSerialNo: '' });
        //หลังบันทึกเสร็จ focus ที่ orderID ใหม่
        orderIdRef.current?.focus();
      } else {
        Swal.fire('รับเครื่องไม่สำเร็จ', res.data?.message || '', 'error');
      }
    } catch (error: any) {
      console.error('Error withdraw:', error);
      Swal.fire('เกิดข้อผิดพลาด', error?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHearder title="รับเครื่อง" />
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginTop: 25, marginBottom: 5,
          p: 2,
        }}>

        {/* ช่องกรอก Order ID */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TextField
            inputRef={orderIdRef}
            name="orderID"
            onChange={handleInputChange}
            variant="outlined"
            value={formData.orderID}
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
                  <IconButton onClick={() => { setScanField("orderID"); setShowScanner(true); }}>
                    <QrCode2 />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                equipmentRef.current?.focus(); // ถ้ากด Enter ข้ามไปช่องถัดไป
              }
            }}
          />
        </Box>

        {/* ช่องกรอก Equiment Number */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TextField
            name="equipmentSerialNo"
            onChange={handleInputChange}
            inputRef={equipmentRef}
            variant="outlined"
            value={formData.equipmentSerialNo}
            placeholder="Enter Equipment"
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
                  <IconButton onClick={() => { setScanField("equipmentSerialNo"); setShowScanner(true); }}>
                    <QrCode2 />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* ปุ่ม Action */}
        <Box mt={3} display="flex" justifyContent="center" gap={1}>
          <Button variant="outlined"
            onClick={handleCancel}
            sx={{ mb: 2, py: 0.2,  borderRadius: 4, maxWidth: '100%', width: 50, height: 45, color:'#999999', borderColor: '#b3b3b3' }}>
            ยกเลิก
          </Button>
          <Button variant="contained"
            onClick={handleSave}
            sx={{ mb: 2, py: 0.2,  borderRadius: 4, maxWidth: '100%', width: 50, height: 45, backgroundColor: '#328a4b' }}>
            บันทึก
          </Button>
        </Box>

        {/* แสดง QRScanner แบบฝังในหน้า */}
        {showScanner && (
          <Box mt={4}>
            <QRScanner
              open={showScanner} // ถ้า QRScanner ยัง require prop `open`
              onClose={() => setShowScanner(false)}
              onScan={(value) => {
                if (scanField) {
                  handleInputChange({ target: { name: scanField, value } });
                }
                setShowScanner(false);
                setScanField(null);
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
}
