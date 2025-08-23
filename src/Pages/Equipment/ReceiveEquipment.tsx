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

  return (
    <>
      <AppHearder title="เบิกเครื่อง" />
      <Box sx={{ p: 2, marginTop: 7, marginBottom: 8 }}>

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

        {/* ช่องกรอก Order ID */}
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
        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" sx={{ mb: 2, py: 0.2,  borderRadius: 4, maxWidth: '100%', width: 50, height:60 }}>ยกเลิก</Button>
          <Button variant="contained">บันทึก</Button>
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
