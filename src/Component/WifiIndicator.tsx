import React from "react";
import {
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import SignalWifi1BarIcon from "@mui/icons-material/SignalWifi1Bar";
import SignalWifi2BarIcon from "@mui/icons-material/SignalWifi2Bar";
import SignalWifi3BarIcon from "@mui/icons-material/SignalWifi3Bar";
import SignalWifi4BarIcon from "@mui/icons-material/SignalWifi4Bar";

type Props = {
  strength: number; // 0 = no signal, 1–4 bars
  isConnected: boolean;
  ssid?: string;
};

const WifiIndicator: React.FC<Props> = ({
  strength,
  isConnected,
  ssid = "Internet",
}) => {
  let icon;
  if (!isConnected || strength === 0) {
    icon = <WifiOffIcon color="error" />;
  } else if (strength === 1) {
    icon = <SignalWifi1BarIcon color="warning" />;
  } else if (strength === 2) {
    icon = <SignalWifi2BarIcon color="warning" />;
  } else if (strength === 3) {
    icon = <SignalWifi3BarIcon color="primary" />;
  } else {
    icon = <SignalWifi4BarIcon color="primary" />;
  }

  return (
    <Tooltip title={isConnected ? `SSID: ${ssid}` : "No Connection"}>
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant="body2">
          {isConnected ? ssid : "No Wi-Fi"}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default WifiIndicator;
