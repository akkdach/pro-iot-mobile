// IotHeader.tsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';

type IotHeaderProps = {
  title: string;
  icon?: any;
  onBack?: () => void;
};

export default function AppHearder({ title, icon, onBack }: IotHeaderProps) {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" elevation={1} sx={{ backgroundColor: '#003264' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onBack ? onBack : () => navigate(-1)}
          sx={{ mr: 2 }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, textAlign: 'center', marginRight: '40px', alignContent: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {icon} {title}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
