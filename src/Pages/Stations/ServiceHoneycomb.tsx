import React, {useState} from "react";
import { Box, Typography, Stack, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

type StationStatus = "online" | "busy" | "offline";

interface Station {
  id: string;
  name: string;
  status: StationStatus;
  jobsInQueue: number;
}

const stations: Station[] = [
  { id: "S1", name: "Station 1", status: "online", jobsInQueue: 3 },
  { id: "S2", name: "Station 2", status: "busy", jobsInQueue: 9 },
  { id: "S3", name: "Station 3", status: "offline", jobsInQueue: 0 },
  { id: "S4", name: "Station 4", status: "online", jobsInQueue: 1 },
  { id: "S5", name: "Station 5", status: "busy", jobsInQueue: 6 },
  { id: "S6", name: "Station 6", status: "online", jobsInQueue: 2 },
  { id: "S7", name: "Station 7", status: "offline", jobsInQueue: 0 },
];

const getStatusColor = (status: StationStatus) => {
  switch (status) {
    case "online":
      return "#2e7d32";
    case "busy":
      return "#ef6c00";
    case "offline":
      return "#90a4ae";
    default:
      return "#b0bec5";
  }
};

const ServiceHoneycomb: React.FC = () => {

    const [handleOpen, setHandleOpen] = React.useState(false);


  const handleClick = (station: Station) => {
    console.log("Clicked station:", station);
  };

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={2}
      sx={{ p: 2, pb: 4 }}
    >
      <Typography variant="h6" fontWeight={700}>
        Service Stations
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ maxWidth: 280 }}
      ></Typography>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: 8,
          mt: 1,
        }}
      >
        {stations.map((station, index) => (
          <Box
            key={station.id}
            sx={{
              ml: index % 2 === 0 ? 0 : { xs: 5, sm: 6 },
              cursor: "pointer",
            }}
            onClick={() => handleClick(station)}
          >
            <Box
              sx={{
                width: 110,
                height: 96,
                backgroundColor: "#fff",
                border: "3px solid",
                borderColor: `${getStatusColor(station.status)}AA`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: 3,
                borderRadius: 2,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                clipPath:
                  "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
                "&:hover": {
                  boxShadow: 6,
                  backgroundColor: "#fafafa",
                },
                "&:active": {
                  transform: "scale(0.96)",
                },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.2 }}
              >
                {station.id}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                align="center"
                sx={{ mt: 0.3 }}
              >
                {station.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  mt: 0.3,
                  fontWeight: 700,
                  color: getStatusColor(station.status),
                }}
              >
                {station.status.toUpperCase()}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.3 }}
              >
                Queue: {station.jobsInQueue}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

    
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
        sx={{ mt: 1 }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#2e7d32",
            }}
          />
          <Typography variant="caption">Online</Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#ef6c00",
            }}
          />
          <Typography variant="caption">Busy</Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#90a4ae",
            }}
          />
          <Typography variant="caption">Offline</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ServiceHoneycomb;
