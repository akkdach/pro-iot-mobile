/**
 * ActionBar Component
 * Header bar สำหรับสร้างใบตรวจนับ แสดงข้อมูลรถ และ Sync status
 */

import React from 'react';
import { Box, Button, IconButton, Typography, Badge, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Vehicle } from '../../types/counting.types';

interface ActionBarProps {
    vehicle: Vehicle | null;
    sheetCode?: string;
    online: boolean;
    queueCount: number;
    loading: boolean;
    onCreateSheet: () => void;
    onSync: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
    vehicle,
    sheetCode,
    online,
    queueCount,
    loading,
    onCreateSheet,
    onSync,
}) => {
    return (
        <Box className="counting-action-bar">
            <Box className="counting-action-bar-content">
                {/* Vehicle Info or Create Button */}
                {vehicle ? (
                    <Box className="counting-vehicle-info">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShippingIcon sx={{ color: '#003264', fontSize: 20 }} />
                            <Typography className="counting-vehicle-name">
                                {vehicle.name}
                            </Typography>
                        </Box>
                        <Typography className="counting-vehicle-code">
                            รหัสรถ: {vehicle.code}
                            {sheetCode && ` | ใบตรวจนับ: ${sheetCode}`}
                        </Typography>
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        onClick={onCreateSheet}
                        disabled={loading}
                        sx={{
                            bgcolor: '#003264',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            flex: 1,
                            py: 1.5,
                        }}
                    >
                        {loading ? 'กำลังโหลด...' : 'สร้างใบตรวจนับ'}
                    </Button>
                )}

                {/* Sync Button */}
                {vehicle && (
                    <Box className="counting-sync-badge">
                        <IconButton
                            onClick={onSync}
                            disabled={loading || !online}
                            sx={{
                                bgcolor: online ? '#e8f5e9' : '#ffebee',
                                '&:hover': {
                                    bgcolor: online ? '#c8e6c9' : '#ffcdd2',
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : online ? (
                                queueCount > 0 ? (
                                    <SyncIcon sx={{ color: '#ff9800' }} />
                                ) : (
                                    <CloudDoneIcon sx={{ color: '#4caf50' }} />
                                )
                            ) : (
                                <CloudOffIcon sx={{ color: '#f44336' }} />
                            )}
                        </IconButton>
                        {queueCount > 0 && (
                            <Box className="badge">{queueCount}</Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* Offline Banner */}
            {!online && vehicle && (
                <Box className="counting-offline-banner" sx={{ mt: 1, mx: -2, mb: -1.5, px: 2, py: 1 }}>
                    <CloudOffIcon fontSize="small" />
                    <Typography variant="body2">
                        โหมดออฟไลน์ - การเปลี่ยนแปลงจะ sync เมื่อมีสัญญาณ
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default ActionBar;
