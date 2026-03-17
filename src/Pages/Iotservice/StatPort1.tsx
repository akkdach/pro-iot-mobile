import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import callDevice from '../../Services/callDevice';
import { useParams } from 'react-router-dom';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import ThermostatRoundedIcon from '@mui/icons-material/ThermostatRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { CircularProgress } from '@mui/material';
import './ActionPages.css';

const StatPort1 = () => {
  const { simEmi } = useParams();
  const [summary, setSummary] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, [simEmi]);

  const fetchData = async () => {
    try {
      const allDevices = await callDevice.get('/List_Devices');
      const match = allDevices.data.dataResult.find(
        (item: any) => item.simEmi?.trim() === simEmi?.trim()
      );
      if (!match) {
        console.error(`ไม่พบอุปกรณ์ simEmi=${simEmi}`);
        return;
      }
      const orderId = match.orderId;

      const res = await callDevice.get(`/get_TemperatureHistory?orderId=${orderId}`);
      if (res?.data.dataResult && res.data.dataResult.length > 0) {
        const portData = res.data.dataResult.find((d: any) => d.port === 1);
        const history = portData.history;

        const formattedChart = history.map((item: any) => ({
          time: new Date(item.time).toLocaleTimeString(),
          value: item.temp,
        }));
        setChartData(formattedChart);

        setSummary({
          temp: history.at(-1)?.temp ?? 0,
          min: portData.min,
          max: portData.max,
          avg: portData.avg,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'อุณหภูมิล่าสุด', value: summary.temp ?? 0, type: 'current', icon: <ThermostatRoundedIcon style={{ fontSize: 22 }} /> },
    { title: 'ต่ำสุด', value: summary.min ?? 0, type: 'min', icon: <AcUnitRoundedIcon style={{ fontSize: 22 }} /> },
    { title: 'สูงสุด', value: summary.max ?? 0, type: 'max', icon: <LightModeRoundedIcon style={{ fontSize: 22 }} /> },
    { title: 'เฉลี่ย', value: summary.avg ?? 0, type: 'avg', icon: <TimelineRoundedIcon style={{ fontSize: 22 }} /> },
  ];

  if (loading) {
    return (
      <div className="action-loading">
        <CircularProgress size={44} sx={{ color: '#1cc4c4' }} />
        <span className="action-loading-text">Loading Port 1 data...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        {/* Current temperature — full width */}
        <div className={`stat-card-port ${stats[0].type}`}>
          <div className="stat-card-content">
            <span className="stat-card-title">{stats[0].title}</span>
            <span className="stat-card-value">
              {stats[0].value.toFixed(2)}
              <span className="stat-card-unit"> °C</span>
            </span>
          </div>
          <div className="stat-card-avatar">{stats[0].icon}</div>
        </div>

        {/* Min + Max — side by side */}
        <div className="stats-row">
          {stats.slice(1, 3).map((stat, index) => (
            <div key={index} className={`stat-card-port ${stat.type}`}>
              <div className="stat-card-content">
                <span className="stat-card-title">{stat.title}</span>
                <span className="stat-card-value">
                  {stat.value.toFixed(2)}
                  <span className="stat-card-unit"> °C</span>
                </span>
              </div>
              <div className="stat-card-avatar">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Average — full width */}
        <div className={`stat-card-port ${stats[3].type}`}>
          <div className="stat-card-content">
            <span className="stat-card-title">{stats[3].title}</span>
            <span className="stat-card-value">
              {stats[3].value.toFixed(2)}
              <span className="stat-card-unit"> °C</span>
            </span>
          </div>
          <div className="stat-card-avatar">{stats[3].icon}</div>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="chart-container">
        <div className="chart-title">
          <span className="chart-title-dot" />
          Temperature History — Port 1
        </div>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#8896a6' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8896a6' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,50,100,0.12)',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1cc4c4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#1cc4c4', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatPort1;
