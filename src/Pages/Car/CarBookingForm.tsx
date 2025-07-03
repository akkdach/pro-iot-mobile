import React from 'react';
import { useForm } from 'react-hook-form';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
const carOptions = [
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "nissan", label: "Nissan" },
  { value: "bmw", label: "BMW" },
];
export default function CarBookingForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log('Booking Data:', data);
    // ส่งข้อมูลไปยัง backend หรือ API
    reset();
  };

  return (
    <Paper elevation={3} style={{ padding: 24, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        จองรถภายในบริษัท
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3>เลือกรถ</h3>
            <Autocomplete
              options={carOptions}
              getOptionLabel={(option) => option.label}
              {...register('car')}
              renderInput={(params) => <TextField {...params} label="เลือกรถ..." variant="outlined" />}
            />
          </div>
          <div>
            <TextField fullWidth label="สถานที่ต้นทาง" {...register('origin')} />
          </div>
          <div>
            <TextField fullWidth label="สถานที่ปลายทาง" {...register('destination')} />
          </div>
          <div>
            <TextField fullWidth label="ชื่อผู้จอง" {...register('userName')} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="วันเวลาเริ่มต้น"
              InputLabelProps={{ shrink: true }}
              {...register('startTime')}
            />
            <TextField fullWidth label="ไมล์เริ่มต้น" type="number" {...register('startMileage')} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="วันเวลาสิ้นสุด"
              InputLabelProps={{ shrink: true }}
              {...register('endTime')}
            />
            <TextField fullWidth label="ไมล์สิ้นสุด" type="number" {...register('endMileage')} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>

          </div>
          <div>
            <InputLabel>รูปไมล์เริ่มต้น</InputLabel>
            <input type="file" {...register('startPhoto')} />
          </div>
          <div>
            <InputLabel>รูปไมล์สิ้นสุด</InputLabel>
            <input type="file" {...register('endPhoto')} />
          </div>
          <div>
            <InputLabel>รูปสถานที่ปลายทาง</InputLabel>
            <input type="file" {...register('destinationPhoto')} />
          </div>
          <Button variant="contained" color="primary" type="submit">
            บันทึกการจอง
          </Button>
        </div>
      </form>
    </Paper>
  );
}
