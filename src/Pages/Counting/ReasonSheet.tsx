/**
 * ReasonSheet Component
 * Bottom sheet สำหรับเลือกเหตุผลเมื่อจำนวนไม่ตรง
 */

import React, { useState } from 'react';
import { Box, Button, Drawer, Typography, TextField } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MismatchReason } from '../../types/counting.types';

interface ReasonOption {
    value: MismatchReason;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const reasonOptions: ReasonOption[] = [
    {
        value: 'lost',
        label: 'สูญหาย',
        icon: <ErrorOutlineIcon />,
        description: 'ไม่พบสินค้า อาจหายหรือถูกโจรกรรม',
    },
    {
        value: 'used',
        label: 'ใช้งานแล้ว',
        icon: <BuildIcon />,
        description: 'ใช้ในงานซ่อมแต่ยังไม่บันทึกเบิก',
    },
    {
        value: 'found',
        label: 'พบเพิ่ม',
        icon: <AddCircleOutlineIcon />,
        description: 'พบสินค้าเกินกว่าในระบบ',
    },
    {
        value: 'other',
        label: 'อื่นๆ',
        icon: <MoreHorizIcon />,
        description: 'ระบุเหตุผลเพิ่มเติม',
    },
];

interface ReasonSheetProps {
    open: boolean;
    onClose: () => void;
    onSelect: (reason: MismatchReason, note?: string) => void;
    itemName?: string;
    difference?: number; // positive = over, negative = under
}

const ReasonSheet: React.FC<ReasonSheetProps> = ({
    open,
    onClose,
    onSelect,
    itemName,
    difference = 0,
}) => {
    const [selected, setSelected] = useState<MismatchReason | null>(null);
    const [note, setNote] = useState<string>('');

    const handleSelect = (reason: MismatchReason) => {
        setSelected(reason);
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    };

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected, selected === 'other' ? note : undefined);
            setSelected(null);
            setNote('');
            onClose();
        }
    };

    const handleClose = () => {
        setSelected(null);
        setNote('');
        onClose();
    };

    // Filter options based on difference
    const filteredOptions = reasonOptions.filter(opt => {
        if (difference > 0) {
            // Over count - show found or other
            return opt.value === 'found' || opt.value === 'other';
        }
        // Under count - show lost, used, or other
        return opt.value !== 'found';
    });

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: { borderRadius: '20px 20px 0 0' },
            }}
        >
            <Box className="counting-reason-sheet">
                <Typography className="counting-reason-title">
                    {difference < 0 ? 'ทำไมจำนวนน้อยกว่า?' : 'ทำไมจำนวนมากกว่า?'}
                </Typography>

                {itemName && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', mb: 2 }}
                    >
                        {itemName} (ต่าง {Math.abs(difference)} ชิ้น)
                    </Typography>
                )}

                <Box className="counting-reason-options">
                    {filteredOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant="outlined"
                            className={`counting-reason-btn ${selected === option.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                            startIcon={option.icon}
                        >
                            <Box sx={{ textAlign: 'left', flex: 1 }}>
                                <Typography fontWeight={600}>{option.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {option.description}
                                </Typography>
                            </Box>
                        </Button>
                    ))}
                </Box>

                {/* Note field for "other" reason */}
                {selected === 'other' && (
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="ระบุเหตุผล..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                )}

                {/* Confirm button */}
                <Button
                    variant="contained"
                    fullWidth
                    disabled={!selected || (selected === 'other' && !note.trim())}
                    onClick={handleConfirm}
                    sx={{
                        mt: 2,
                        minHeight: 48,
                        borderRadius: 3,
                        bgcolor: 'var(--counting-primary)',
                    }}
                >
                    ยืนยัน
                </Button>
            </Box>
        </Drawer>
    );
};

export default ReasonSheet;
