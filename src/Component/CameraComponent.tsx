import React, { useRef, useEffect } from 'react';

const CameraComponent = () => {
  const videoRef = useRef<any>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    getCameraStream();
  }, []);

  return (
    <div>
      <h2>Camera Preview</h2>
      <video ref={videoRef} autoPlay playsInline width="640" height="480" />
    </div>
  );
};

export default CameraComponent;
