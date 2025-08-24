// ReceiveEquipment.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { QrCode2 } from '@mui/icons-material';
import QRScanner from '../../Component/QRScanner';
import AppHearder from '../../Component/AppHeader';
import Swal from 'sweetalert2';

interface FormData {
  orderId: string;
  equipment: string;
}

export default function ReceiveEquipment() {
  const [formData, setFormData] = useState<FormData>({
    orderId: '',
    equipment: '',
  });
  const [showScanner, setShowScanner] = useState<boolean>(false);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ยกเลิก
  const handleCancel = () => {
    setFormData({
      orderId: '',
      equipment: '',
    });
    setShowScanner(false);
    console.log("ยกเลิกการกรอกข้อมูล");
  };

  // บันทึก
  const handleSave = () => {
    if (!formData.orderId || !formData.equipment) {
      Swal.fire("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    console.log("บันทึกข้อมูล:", formData);

    // TODO: call API ที่จะบันทึกลง backend ได้ เช่น:
    // axios.post('/api/receive-equipment', formData)

    alert("บันทึกสำเร็จ!");
  };

  return (
    <>
      <AppHearder title="เบิกเครื่อง" />
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
            name="orderId"
            value={formData.orderId}
            onChange={handleInputChange}
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
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => setShowScanner((prev) => !prev)}
                  >
                    <QrCode2 />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* ช่องกรอก Equiment Number */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TextField
            name="equiment"
            value={formData.orderId}
            onChange={handleInputChange}
            variant="outlined"
            placeholder="Enter Equiment"
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
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => setShowScanner((prev) => !prev)}
                  >
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
                handleInputChange({ target: { name: 'orderId', value } });
                setShowScanner(false);
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
}
