/**
 * VehicleSelector Component
 * Dialog เลือกรถ/ทีมงานก่อนเริ่มตรวจนับ
 */

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Box,
    Typography,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Vehicle } from '../../types/counting.types';

interface VehicleSelectorProps {
    open: boolean;
    onClose: () => void;
    vehicles: Vehicle[];
    loading: boolean;
    onSelect: (vehicle: Vehicle) => void;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
    open,
    onClose,
    vehicles,
    loading,
    onSelect,
}) => {
    const handleSelect = (vehicle: Vehicle) => {
        onSelect(vehicle);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3 },
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
                เลือกรถ/ทีมงาน
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : vehicles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                            ไม่พบรถที่ผูกกับบัญชีของคุณ
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {vehicles.map((vehicle) => (
                            <ListItem key={vehicle.id} disablePadding>
                                <ListItemButton
                                    onClick={() => handleSelect(vehicle)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        border: '1px solid #e0e0e0',
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 50, 100, 0.05)',
                                            borderColor: '#003264',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <LocalShippingIcon sx={{ color: '#003264' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={vehicle.name}
                                        secondary={`รหัส: ${vehicle.code}`}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default VehicleSelector;
