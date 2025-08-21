// EquipmentDashboardMobileTwoColumn.tsx
import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from '@mui/material';
import AppHearder from '../../Component/AppHeader';
import ReceiveEquipmentModal from './ReceiveEquipmentModal';

const EquipmentDashboard = () => {
    const [receiveEquipmentModalOpen, SetReceiveEquipmentModalOpen] = useState<boolean>(true);
    const stats = [
        { title: 'จำนวน Onhand', value: 120, color: '#1976d2' },
        { title: 'ติดตั้งวันนี้', value: 15, color: '#2e7d32' },
        { title: 'เบิกวันนี้', value: 20, color: '#f9a825' },
        { title: 'ถอนวันนี้', value: 5, color: '#d32f2f' },
    ];

    const history = [
        { time: '08:30', type: 'เบิก', item: 'Router', quantity: 5 },
        { time: '09:15', type: 'ตั้ง', item: 'Switch', quantity: 3 },
        { time: '11:00', type: 'ถอน', item: 'Access Point', quantity: 2 },
        { time: '13:45', type: 'เบิก', item: 'Cable', quantity: 10 },
    ];

    const onClose = async () => {

    }
    const onCloseReceiveModal = () => SetReceiveEquipmentModalOpen(false)
    return (
        <>
            <AppHearder title='Equipment Control' />
            <ReceiveEquipmentModal open={receiveEquipmentModalOpen} onClose={onCloseReceiveModal} />
            <Box p={2} mt={8}>
                {/* Stats Cards - 2 Columns */}
                <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    mb={3}
                    justifyContent="space-between"
                >
                    {stats.map((stat, index) => (
                        <Box key={index} flexBasis="calc(50% - 8px)">
                            <StatCard title={stat.title} value={stat.value} color={stat.color} />
                        </Box>
                    ))}
                </Box>

                {/* History Table */}
                <Paper elevation={2}>
                    <Box p={2}>
                        <Typography variant="subtitle1" gutterBottom>📑 ประวัติวันนี้</Typography>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>เวลา</TableCell>
                                        <TableCell>ประเภท</TableCell>
                                        <TableCell>อุปกรณ์</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((entry, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{entry.time}</TableCell>
                                            <TableCell>{entry.type}</TableCell>
                                            <TableCell>{entry.item}</TableCell>
                                            <TableCell>{entry.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

// Card Component
const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <Card sx={{ backgroundColor: color, color: '#fff' }}>
        <CardContent>
            <Typography variant="body2">{title}</Typography>
            <Typography variant="h6">{value}</Typography>
        </CardContent>
    </Card>
);

export default EquipmentDashboard;
