import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useUser } from '../../Context/userContext';
import avatar from "./avatar.png";

const ProfileCard = () => {
  const { user } = useUser();

  const handleLockOut = () => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการออกจากระบบใช่หรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ออกจากระบบ!',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('profile');
        Swal.fire('ออกจากระบบแล้ว!', '', 'success');
        window.location.replace('/');
        //ทำสิ่งที่ต้องการหลังจากยืนยัน
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 6, px: 2 }}>
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 3,
          borderRadius: 4,
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          bgcolor: '#ffffff',
        }}
      >
        <Avatar
          src={avatar} alt='avatar'
          sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
        />

        <Typography variant="h5" sx={{ fontWeight: 600, color: '#003264' }}>
          {user?.fullname}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          รหัสพนักงาน : {user?.employee_id}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {user?.position} - {user?.department}
        </Typography>

            {/* <Chip
              label={user.sta}
              color={user.status === 'กำลังทำงาน' ? 'success' : 'default'}
              sx={{ mt: 1 }}
            /> */}
            
        <Divider sx={{ my: 3 }} />

        <Button
          variant="contained"
          color="error"
          startIcon={<LockOutlined />}
          fullWidth
          onClick={handleLockOut}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            textTransform: 'none',
            py: 1.2,
            fontSize: '1rem',
            boxShadow: '0 4px 10px rgba(255, 0, 0, 0.2)',
          }}
        >
          ออกจากระบบ
        </Button>
      </Card>
    </Box>
  );
};

export default ProfileCard;
