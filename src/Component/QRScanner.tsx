import React, { useCallback } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onScan }) => {
  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (detectedCodes.length > 0) {
        const value = detectedCodes[0].rawValue;
        onScan(value);
      }
    },
    [onScan]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: "relative" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            backgroundColor: "#003264",
            color: "#fff",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            สแกน QR Code
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </Box>

        {/* Scanner */}
        {open && (
          <Box
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              "& video": {
                objectFit: "cover",
              },
            }}
          >
            <Scanner
              onScan={handleScan}
              onError={(error: any) => console.error("Scanner error:", error)}
              constraints={{ facingMode: "environment" }}
              components={{ finder: true, torch: true }}
              styles={{
                container: {
                  width: "100%",
                  height: "100%",
                },
                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
              sound={true}
            />
          </Box>
        )}

        {/* Footer hint */}
        <Box sx={{ textAlign: "center", py: 1.5, backgroundColor: "#f5f5f5" }}>
          <Typography variant="caption" sx={{ color: "#888" }}>
            วาง QR Code ให้อยู่ในกรอบ
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;
