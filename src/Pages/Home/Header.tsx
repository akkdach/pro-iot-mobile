import React from 'react';
import './Header.css'; // Import CSS file for styling
import avatar from "./avatar.png";
import { Box, Grid, Typography } from '@mui/material';
import { useUser } from '../../Context/userContext';
const Header = () => {
      const { user } = useUser();
    return (
        <header className="header">
            <div style={{ flex: 1, flexDirection: 'row', justifyContent: 'center',gap:2 }}>
                <div style={{margin:5}}>
                    <img src={avatar} alt='avatar' style={{ width: 100, height: 100, margin: 'auto' }} />
                </div>
                <div style={{ margin: '5px', fontWeight: 500, fontSize: '1rem', color: '#333' }}>
                    <Typography>{user?.fullname}</Typography>
                    <small>{user?.department} - {user?.position}</small>
                </div>
            </div>

        </header>
    );
};

export default Header;
