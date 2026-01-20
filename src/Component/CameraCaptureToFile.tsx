import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Stack } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";

interface CameraCaptureProps {
  onCapture: (files: File[]) => void;
}

const CameraCaptureFile: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [photos, setPhotos] = useState<File[]>([]);

  // Start camera
  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  // Capture photo
  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.png`, {
            type: blob.type,
          });
          onCapture([file]);
        }
      }, "image/png");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        playsInline
        sx={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          bgcolor: '#000',
        }}
      />

      <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: '600px', justifyContent: 'center' }}>
        <Button
          onClick={captureImage}
          variant="contained"
          size="large"
          startIcon={<CameraAltIcon sx={{ fontSize: 28 }} />}
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            py: 2,
            px: 4,
            borderRadius: 2.5,
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(22, 163, 74, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          ถ่ายภาพ
        </Button>

        <Button
          onClick={() =>
            setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
          }
          variant="contained"
          size="large"
          startIcon={<FlipCameraAndroidIcon sx={{ fontSize: 28 }} />}
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            py: 2,
            px: 4,
            borderRadius: 2.5,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          สลับกล้อง
        </Button>
      </Stack>
    </Box>
  );
};

export default CameraCaptureFile;
