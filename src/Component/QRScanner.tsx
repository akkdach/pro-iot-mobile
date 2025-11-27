"use client";

import React, { useEffect, useRef, useId } from "react";
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onScan }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const readerId = useId();

  useEffect(() => {
    if (!open) {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Failed to clear scanner", err))
          .finally(() => {
            scannerRef.current = null;
          });
      }
      return;
    }

    // 🟢 รอให้ DOM render ก่อน แล้วค่อย init scanner
    const timeout = setTimeout(() => {
      const element = document.getElementById(readerId);
      if (!element) {
        console.error("DIV reader ยังไม่ถูก render");
        return;
      }

      const scanner = new Html5QrcodeScanner(
        readerId,
        { fps: 10, qrbox: 250 },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner
            .clear()
            .then(() => {
              scannerRef.current = null;
              onClose();
            })
            .catch((err) => console.error("Failed to clear scanner", err));
        },
        (error) => {
          console.log(error);
        }
      );
    }, 10); // 👈 Delay 10ms พอ (สำคัญมาก!)

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) =>
            console.error("Failed to clear scanner on unmount", err)
          )
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [open, onClose, onScan, readerId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent>
        <Box sx={{ borderRadius: "30px", height: "100%", width: "100%" }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              backgroundColor: "#ff4848ff",
              color: "white",
              p: 1,
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            SCAN
          </Typography>

          {/* ควรใช้ id ที่ unique */}
          <div id={readerId} style={{ width: "100%" }} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;
