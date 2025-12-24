import React, { useState } from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import CloseIcon from '@mui/icons-material/Close';

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
                    <Box
                        component="img"
                        src={displayImage}
                        alt="Preview"
                        sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, objectFit: 'contain' }}
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
        </Box>
    );
};

export default ImageUploadCard;
