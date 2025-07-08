import React from "react";
import { Home, Person } from "@mui/icons-material";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        bgcolor: "#ffffff",
        zIndex: 10,
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        showLabels
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          height: 65,
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Home />}
          onClick={() => navigate("/")}
          sx={{
            "&.Mui-selected": {
              color: "#003264",
            },
          }}
        />
        <BottomNavigationAction
          label="Profile"
          icon={<Person />}
          onClick={() => navigate("/profile")}
          sx={{
            "&.Mui-selected": {
              color: "#003264",
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
}
