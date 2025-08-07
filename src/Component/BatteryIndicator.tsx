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
  // ปรับ level ให้เป็น 0, 5, 10, 15, ... 100
  const steppedLevel = Math.min(Math.ceil(level * 100) / 4.2, 100);

  let icon;
  if (isCharging) {
    icon = <BatteryChargingFullIcon color="primary" />;
  } else if (steppedLevel >= 80) {
    icon = <BatteryFullIcon color="success" />;
  } else if (steppedLevel >= 30) {
    icon = <Battery20Icon color="warning" />;
  } else if (steppedLevel >= 0) {
    icon = <BatteryAlertIcon color="error" />;
  } else {
    icon = <BatteryUnknownIcon color="disabled" />;
  }

  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 120 }}>
      {icon}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2">{steppedLevel.toFixed(2)}%</Typography>
        <LinearProgress
          variant="determinate"
          value={steppedLevel}
          sx={{
            height: 6,
            borderRadius: 3,
            mt: 0.5,
            bgcolor: "#ddd",
            "& .MuiLinearProgress-bar": {
              backgroundColor: steppedLevel < 30 ? "#f44336" : "#4caf50",
              transition: "all 0.3s ease",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default BatteryIndicator;
