/**
 * ProgressFooter Component
 * Fixed footer พร้อม progress bar และปุ่ม save/submit
 */

import React from 'react';
import { Box, Button, LinearProgress, Typography, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { CountProgress } from '../../types/counting.types';

interface ProgressFooterProps {
    progress: CountProgress;
    loading: boolean;
    disabled: boolean;
    canSubmit: boolean;
    onSave: () => void;
    onSubmit: () => void;
}

const ProgressFooter: React.FC<ProgressFooterProps> = ({
    progress,
    loading,
    disabled,
    canSubmit,
    onSave,
    onSubmit,
}) => {
    const { counted, total, percentage } = progress;

    return (
        <Box className="counting-footer">
            {/* Progress Bar */}
            <Box className="counting-progress-bar">
                <Box className="counting-progress-text">
                    <Typography variant="body2">
                        ตรวจนับแล้ว {counted}/{total} รายการ
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {percentage}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: percentage === 100 ? '#4caf50' : '#003264',
                            borderRadius: 4,
                        },
                    }}
                />
            </Box>

            {/* Action Buttons */}
            <Box className="counting-footer-buttons">
                <Button
                    variant="contained"
                    className="counting-footer-btn save"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={onSave}
                    disabled={disabled || loading}
                >
                    บันทึก
                </Button>

                <Button
                    variant="contained"
                    className="counting-footer-btn submit"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    onClick={onSubmit}
                    disabled={!canSubmit || loading}
                >
                    ส่งรายงาน
                </Button>
            </Box>
        </Box>
    );
};

export default ProgressFooter;
