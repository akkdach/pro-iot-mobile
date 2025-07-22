import React, { useEffect, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';

interface CountdownProps {
  targetDate: string | null; // เช่น "2025-08-01T15:00:00"
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    if (!targetDate) return '00:00:00';
    
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) return '00:00:00';

    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <Box>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 4,
          backgroundColor: '#ffffff',
          minWidth: 150,
          maxHeight: 80,
          textAlign: 'center',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, lineHeight: 1.2, }}>
          นับถอยหลัง
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{  letterSpacing: 2, color: '#0f467eff', lineHeight: 1.2, }}
        >
          {timeLeft}
        </Typography>
      </Card>
    </Box>
  );
};

export default Countdown;
