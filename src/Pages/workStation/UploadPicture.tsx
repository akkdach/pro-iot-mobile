import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";

const UploadPicture = ({ open, setOpen }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    setFile(f);
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่พบไฟล์',
        text: 'กรุณาเลือกรูปภาพก่อนอัพโหลด',
      });
      return;
    }

    // Show loading
    Swal.fire({
      title: 'กำลังอัพโหลด...',
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      // TODO: Replace with your actual upload endpoint
      // const response = await callApi.post('/Mobile/UploadImage', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      // Simulate upload for now
      await new Promise(resolve => setTimeout(resolve, 1500));

      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'อัพโหลดสำเร็จ!',
        text: `ไฟล์ ${file.name} ถูกอัพโหลดเรียบร้อยแล้ว`,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#2563EB',
      });

      console.log('Upload file:', file.name, 'successfully');
      handleClose();
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: 'error',
        title: 'อัพโหลดไม่สำเร็จ',
        text: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#EF4444',
      });

      console.error('Upload error:', error);
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: 2,
          border: "1px dashed #bbb",
          padding: 2,
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
        onClick={handleOpen}
      ></Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>อัปโหลดรูปภาพ</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Box
            sx={{
              mt: 1,
              border: "2px dashed #ccc",
              borderRadius: 2,
              padding: 3,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                borderColor: "#1976d2",
                backgroundColor: "#f5f9ff",
              },
            }}
            onClick={() => {
              const input = document.getElementById("upload-input");
              input && input.click();
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              คลิกเพื่อเลือกไฟล์รูปภาพ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รองรับไฟล์ .jpg, .png ขนาดไม่เกินที่ระบบกำหนด
            </Typography>
          </Box>

          <input
            id="upload-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {file && (
            <Typography sx={{ mt: 2 }} variant="body2">
              ไฟล์ที่เลือก: <strong>{file.name}</strong>
            </Typography>
          )}

          {previewUrl && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt="preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  borderRadius: 2,
                  border: "1px solid #ddd",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UploadPicture;
