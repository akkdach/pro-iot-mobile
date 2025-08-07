import React, { useEffect, useRef } from 'react';
import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onScan }) => {
  const readerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // if (readerRef.current) {

    if (!open) return;
    setTimeout(() => {


      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 250,
      }, false); // verbose = false

      // const isValidQRCode = (text: string): boolean => {
      //   // ตรวจสอบรูปแบบ QR Code เช่น เป็นเลข OrderID ความยาว 6 หลัก
      //   return /^[0-9]{12}$/.test(text); //mean is number 0-9 have 12
      // };

      scanner.render(
        (decodedText) => {
          // if (isValidQRCode(decodedText)) {
            onScan(decodedText);
            console.log('decodedText',decodedText)
            scanner.clear().then(onClose);
          // } else {
            // console.warn("QR ไม่ถูกต้อง, รอสแกนใหม่...");
          // }
        },
        (error) => {
          // console.error(error);
          // scan fail ก็ไม่ต้องทำอะไร
        }
      );
      const delayRender = setTimeout(() => {

      }, 100); // รอ 100 มิลลิวินาทีก่อน render

      return () => {
        clearTimeout(delayRender);
        scanner.clear().catch((e) => console.error('Failed to clear scanner', e));
      };
      // }
    }, 1500);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent>
        <Box 
        sx={{
          borderRadius: '30px',
          height: 300,
          width: '100%'
        }}>

        <Typography
          variant="h6"
          sx={{
            mb: 2,
            backgroundColor: '#ff4848ff',
            color: 'white',
            p: 1,
            borderRadius: '10px',
            textAlign: 'center'
          }}
        >
          SCAN
        </Typography>

        <div id="reader" style={{ width: '100%' }} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;
