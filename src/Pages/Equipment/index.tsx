// EquipmentDashboardMobileTwoColumn.tsx
import React, { useState } from 'react';
import {Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Avatar,} from '@mui/material';
import AppHearder from '../../Component/AppHeader';
import ReceiveEquipmentModal from './ReceiveEquipmentModal';
import { TrendingUp, Download, Upload, Delete } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';

const EquipmentDashboard = () => {
  const [receiveEquipmentModalOpen, SetReceiveEquipmentModalOpen] = useState<boolean>(true);

  const stats = [
    { title: 'จำนวน Onhand', value: 120, color: 'linear-gradient(135deg, #42a5f5, #1e88e5)', icon: <TrendingUp /> },
    { title: 'ติดตั้งวันนี้', value: 15, color: 'linear-gradient(135deg, #66bb6a, #388e3c)', icon: <Upload /> },
    { title: 'เบิกวันนี้', value: 20, color: 'linear-gradient(135deg, #ffca28, #f57c00)', icon: <Download /> },
    { title: 'ถอนวันนี้', value: 5, color: 'linear-gradient(135deg, #ef5350, #c62828)', icon: <Delete /> },
  ];

  const history = [
    { time: '08:30', type: 'เบิก', item: 'Router', quantity: 5 },
    { time: '09:15', type: 'ตั้ง', item: 'Switch', quantity: 3 },
    { time: '11:00', type: 'ถอน', item: 'Access Point', quantity: 2 },
    { time: '13:45', type: 'เบิก', item: 'Cable', quantity: 10 },
  ];

  const onCloseReceiveModal = () => SetReceiveEquipmentModalOpen(false);

  return (
    <>
      <AppHearder title="Equipment Control" />
      <ReceiveEquipmentModal open={receiveEquipmentModalOpen} onClose={onCloseReceiveModal} />

      <Box p={2} mt={8} marginBottom={8}>
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
            <StatCard
                title={stat.title}
                value={stat.value}
                color={stat.color}
                icon={stat.icon}
            />
            </Box>
        ))}
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mb={3}>
        <Button
            fullWidth
            variant="contained"
            sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold', backgroundColor: '#acacacff' }}
            onClick={() => alert('เบิกเครื่อง')}
        >
            เบิกเครื่อง
        </Button>
        <Button
            fullWidth
            variant="contained"
            sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold', backgroundColor: '#003264' }}
            onClick={() => alert('จ่ายเครื่อง')}
        >
            จ่ายเครื่อง
        </Button>
        </Stack>


        {/* History Table */}
        <Paper
          elevation={3}
          sx={{ borderRadius: 3, overflow: 'hidden' }}
        >
          <Box p={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ประวัติวันนี้
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><b>เวลา</b></TableCell>
                    <TableCell><b>ประเภท</b></TableCell>
                    <TableCell><b>อุปกรณ์</b></TableCell>
                    <TableCell><b>จำนวน</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((entry, index) => (
                    <TableRow key={index} hover>
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
const StatCard = ({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) => (
  <Card
    sx={{
      background: color,
      color: '#fff',
      borderRadius: 4,
      boxShadow: 4,
      height: 120,
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <CardContent
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
      }}
    >
      <Box>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>{icon}</Avatar>
    </CardContent>
  </Card>
);


export default EquipmentDashboard;
