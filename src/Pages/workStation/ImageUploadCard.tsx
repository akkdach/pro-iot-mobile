import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import Swal from 'sweetalert2';
import callApi from '../../Services/callApi';

interface ImageUploadCardProps {
    title: string;
    imageKey: string;
    orderid: string;
    seq: number;
}

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ title, imageKey, orderid, seq }) => {
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);

    const handleClear = () => {
        setUploadFile(null);
        setUploadPreview(null);
        const input = document.getElementById(`upload-input-${imageKey}-${seq}`) as HTMLInputElement;
        if (input) input.value = '';
    };

    const handleUpload = async () => {
        if (!uploadFile) return;

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
            formData.append('file', uploadFile);
            formData.append('key', imageKey);
            formData.append('order_id', orderid);
            formData.append('seq', seq.toString());

            // Replace with your actual API endpoint
            // await callApi.post('/Mobile/UploadImageByKey', formData, {
            //   headers: { 'Content-Type': 'multipart/form-data' },
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Uploaded:', { imageKey, orderid, seq, file: uploadFile.name });

            Swal.close();
            await Swal.fire({
                icon: 'success',
                title: 'อัพโหลดสำเร็จ!',
                text: `อัพโหลดรูปภาพสำหรับ "${title}" เรียบร้อยแล้ว`,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#2563EB',
            });

            handleClear();

        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'อัพโหลดไม่สำเร็จ',
                text: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
                confirmButtonText: 'ปิด',
                confirmButtonColor: '#EF4444',
            });
        }
    };

    return (
        <Box sx={{ mb: 4, p: 3, borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                {seq}. {title}
            </Typography>

            <Box
                sx={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: uploadFile ? '#F8FAFC' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: '#3b82f6',
                        bgcolor: '#F1F5F9',
                    },
                }}
                onClick={() => document.getElementById(`upload-input-${imageKey}-${seq}`)?.click()}
            >
                {!uploadPreview ? (
                    <>
                        <DriveFolderUploadIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            คลิกเพื่อเลือกรูปภาพ
                        </Typography>
                    </>
                ) : (
                    <Box
                        component="img"
                        src={uploadPreview}
                        alt="Preview"
                        sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, objectFit: 'contain' }}
                    />
                )}
            </Box>

            <input
                id={`upload-input-${imageKey}-${seq}`}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.type.startsWith('image/')) {
                        setUploadFile(f);
                        setUploadPreview(URL.createObjectURL(f));
                    }
                }}
            />

            {uploadFile && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" size="small" onClick={handleClear} color="inherit">
                        ยกเลิก
                    </Button>
                    <Button variant="contained" size="small" onClick={handleUpload} sx={{ bgcolor: '#2563EB' }}>
                        อัพโหลด
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ImageUploadCard;
