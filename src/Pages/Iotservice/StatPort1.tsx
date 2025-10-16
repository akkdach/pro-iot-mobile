import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Avatar
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import callDevice from '../../Services/callDevice';
import { useParams } from 'react-router-dom';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import ThermostatRoundedIcon from '@mui/icons-material/ThermostatRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';

const StatPort1 = () => {
  const { simEmi } = useParams();
  const [summary, setSummary] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [device,setDevice] = useState<any[]>([]);
  
  useEffect(() => {


    fetchData();
    setInterval(() => {
      fetchData();
    }, 1000 * 60);
  }, [simEmi]);

  const stats = [
    { title: 'อุณหภูมิที่วัดได้ล่าสุด', value: summary.temp ?? 0, color: '#27aea0ff', icon: <ThermostatRoundedIcon /> },
    { title: 'อุณหภูมิต่ำสุด', value: summary.min ?? 0, color: '#205a7aff', icon: <AcUnitRoundedIcon /> },
    { title: 'อุณหภูมิสูงสุด', value: summary.max ?? 0, color: '#1b4b64ff', icon: <LightModeRoundedIcon /> },
    { title: 'อุณหภูมิเฉลี่ยทั้งหมด', value: summary.avg ?? 0, color: '#174863ff', icon: <TimelineRoundedIcon /> },
  ];

      const fetchData = async () => {
      try {
        // ดึง device list เพื่อหา orderId ของ simEmi ปัจจุบัน
        const allDevices = await callDevice.get('/List_Devices');
        const match = allDevices.data.dataResult.find(
          (item: any) => item.simEmi?.trim() === simEmi?.trim()
        );
        if (!match) {
          console.error(`ไม่พบอุปกรณ์ simEmi=${simEmi}`);
          return;
        }
        const orderId = match.orderId;

        // ดึงข้อมูล temperature history
        const res = await callDevice.get(`/get_TemperatureHistory?orderId=${orderId}`);
        if (res?.data.dataResult && res.data.dataResult.length > 0) {
          const portData = res.data.dataResult.find((d: any) => d.port === 1); // port1
          const history = portData.history;
          // สร้าง chartData
          const formattedChart = history.map((item: any) => ({
            time: new Date(item.time).toLocaleTimeString(),
            value: item.temp,
          }));
          setChartData(formattedChart);

          // สรุปค่า
          setSummary({
            temp: history.at(-1)?.temp ?? 0,
            min: portData.min,
            max: portData.max,
            avg: portData.avg,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

  return (
    <Box p={2} mt={-4} marginBottom={-6}>

      {/* Stats Cards */}
      <Box display="flex" flexDirection="column" gap={2} mb={3} >
        {/* กล่องแรกเต็มแถว */}
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
            <Typography variant="subtitle2">{stats[0].title}</Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {stats[0].value.toFixed(2)} °c
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.25)" }}>
            {stats[0].icon}
          </Avatar>
        </Card>

        {/* สองกล่องล่างเป็น 2 คอลัมน์ */}
        <Box display="flex" gap={2} >
          {stats.slice(1, 3).map((stat, index) => (
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
                  <Typography variant="subtitle2">{stat.title}</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {stat.value.toFixed(2)} °c
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.25)" }}>
                  {stat.icon}
                </Avatar>
              </Card>
            </Box>
          ))}
        </Box>

        {/* กล่องสุดท้ายเต็มแถว */}
        <Card
          sx={{
            backgroundColor: stats[3].color,
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
            <Typography variant="subtitle2">{stats[3].title}</Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {stats[3].value.toFixed(2)} °c
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.25)" }}>
            {stats[3].icon}
          </Avatar>
        </Card>
      </Box>

      {/* กราฟด้านบน */}
      <Box sx={{ height: 250, mb: 3, alignItems: "start", }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -30, }} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#27aea0ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default StatPort1;
