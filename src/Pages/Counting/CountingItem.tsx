/**
 * CountingItem Component
 * แถวสินค้าสำหรับตรวจนับ พร้อมปุ่ม +/- และสถานะสี
 */

import React, { useState } from 'react';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import { CountLine, InventoryItem, MismatchReason } from '../../types/counting.types';
import NumericKeypad from './NumericKeypad';
import ReasonSheet from './ReasonSheet';

interface CountingItemProps {
    line: CountLine;
    item?: InventoryItem;
    onCountChange: (line: CountLine, qty: number, reason?: MismatchReason) => void;
    onIncrement: (line: CountLine) => void;
    onDecrement: (line: CountLine) => void;
}

const CountingItem: React.FC<CountingItemProps> = ({
    line,
    item,
    onCountChange,
    onIncrement,
    onDecrement,
}) => {
    const [keypadOpen, setKeypadOpen] = useState(false);
    const [reasonSheetOpen, setReasonSheetOpen] = useState(false);
    const [pendingQty, setPendingQty] = useState<number | null>(null);

    const displayQty = line.countedQty ?? line.systemQty;
    const difference = displayQty - line.systemQty;

    const handleKeypadConfirm = (qty: number) => {
        const diff = qty - line.systemQty;

        // If mismatch, show reason sheet
        if (diff !== 0) {
            setPendingQty(qty);
            setReasonSheetOpen(true);
        } else {
            onCountChange(line, qty);
        }
    };

    const handleReasonSelect = (reason: MismatchReason) => {
        if (pendingQty !== null) {
            onCountChange(line, pendingQty, reason);
            setPendingQty(null);
        }
    };

    const handleIncrement = () => {
        const newQty = displayQty + 1;
        if (newQty > line.systemQty && !line.reason) {
            // Will be over, need reason
            setPendingQty(newQty);
            setReasonSheetOpen(true);
        } else {
            onIncrement(line);
        }
    };

    const handleDecrement = () => {
        const newQty = displayQty - 1;
        if (newQty < line.systemQty && !line.reason) {
            // Will be under, need reason
            setPendingQty(newQty);
            setReasonSheetOpen(true);
        } else {
            onDecrement(line);
        }
    };

    const statusClass = line.countedQty === null ? 'pending' : line.status;

    return (
        <>
            <Box className={`counting-item status-${statusClass}`} sx={{ p: 1.5, mb: 1.5, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* Top Section - Product Info (2 rows) */}
                <Box className="counting-item-header" sx={{ mb: 1 }}>
                    {/* Row 1: SKU / Name */}
                    <Typography className="counting-item-title" sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, mb: 0.5, color: '#1E293B' }}>
                        {item?.sku || line.itemId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item?.name || line.itemId}
                    </Typography>
                </Box>

                {/* Bottom Row - Icon, Location, Controls */}
                <Box className="counting-item-row" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Left: System Qty & Loc */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: 2, bgcolor: '#F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B'
                        }}>
                            {item?.iconUrl ? <img src={item.iconUrl} alt="" style={{ width: 24 }} /> : <InventoryIcon sx={{ fontSize: 20 }} />}
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', lineHeight: 1 }}>
                                System
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>
                                {line.systemQty} {item?.uom || 'pcs'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right: Controls */}
                    <Box className="counting-qty-controls" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                            className="counting-qty-btn"
                            onClick={handleDecrement}
                            disabled={displayQty <= 0}
                            size="small"
                            sx={{ bgcolor: '#F1F5F9', borderRadius: 2, width: 32, height: 32, color: '#003264' }}
                        >
                            <RemoveIcon fontSize="small" />
                        </IconButton>

                        <TextField
                            className="counting-qty-input"
                            value={displayQty}
                            onClick={() => setKeypadOpen(true)}
                            InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                                sx: { textAlign: 'center', fontWeight: 700, color: '#003264', fontSize: '1.1rem' }
                            }}
                            variant="standard"
                            sx={{ width: 50, textAlign: 'center', '& input': { textAlign: 'center' } }}
                        />

                        <IconButton
                            className="counting-qty-btn"
                            onClick={handleIncrement}
                            size="small"
                            sx={{ bgcolor: '#003264', borderRadius: 2, width: 32, height: 32, color: '#fff', '&:hover': { bgcolor: '#002142' } }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Numeric Keypad */}
            <NumericKeypad
                open={keypadOpen}
                onClose={() => setKeypadOpen(false)}
                onConfirm={handleKeypadConfirm}
                initialValue={displayQty}
                title={item?.name || 'ใส่จำนวน'}
                unit={item?.uom || 'ชิ้น'}
            />

            {/* Reason Sheet */}
            <ReasonSheet
                open={reasonSheetOpen}
                onClose={() => {
                    setReasonSheetOpen(false);
                    setPendingQty(null);
                }}
                onSelect={handleReasonSelect}
                itemName={item?.name}
                difference={pendingQty !== null ? pendingQty - line.systemQty : difference}
            />
        </>
    );
};

export default CountingItem;
