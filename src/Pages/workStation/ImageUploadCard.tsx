import React, { useState } from 'react';
import { Box, Typography, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import CloseIcon from '@mui/icons-material/Close';
import { FixedImage } from './FixedImage';
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadPicture from "./UploadPicture";
import CameraCaptureFile from "../../Component/CameraCaptureToFile";
import Swal from 'sweetalert2';
import callUploadImage from '../../Services/callUploadImage';

interface ImageUploadCardProps {
    title: string;
    imageKey: string;
    orderid: string;
    seq: number;
    imageUrl?: string;
    file: File | null;
    onFileSelect: (file: File | null) => void;
    status?: 'new' | 'modified';
}

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ title, imageKey, seq, imageUrl, file, onFileSelect, status }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [openUpload, setOpenUpload] = useState(false);
    const [openCamera, setOpenCamera] = useState(false);
    const [openImagePreview, setOpenImagePreview] = useState(false);

    React.useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onFileSelect(null);
    };

    const handleUpload = () => {
        setOpenUpload(true);
    };

    const handleCamera = () => {
        setOpenCamera(true);
    };

    const onCapture = async (files: File[]) => {
        setOpenCamera(false);
        console.log("HHH ", files);
        if (files.length === 0) return;

        Swal.fire({
            icon: 'success',
            title: 'ดำเนินการเสร็จสิ้น',
            text: `อัพโหลดสำเร็จ ${files.length} รูป`,
            confirmButtonText: 'ตกลง',
        });

        onFileSelect(files[0]);
    };

    const displayImage = previewUrl || imageUrl;

    return (
        <Box sx={{ mb: 4, p: 3, borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {seq}. {title}
                </Typography>
                {/* {file && status === 'modified' && (
                    <Chip
                        label="แก้ไข"
                        color="warning"
                        size="small"
                        sx={{ ml: 2, fontWeight: 'bold' }}
                    />
                )} */}
                <Box sx={{ display: "flex", alignItems: 'center', gap: 1.5, ml: 'auto' }}>
                    <IconButton
                        onClick={() => setOpenImagePreview(true)}
                        disabled={!displayImage}
                        sx={{
                            bgcolor: displayImage ? '#F3E8FF' : '#F1F5F9',
                            color: displayImage ? '#7C3AED' : '#94A3B8',
                            '&:hover': {
                                bgcolor: '#E9D5FF',
                                transform: 'scale(1.1)',
                            },
                            '&:disabled': {
                                bgcolor: '#F1F5F9',
                                color: '#CBD5E1',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <VisibilityIcon sx={{ fontSize: 28 }} />
                    </IconButton>

                    <IconButton
                        onClick={handleCamera}
                        sx={{
                            bgcolor: '#F0FDF4',
                            color: '#16A34A',
                            '&:hover': {
                                bgcolor: '#DCFCE7',
                                transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <CameraAltIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                    {openUpload && (
                        <UploadPicture open={openUpload} setOpen={setOpenUpload} />
                    )}
                </Box>
            </Box>

            <Box
                component="label"
                sx={{
                    display: 'block',
                    border: '2px dashed #CBD5E1',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: displayImage ? '#F8FAFC' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    '&:hover': {
                        borderColor: '#3b82f6',
                        bgcolor: '#F1F5F9',
                    },
                }}
            >
                {file && status === 'modified' && (
                    <Chip
                        label="แก้ไข"
                        color="warning"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 10,
                            fontWeight: 'bold'
                        }}
                    />
                )}

                {file && (
                    <IconButton
                        size="small"
                        onClick={handleClear}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': { bgcolor: '#fee2e2' },
                            zIndex: 10
                        }}
                    >
                        <CloseIcon color="error" fontSize="small" />
                    </IconButton>
                )}

                {!displayImage ? (
                    <>
                        <DriveFolderUploadIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            คลิกเพื่อเลือกรูปภาพ
                        </Typography>
                    </>
                ) : (
                    <FixedImage
                        src={displayImage}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4, objectFit: 'contain' }}
                    />
                )}

                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        console.log("[Card onChange]", { imageKey, seq, fileName: f?.name, hasFile: !!f });
                        if (f && f.type.startsWith('image/')) {
                            onFileSelect(f);
                        }
                        e.target.value = '';
                    }}
                />
            </Box>


            {/* Camera Dialog */}
            <Dialog
                open={openCamera}
                onClose={() => setOpenCamera(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        py: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <CameraAltIcon sx={{ fontSize: 32 }} />
                    <span>ถ่ายภาพ</span>
                </DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: '#F9FAFB' }}>
                    <Box sx={{ mt: 1 }}>
                        <CameraCaptureFile onCapture={onCapture} />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                    <Button
                        onClick={() => setOpenCamera(false)}
                        variant="outlined"
                        sx={{
                            borderColor: '#D1D5DB',
                            color: '#6B7280',
                            fontWeight: 600,
                            px: 3,
                            '&:hover': {
                                borderColor: '#9CA3AF',
                                bgcolor: '#F3F4F6',
                            },
                        }}
                    >
                        ปิด
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Preview Dialog - Fullscreen */}
            <Dialog
                open={openImagePreview}
                onClose={() => setOpenImagePreview(false)}
                fullScreen
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.95)',
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                    }}
                >
                    {/* Close Button - Top Right */}
                    {/* <IconButton
                        onClick={() => setOpenImagePreview(false)}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            width: 56,
                            height: 56,
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                            },
                            zIndex: 10,
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 32 }} />
                    </IconButton> */}

                    {/* Image */}
                    {displayImage && (
                        <Box
                            component="img"
                            src={displayImage}
                            alt="Preview"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            }}
                        />
                    )}

                    {/* Bottom Close Button */}
                    <Button
                        onClick={() => setOpenImagePreview(false)}
                        variant="contained"
                        size="large"
                        startIcon={<CloseIcon />}
                        sx={{
                            position: 'absolute',
                            bottom: 32,
                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.25)',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ปิด
                    </Button>
                </Box>
            </Dialog>
        </Box>




    );
};

export default ImageUploadCard;
