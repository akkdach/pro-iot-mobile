import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = ({onCapture}:any) => {
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('ไม่สามารถเข้าถึงกล้อง:', err);
      }
    };

    startCamera();
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    onCapture(imageData);
    setPhoto(imageData);
  };

  return (
    <div>
      <h2>กล้อง</h2>
      <video ref={videoRef} autoPlay playsInline width="100%" height="480" />
      <br />
      <button onClick={takePhoto}>📸 ถ่ายรูป</button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* {photo && (
        <div>
          <h3>รูปที่ถ่าย</h3>
          <img src={photo} alt="ถ่ายจากกล้อง" style={{width:'100%'}} />
        </div>
      )} */}
    </div>
  );
};

export default CameraCapture;
