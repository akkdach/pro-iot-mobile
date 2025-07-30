import React, { useState, useRef } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, Stack, IconButton, Divider, } from "@mui/material";
import { PhotoCamera, UploadFile as UploadIcon, Folder } from "@mui/icons-material";
import CameraModal from "../../Component/CameraModal";
import { useUser } from "../../Context/userContext";
import UploadHeader from "./Header";
import Swal from "sweetalert2";
import callDocu from "../../Services/callDocu";
import { uploadFile } from "../../Services/callUpload";
import CameraModalToFile from "../../Component/CameraToFileModal";

export default function UploadFile() {
  const { user } = useUser();
  const [orderId, setOrderId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [uploadedList, setUploadedList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const onCapture = (files: File[]) => {
    setFiles([...files, ...files]);
    setIsOpenCamera(false);
  }; 


  const handleSubmit = async () => {
    if (!orderId) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอก Order ID",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    if (files.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกไฟล์",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // const formData = new FormData();
    // files.forEach((file, i) => {
    //   formData.append(`files${i}`, file); // หรือ "file" ถ้า backend รองรับแค่ไฟล์เดียว
    //   console.log('formdata', formData)
    // });

    // formData.append("orderId", orderId); // หรือใช้ formData.append("path", ...)

    try {
      // const res = await callDocu.post("/FileManager/file/" + orderId, formData);

      // setUploadedList((prev) => [...prev, ...files.map((f) => f.name)]);
      // setFiles([]);
      // fileInputRef.current!.value = "";
      uploadFile(files, `FileManager/file/${orderId}`)
      Swal.fire({
        icon: "success",
        title: "อัปโหลดสำเร็จ!",
        showConfirmButton: true,

      });
      setOrderId('');
      setFiles([]);
    } catch (err) {
      console.error("❌ Upload error:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการอัปโหลด",
        text: err instanceof Error ? err.message : "",
      });
    }
  };

  return (
    <>
      <UploadHeader title="Upload File" />
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20, marginBottom: 5,
          p: 2,
        }}>

        <TextField
          fullWidth
          label="Order ID"
          variant="outlined"
          size="small"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          sx={{
            width: 220,
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 5,  // <-- ใส่ตรงนี้เพื่อทำให้ขอบโค้ง
            },
          }}
        />

        <Stack spacing={1} direction="column">
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ borderRadius: 5, width: 220 }}
          >
            เลือกไฟล์
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".xlsx,.xls,image/*"
              onChange={handleFileUpload}
            />
          </Button>

          <Button
            variant="contained"
            startIcon={<PhotoCamera />}
            onClick={() => setIsOpenCamera(true)}
            fullWidth
            sx={{ backgroundColor: "#268bbd", ":hover": { backgroundColor: "#1b6e9e" }, borderRadius: 5, }}
          >
            ถ่ายรูป
          </Button>

          <CameraModalToFile
            isOpen={isOpenCamera}
            onClose={() => setIsOpenCamera(false)}
            onCapture={onCapture}
          />
          {files.map((file, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Typography fontSize={14} noWrap>
                📎 {file.name}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  const updatedFiles = files.filter((_, i) => i !== index);
                  setFiles(updatedFiles);
                }}
              >
                ✖
              </IconButton>
            </Box>
          ))}


          <Button
            variant="contained"
            color="success"
            fullWidth
            disabled={files.length === 0 || !orderId}
            onClick={handleSubmit}
            sx={{ borderRadius: 5, }}
          >
            อัปโหลด
          </Button>
        </Stack>

      </Box>
    </>
  );
}
