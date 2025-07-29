// IotHeader.tsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';

type IotHeaderProps = {
  title: string;
  icon?:any;
};

export default function AppHearder({ title,icon }: IotHeaderProps) {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" elevation={1} sx={{ backgroundColor: '#003264' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, textAlign: 'center', marginRight: '40px',alignContent:'center' }}>
           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {icon} {title}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
