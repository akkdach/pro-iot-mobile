import { Home, Person } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import React from "react";
import Profile from "../Pages/Profile";
import { useNavigate } from "react-router-dom";


export default function Footer(){
    const [value, setValue] = React.useState(0);

  const navigate = useNavigate();

    return (
      <div style={{height:100}}>
              <Box sx={{ width: '100%',position:'fixed',bottom:0,margin:'auto' }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction onClick={()=>navigate('/')} label="Home" icon={<Home />} />
          <BottomNavigationAction onClick={()=>navigate('profile')} label="Profile" icon={<Person />} />
        </BottomNavigation>
      </Box>
      </div>
    );
}