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
    <AppBar position="fixed" elevation={0} sx={{
      background: 'linear-gradient(135deg, #003264 0%, #004a93 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 2px 16px rgba(0, 50, 100, 0.25)',
    }}>
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
