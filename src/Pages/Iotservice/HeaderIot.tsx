// IotHeader.tsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';

type IotHeaderProps = {
  title: string;
};

export default function IotHeader({ title }: IotHeaderProps) {
  const navigate = useNavigate();

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: '#003264' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, textAlign: 'center', marginRight: '40px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
