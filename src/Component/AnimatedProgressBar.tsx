
import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { keyframes } from "@emotion/react";

interface ProgressBarProps {
  targetLabel: string;
  targetValue: number;
  actualLabel: string;
  actualValue: number;
}

const shimmer = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
`;

const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  targetLabel = "Target",
  targetValue,
  actualLabel = "Actual",
  actualValue,
}) => {
  const [progress, setProgress] = useState(0);
  const [barColor, setBarColor] = useState("#348b37ff");

  useEffect(() => {
    const percentage = Math.min((actualValue / targetValue) * 100, 100);
    const timer = setTimeout(() => setProgress(percentage), 300);

    // เปลี่ยนสีตามเปอร์เซ็นต์
    if (percentage > 90) {
      setBarColor("#da6462ff"); // แดง
    } else {
      const greenIntensity = Math.floor(200 - percentage);
      setBarColor(`rgb(${greenIntensity}, 200, ${greenIntensity})`);
    }

    return () => clearTimeout(timer);
  }, [actualValue, targetValue]);

  return (
    <Box
      sx={{
        maxWidth: 360,
        margin: "auto",
        padding: 2,
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#fff",
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" sx={{ color: barColor }}>
          {actualLabel}: {actualValue.toLocaleString()} 
        </Typography>
        <Typography variant="body2" sx={{ color: "#5f5959ff" }}>
          {targetLabel}: {targetValue.toLocaleString()}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 14,
          borderRadius: 7,
          backgroundColor: "#eee",
          "& .MuiLinearProgress-bar": {
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${barColor},
              ${barColor} 10px,
              ${barColor}80 10px,
              ${barColor}80 20px
            )`,
            animation: `${shimmer} 1s linear infinite`,
            transition: "width 1s ease-in-out",
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{ display: "block", textAlign: "right", mt: 1, color: barColor }}
      >
        {Math.round(progress)}%
      </Typography>
    </Box>
  );
};

export default AnimatedProgressBar;
