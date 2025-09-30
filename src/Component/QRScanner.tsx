import React, { useEffect, useRef } from 'react';
import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onScan }) => {
  const readerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // สร้าง scanner หลังจาก div render แล้ว
    const delayInit = setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 250,
      }, false);

      scanner.render(
        (decodedText) => {
          // สแกนเสร็จ → คืนค่าให้ parent
          onScan(decodedText);
          console.log("decodedText", decodedText);

          // ล้าง scanner และปิด dialog
          scanner.clear().then(() => {
            onClose();
          }).catch((err) => console.error('Failed to clear scanner', err));
        },
        (error) => {
          // scan fail → ไม่ต้องทำอะไร
        }
      );
    }, 500); // รอ div render คร่าว ๆ

    return () => {
      clearTimeout(delayInit);
    };
  }, [open, onClose, onScan]);


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent>
        <Box
          sx={{
            borderRadius: '30px',
            height: '100%',
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
