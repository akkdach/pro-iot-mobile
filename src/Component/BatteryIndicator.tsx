import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery20Icon from "@mui/icons-material/Battery20";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import BatteryUnknownIcon from "@mui/icons-material/BatteryUnknown";

type Props = {
  level: number; // 0 - 100
  isCharging?: boolean;
};

const BatteryIndicator: React.FC<Props> = ({ level, isCharging = false }) => {
  let icon;
  if (isCharging) {
    icon = <BatteryChargingFullIcon color="primary" />;
  } else if (level >= 80) {
    icon = <BatteryFullIcon color="success" />;
  } else if (level >= 30) {
    icon = <Battery20Icon color="warning" />;
  } else if (level >= 0) {
    icon = <BatteryAlertIcon color="error" />;
  } else {
    icon = <BatteryUnknownIcon color="disabled" />;
  }

  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 120 }}>
      {icon}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2">{level}%</Typography>
        <LinearProgress
          variant="determinate"
          value={level}
          sx={{
            height: 6,
            borderRadius: 3,
            mt: 0.5,
            bgcolor: "#ddd",
            "& .MuiLinearProgress-bar": {
              backgroundColor: level < 30 ? "#f44336" : "#4caf50",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default BatteryIndicator;
