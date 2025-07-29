import React, { useRef, useState, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (files: File[]) => void;
}

const CameraCaptureFile: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

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
    <div className="flex flex-col items-center gap-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md rounded-lg shadow"
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={captureImage}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          📸 ถ่ายภาพ
        </button>

        <button
          onClick={() =>
            setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
          }
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🔄 สลับกล้อง
        </button>
      </div>
    </div>
  );
};

export default CameraCaptureFile;
