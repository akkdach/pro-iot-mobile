import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import { LockOutline, WorkHistory } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useUser } from '../../Context/userContext';

const ProfileCard = () => {
  const {user} = useUser();



  const handleLockOut = () => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'การกระทำนี้ไม่สามารถย้อนกลับได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ดำเนินการต่อ!',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('profile');
        Swal.fire('ดำเนินการแล้ว!', 'คุณได้ยืนยันการกระทำนี้แล้ว', 'success');
        window.location.replace('/')
        // ทำสิ่งที่ต้องการหลังจากยืนยัน
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <Card sx={{ width: '100%', padding: 2, margin: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            alt={user?.fullname}
            src={'https://i.pravatar.cc/150?img=47'}
            sx={{ width: 100, height: 100 }}
          />
        </Box>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Typography variant="h6" align="center">
              รหัส : {user?.employee_id}
            </Typography>
            <Typography variant="h6" align="center">
              {user?.fullname}
            </Typography>
            <Typography color="text.secondary" align="center">
              {user?.position} - {user?.department}
            </Typography>
            {/* <Chip
              label={user.sta}
              color={user.status === 'กำลังทำงาน' ? 'success' : 'default'}
              sx={{ mt: 1 }}
            /> */}
            <button onClick={() => handleLockOut()} style={{ display: 'flex', alignItems: 'center', flex: 2, justifyContent: 'center', padding: 5, margin: 15 }}
              className='btn btn-primary' title='เข้างาน'  ><LockOutline></LockOutline> ออกจากระบบ</button>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileCard;
