// EquipmentDashboardMobileTwoColumn.tsx
import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Avatar, } from '@mui/material';
import AppHearder from '../../Component/AppHeader';
import { Button, Stack } from '@mui/material';
import {  useNavigate } from "react-router-dom";
import callApi from '../../Services/callApi';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'

export interface ListEqui {
  equipmentSerialNo?: string
  orderID?: string
  activity?: string
  status?: string
  remarks?: string
}

const EquipmentDashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState<ListEqui>({});
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    const fetchEquip = async () => {
      try {
        const EquipRes = await callApi.get('/EquipmentTransaction/list', { params: formData });
        if (EquipRes?.data?.isSuccess && EquipRes?.data?.dataResult.line) {
          console.log('API result:', EquipRes.data.dataResult.line);
          setSummary(EquipRes.data.dataResult);
          setHistory(EquipRes.data.dataResult.line);
        } else {
          Swal.fire('เกิดข้อผิดพลาด', EquipRes?.data?.message || 'ไม่สามารถโหลดข้อมูลได้', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ API ได้', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEquip();
  }, [formData]);


  const stats = [
    { title: 'จำนวน Onhand', value: summary.onhand ?? 0, color: '#27aea0ff', icon: <InventoryIcon /> },
    { title: 'รับวันนี้', value: summary.receive ?? 0, color: '#205a7aff', icon: <ArrowCircleDownIcon /> },
    { title: 'จ่ายวันนี้', value: summary.withdraw ?? 0, color: '#1b4b64ff', icon: <ArrowCircleUpRoundedIcon /> },
    //{ title: 'ติดตั้งวันนี้', value: summary.install ?? 0, color: '#1b4b64ff', icon: <Download /> },
    //{ title: 'ถอนวันนี้', value: summary.remove ?? 0, color: '#20545bff', icon: <Delete /> },
  ];

  //รับเครื่อง
  const handleReceiveClick = () => {
    navigate("/ReceiveEquipmentScan");
  };

  //จ่ายเครื่อง
  const handleWithdrawClick = () => {
    navigate("/WithdrawEquipmentScan");
  };

  //รับหลายเครื่อง
  const handleManyReceiveClick = () => {
    navigate("/ReceiveManyEquipmentScan");
  };

  //จ่ายหลายเครื่อง
  const handleManyWithdrawClick = () => {
    navigate("/WithdrawManyEquipmentScan");
  };

  return (
    <>
      <AppHearder title="Equipment Control" />


      <Box p={2} mt={8} marginBottom={8}>
        {/* Stats Cards */}
        <Box display="flex" flexDirection="column" gap={2} mb={3}>
          {/* Onhand กล่องเต็มแถว */}
          <Card
            sx={{
              backgroundColor: stats[0].color,
              color: "#fff",
              borderRadius: 3,
              height: 80,
              display: "flex",
              alignItems: "center",
              textAlign: "left",
              justifyContent: "space-between",
              p: 2,
              boxShadow: 3,
            }}
          >
            <Box>
              <Typography variant="body1">{stats[0].title}</Typography>
              <Typography variant="h6" fontWeight="bold">
                {stats[0].value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.25)" }}>
              {stats[0].icon}
            </Avatar>
          </Card>

          {/* สองกล่องล่างเป็น 2 คอลัมน์ */}
          <Box display="flex" gap={2}>
            {stats.slice(1).map((stat, index) => (
              <Box key={index} flex={1}>
                <Card
                  sx={{
                    backgroundColor: stat.color,
                    color: "#fff",
                    borderRadius: 3,
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    textAlign: "left",
                    justifyContent: "space-between",
                    p: 2,
                    boxShadow: 3,
                  }}
                >
                  <Box>
                    <Typography variant="body1">{stat.title}</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.25)" }}>
                    {stat.icon}
                  </Avatar>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>



        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mb={1}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 3,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(to right,#3184e1ff,#3184e1ff)',
              '&:hover': {
                background: 'linear-gradient(to right,rgba(20, 190, 220, 1), #3184e1ff)',
              },
            }}
            onClick={handleReceiveClick}
          >
            รับเครื่อง
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 3,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(to right,#3184e1ff,#3184e1ff)',
              '&:hover': {
                background: 'linear-gradient(to right,rgba(20, 190, 220, 1), #3184e1ff)',
              },
            }}
            onClick={handleWithdrawClick}
          >
            จ่ายเครื่อง
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} mb={3}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 3,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(to right,#7726c8ff,#7726c8ff)',
              '&:hover': {
                background: 'linear-gradient(to right,rgba(195, 135, 255, 1), #7726c8ff)',
              },
            }}
            onClick={handleManyReceiveClick}
          >
            รับหลายเครื่อง
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 3,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(to right,#7726c8ff,#7726c8ff)',
              '&:hover': {
                background: 'linear-gradient(to right,rgba(195, 135, 255, 1), #7726c8ff)',

              },
            }}
            onClick={handleManyWithdrawClick}
          >
            จ่ายหลายเครื่อง
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
                    <TableCell><b>Trans ID</b></TableCell>
                    <TableCell><b>Equipment Serial No</b></TableCell>
                    <TableCell><b>Order ID</b></TableCell>
                    <TableCell><b>Trans Type</b></TableCell>
                    <TableCell><b>Activity</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Remarks</b></TableCell>
                    <TableCell><b>Create At</b></TableCell>
                    <TableCell><b>Wk_Ctr</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length > 0 ? (
                    history.map((entry, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{entry.transactionID}</TableCell>
                        <TableCell>{entry.equipmentSerialNo}</TableCell>
                        <TableCell>{entry.orderID}</TableCell>
                        <TableCell>{entry.tran_Type}</TableCell>
                        <TableCell>{entry.activity}</TableCell>
                        <TableCell>{entry.status}</TableCell>
                        <TableCell>{entry.remarks}</TableCell>
                        <TableCell>{dayjs(entry.createAt).format("DD/MM/YYYY hh:mm:ss")}</TableCell>
                        <TableCell>{entry.wk_Ctr}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {loading ? "กำลังโหลด..." : "ไม่มีข้อมูล"}
                      </TableCell>
                    </TableRow>
                  )}
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