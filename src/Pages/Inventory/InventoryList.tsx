import React, { useEffect, useState } from 'react';
import { Box, Fab, Typography } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import callDevice from '../../Services/callDevice';
import { Link, useNavigate } from "react-router-dom";
import WifiIndicator from '../../Component/WifiIndicator';
import BatteryIndicator from '../../Component/BatteryIndicator';
import AppHearder from '../../Component/AppHeader';
import { AddBox, DeviceHub, DeviceHubOutlined, GifBox, Store, StoreMallDirectory } from '@mui/icons-material';
import InventoryAction from './InventoryAction';
import Swal from 'sweetalert2';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InvenHeader from './Header';


export default function InventoryList() {
    const [deviceList, setDeviceList] = useState<any[]>([]);
    const [battMap, setBattMap] = useState<Record<string, number>>({});
    const [rssiMap, setRssiMap] = useState<Record<string, number>>({});
    const [startAt, setStartAt] = useState<Record<string, string>>({});
    const [finishAt, setFinishAt] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchDevices() {
            try {
                const deviceRes = await callDevice.get('/List_Devices');

                if (deviceRes.data.dataResult) {
                    const list = deviceRes.data.dataResult;
                    setDeviceList(list);

                    const battValue: Record<string, number> = {};
                    const rssiValue: Record<string, number> = {};
                    const startTemp: Record<string, string> = {};
                    const finishTemp: Record<string, string> = {};

                    await Promise.all(
                        list.map(async (item: any) => {
                            const sim = item.simEmi?.trim();

                            battValue[sim] = item.battValue ? parseFloat(item.battValue) : 0;
                            rssiValue[sim] = item.rssiValue ? parseInt(item.rssiValue) : 0;


                            // ตรวจสอบ ID ก่อนเรียก API
                            if (!item.id) return;

                            try {
                                const detailRes = await callDevice.get(`/get_Devices/${item.id}`);
                                const deviceData = detailRes.data.dataResult;
                                const lastOrder = deviceData?.lastOrder;

                                if (lastOrder) {
                                    startTemp[sim] = lastOrder.startAt;
                                    finishTemp[sim] = lastOrder.finishAt;
                                }
                            } catch (err) {
                                // console.warn(`⚠️ Error fetching detail for ${sim}:`, err);
                            }
                        })
                    );

                    setBattMap(battValue);
                    setRssiMap(rssiValue);
                    setStartAt(startTemp);
                    setFinishAt(finishTemp);

                    // console.log('Start Map:', startTemp);
                    // console.log('Finish Map:', finishTemp);
                }
            } catch (error) {
                console.error('❌ Error fetching device list:', error);
            }
        }

        fetchDevices();
    }, []);

    const handleNew = ()=>{
        Swal.fire({
            title:'ยืนยันการสร้างรายการตรวจนับสต๊อก?',
            confirmButtonText:'ยืนยัน',
            showConfirmButton:true,
            showCancelButton:true,
            cancelButtonText:'ยกเลิก',
            icon:'question'
        }).then((result)=>{
            if(result.isConfirmed){
                Swal.fire('ดำเนินการสำเร็จ','','success')
            }
        })
    }

    const handleListClick = () => {
        navigate("/NewInventoryCount"); // เปลี่ยนเป็น path ที่ต้องการไปหน้าอัพโหลดไฟล์
    };

    return (
        <>
            
            <InvenHeader title="Inventory Counting" />
            <Box sx={{ p: 2, marginTop: 7, marginBottom: 8 }}>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        justifyContent: 'flex-start',
                    }}
                >
                    {deviceList.map((item: any, index: number) => (
                        <Box
                           
                            key={index}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                flex: '1 1 280px',
                                minWidth: 300,
                            }}
                        >
                            <div
                                style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SensorsIcon style={{ fontSize: 30, color: '#1cc4c4' }} />
                                    <Typography sx={{ fontWeight: 500 }}>
                                        Device No : {item.simEmi}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography sx={{ fontWeight: 500 }}>
                                        Start Time : {startAt[item.simEmi?.trim()] ? new Date(startAt[item.simEmi.trim()]).toLocaleString('th-TH') : '-'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography sx={{ fontWeight: 500 }}>
                                        Finish Time : {finishAt[item.simEmi?.trim()] ? new Date(finishAt[item.simEmi.trim()]).toLocaleString('th-TH') : '-'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <BatteryIndicator level={battMap[item.simEmi?.trim()] ?? 0} />
                                    <WifiIndicator strength={rssiMap[item.simEmi?.trim()] ?? 0} isConnected={true} />
                                </Box>

                                <Fab
                                    aria-label="add"
                                    sx={{
                                        position: "fixed",
                                        bottom: 78,
                                        right: 20,
                                        width: 45,
                                        height: 45,
                                        backgroundColor: '#163299ff',
                                        color: '#ffffff',
                                        '&:hover': {
                                        backgroundColor: '#0f2569',
                                        },
                                        boxShadow: 1,
                                    }}
                                    onClick={handleListClick}
                                    >
                                    <AddRoundedIcon />
                                </Fab>

                            </div>
                        </Box>
                    ))}
                </div>
            </Box>
        </>
    );
}
