import React from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography, Divider, Grid, Chip } from "@mui/material";

const rows = [
  {
    id: 1,
    lastName: "Snow",
    firstName: "Jon",
    age: 35,
    WorkOrder: "001",
    OrderType: "ZC15",
    Description: "TEST",
    Equipment: "TEST",
    Status: "PENDING",
    CurrentStation: "TEST",
    StartDate: new Date("2025-01-01"),
    StartTime: "08:30",
    FinishDate: new Date("2025-01-01"),
    State: "high",
  },
];

const formatDate = (d: any) => {
  if (!d) return "-";
  if (d instanceof Date) return d.toLocaleDateString();
  return d;
};

const stateColor = (state?: string) => {
  switch (state) {
    case "high":
      return "#d32f2f";
    case "medium":
      return "#fbc02d";
    case "low":
      return "#2e7d32";
    default:
      return "#9e9e9e";
  }
};

export default function WorkOrderDetail() {
  const { id } = useParams();
  const numericId = Number(id);

  console.log(id)

  const data = rows.find((row) => row.id === numericId);

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">ไม่พบข้อมูล Work Order</Typography>
      </Box>
    );
  }

  const fullName = `${data.firstName ?? ""} ${data.lastName ?? ""}`;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Work Order #{data.WorkOrder}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fullName} (Age: {data.age ?? "-"})
            </Typography>
          </Box>

          {/* Status + State */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={data.Status}
              color="warning"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: stateColor(data.State),
              }}
              title={data.State}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* WorkOrder info (ใช้ flex แทน Grid) */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* ซ้าย: Order Type */}
          <Box
            sx={{
              flexBasis: { xs: "100%", sm: "48%" },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Order Type
            </Typography>
            <Typography variant="body1">{data.OrderType}</Typography>
          </Box>

          {/* ขวา: Equipment */}
          <Box
            sx={{
              flexBasis: { xs: "100%", sm: "48%" },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Equipment
            </Typography>
            <Typography variant="body1">{data.Equipment}</Typography>
          </Box>

          {/* Description เต็มแถว */}
          <Box
            sx={{
              flexBasis: "100%",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">{data.Description}</Typography>
          </Box>

          {/* Current Station */}
          <Box
            sx={{
              flexBasis: { xs: "100%", sm: "48%" },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Current Station
            </Typography>
            <Typography variant="body1">{data.CurrentStation}</Typography>
          </Box>

          {/* State */}
          <Box
            sx={{
              flexBasis: { xs: "100%", sm: "48%" },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              State
            </Typography>
            <Typography variant="body1">{data.State}</Typography>
          </Box>

          {/* Start Date */}
          <Box
            sx={{
              flexBasis: { xs: "100%", sm: "32%" },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Start Date
            </Typography>
            <Typography variant="body1">
              {formatDate(data.StartDate)}
            </Typography>
          </Box>

          {/* Start Time */}
          <Box
            sx={{
              flexBasis: { xs: "100%", sm: "32%" },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Start Time
            </Typography>
            <Typography variant="body1">{data.StartTime}</Typography>
          </Box>

          {/* Finish Date */}
          <Box
            sx={{
              flexBasis: { xs: "100%", sm: "32%" },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Finish Date
            </Typography>
            <Typography variant="body1">
              {formatDate(data.FinishDate)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  
}
