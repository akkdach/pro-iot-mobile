/**
 * NumericKeypad Component
 * Mobile-friendly numeric keypad overlay
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BackspaceIcon from '@mui/icons-material/Backspace';
import CheckIcon from '@mui/icons-material/Check';

interface NumericKeypadProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (value: number) => void;
    initialValue?: number;
    title?: string;
    unit?: string;
    max?: number;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
    open,
    onClose,
    onConfirm,
    initialValue = 0,
    title = 'ใส่จำนวน',
    unit = 'ชิ้น',
    max = 9999,
}) => {
    const [value, setValue] = useState<string>(String(initialValue));

    useEffect(() => {
        if (open) {
            setValue(String(initialValue));
        }
    }, [open, initialValue]);

    const handleKeyPress = useCallback((key: string) => {
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        if (key === 'clear') {
            setValue('0');
            return;
        }

        if (key === 'backspace') {
            setValue(prev => {
                const newVal = prev.slice(0, -1);
                return newVal === '' ? '0' : newVal;
            });
            return;
        }

        setValue(prev => {
            const newVal = prev === '0' ? key : prev + key;
            const numVal = parseInt(newVal, 10);
            if (numVal > max) return prev;
            return newVal;
        });
    }, [max]);

    const handleConfirm = useCallback(() => {
        const numValue = parseInt(value, 10) || 0;
        onConfirm(numValue);
        onClose();
    }, [value, onConfirm, onClose]);

    if (!open) return null;

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'];

    return (
        <Box className="counting-keypad-overlay" onClick={onClose}>
            <Box className="counting-keypad" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <Box className="counting-keypad-header">
                    <Typography className="counting-keypad-title">{title}</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Display */}
                <Box className="counting-keypad-display">
                    <Typography component="span" className="counting-keypad-value">
                        {value}
                    </Typography>
                    <Typography component="span" className="counting-keypad-unit">
                        {unit}
                    </Typography>
                </Box>

                {/* Keypad Grid */}
                <Box className="counting-keypad-grid">
                    {keys.map((key) => (
                        <Button
                            key={key}
                            variant={key === 'clear' ? 'contained' : 'outlined'}
                            className={`counting-keypad-btn ${key === 'clear' ? 'clear' : ''}`}
                            onClick={() => handleKeyPress(key)}
                        >
                            {key === 'clear' ? 'C' : key === 'backspace' ? <BackspaceIcon /> : key}
                        </Button>
                    ))}
                </Box>

                {/* Confirm Button */}
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        className="counting-keypad-btn confirm"
                        onClick={handleConfirm}
                        startIcon={<CheckIcon />}
                    >
                        ยืนยัน
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default NumericKeypad;
