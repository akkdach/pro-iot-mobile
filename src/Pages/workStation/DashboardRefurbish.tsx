import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
} from "@mui/material";
import { Description, Filter } from "@mui/icons-material";
import React, { use, useState } from "react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import AppHeader from "../../Component/AppHeader"
import BackupTableIcon from '@mui/icons-material/BackupTable';

const DashboardRefurbish = () => {
  
  const location = useLocation();
  const step = location.state;
  console.log(step);
  const navigate = useNavigate();
  const [workOrderFilter, setWorkOrderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [stationToFilter, setStationToFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState(today);

  const columns: GridColDef[] = [
    {
      field: "State",
      headerName: "State",
      width: 130,
      renderCell: (params) => {
        const level = params.value;
        const dotCount =
          level === "high"
            ? 3
            : level === "medium"
            ? 2
            : level === "low"
            ? 1
            : 0;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              height: "100%",
              width: "100%",
              gap: 0.8,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: i <= dotCount ? "#1565c0" : "#e0e0e0",
                  transition: "0.2s",
                }}
              />
            ))}
          </Box>
        );
      },
    },
    { field: "WorkOrder", headerName: "Work Order", width: 130 },
    { field: "OrderType", headerName: "Order Type", width: 100 },
    { field: "Description", headerName: "Description", width: 100 },
    { field: "Equipment", headerName: "Equipment", width: 100 },
    { field: "Status", headerName: "Status", width: 100 },
    { field: "CurrentStation", headerName: "Current Station", width: 130 },
    {
      field: "StartDate",
      headerName: "Start Date",
      type: "date",
      width: 130,
    },
    { field: "StartTime", headerName: "Start Time", width: 130 },
    {
      field: "FinishDate",
      headerName: "Finish Date",
      type: "date",
      width: 130,
    },
  ];

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
    {
      id: 2,
      lastName: "Lannister",
      firstName: "Cersei",
      age: 42,
      WorkOrder: "002",
      OrderType: "ZC15",
      Description: "TEST",
      Equipment: "TEST",
      Status: "PENDING",
      CurrentStation: "TEST",
      StartDate: new Date("2025-01-01"),
      StartTime: "08:30",
      FinishDate: new Date("2025-01-01"),
      State: "low",
    },
    {
      id: 3,
      lastName: "Lannister",
      firstName: "Jaime",
      age: 45,
      WorkOrder: "003",
      OrderType: "ZC16",
      Description: "TEST",
      Equipment: "TEST",
      Status: "PENDING",
      CurrentStation: "TEST",
      StartDate: new Date("2025-01-01"),
      StartTime: "08:30",
      FinishDate: new Date("2025-01-01"),
      State: "medium",
    },
    {
      id: 4,
      lastName: "Stark",
      firstName: "Arya",
      age: 16,
      WorkOrder: "004",
      OrderType: "ZC16",
      Description: "TEST",
      Equipment: "TEST",
      Status: "PENDING",
      CurrentStation: "TEST",
      StartDate: new Date("2025-01-01"),
      StartTime: "08:30",
      FinishDate: new Date("2025-01-01"),
      State: "low",
    },
    {
      id: 5,
      lastName: "Targaryen",
      firstName: "Daenerys",
      age: null,
      WorkOrder: "005",
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
    {
      id: 6,
      lastName: "Melisandre",
      firstName: null,
      age: 150,
      WorkOrder: "006",
      OrderType: "ZC16",
      Description: "TEST",
      Equipment: "TEST",
      Status: "PENDING",
      CurrentStation: "TEST",
      StartDate: new Date("2025-01-01"),
      StartTime: "08:30",
      FinishDate: new Date("2025-01-01"),
      State: "high",
    },
    {
      id: 7,
      lastName: "Clifford",
      firstName: "Ferrara",
      age: 44,
      WorkOrder: "007",
      OrderType: "ZC15",
      Description: "TEST",
      Equipment: "TEST",
      Status: "PENDING",
      CurrentStation: "TEST",
      StartDate: new Date("2025-01-01"),
      StartTime: "08:30",
      FinishDate: new Date("2025-01-01"),
      State: "low",
    },
    {
      id: 8,
      lastName: "Frances",
      firstName: "Rossini",
      age: 36,
      WorkOrder: "008",
      OrderType: "ZC16",
      Description: "TEST",
      Equipment: "TEST",
      Status: "PENDING",
      CurrentStation: "TEST",
      StartDate: new Date("2025-01-01"),
      StartTime: "08:30",
      FinishDate: new Date("2025-01-01"),
      State: "low",
    },
    {
      id: 9,
      lastName: "Roxie",
      firstName: "Harvey",
      age: 65,
      WorkOrder: "009",
      OrderType: "ZC16",
      Description: "TEST",
      Equipment: "TEST",
      Status: "PENDING",
      CurrentStation: "TEST",
      StartDate: new Date("2025-01-01"),
      StartTime: "08:30",
      FinishDate: new Date("2025-01-01"),
      State: "medium",
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  const orderTypes = Array.from(new Set(rows.map((row) => row.OrderType)));

  const filteredRows = rows.filter((row) => {
    const matchWorkOrder = row.WorkOrder?.toString()
      .toLowerCase()
      .includes(workOrderFilter.toLowerCase());

    const matchStatus = statusFilter === "" || row.Status === statusFilter;

    const matchOrderType =
      orderTypeFilter === "" || row.OrderType === orderTypeFilter;

    // const matchDate =
    //   !dateFilter ||
    //   (row.StartDate instanceof Date &&
    //     row.StartDate.toISOString().split("T")[0] === dateFilter);

    return matchWorkOrder && matchStatus && matchOrderType;
  });

  return (
    <div style={{height: "100%"}}>
      <AppHeader title="Dashboard" icon={<BackupTableIcon />} />
      <Stack direction="row" spacing={2} mb={2} mt={10} px={5}>
        <TextField
          label="ค้นหา Work Order"
          placeholder="เช่น WO-1001"
          size="small"
          value={workOrderFilter}
          onChange={(e) => setWorkOrderFilter(e.target.value)}
        />

        {/* <TextField
          label="วันที่"
          type="date"
          size="small"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        /> */}

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="IN_PROGRESS">In progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELED">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="order-type-label">Order Type</InputLabel>
          <Select
            labelId="order-type-label"
            label="Order Type"
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>

            {orderTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="station-to-label">Station From</InputLabel>
          <Select
            labelId="station-to-label"
            label="Station To"
            value={stationToFilter}
            onChange={(e) => setStationToFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>

            <MenuItem value="A">Station A</MenuItem>
            <MenuItem value="B">Station B</MenuItem>
            <MenuItem value="C">Station C</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="station-to-label">Station To</InputLabel>
          <Select
            labelId="station-to-label"
            label="Station To"
            value={stationToFilter}
            onChange={(e) => setStationToFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>

            <MenuItem value="A">Station A</MenuItem>
            <MenuItem value="B">Station B</MenuItem>
            <MenuItem value="C">Station C</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="station-to-label">Work Center</InputLabel>
          <Select
            labelId="station-to-label"
            label="Station To"
            value={stationToFilter}
            onChange={(e) => setStationToFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>

            <MenuItem value="A">Station A</MenuItem>
            <MenuItem value="B">Station B</MenuItem>
            <MenuItem value="C">Station C</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="station-to-label">SLA Status</InputLabel>
          <Select
            labelId="station-to-label"
            label="Station To"
            value={stationToFilter}
            onChange={(e) => setStationToFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>

            <MenuItem value="A">Station A</MenuItem>
            <MenuItem value="B">Station B</MenuItem>
            <MenuItem value="C">Station C</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Paper sx={{ height: "100%", width: "100%" }} >
        <DataGrid
          checkboxSelection={false}
          rows={filteredRows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          sx={{ border: 0 }}
          onRowClick={(params) => {
            // console.log(params.row);
            // navigate(`/WorkOrderDetail`, {state:params.row});
            navigate(`/WorkStation`, {state:params.row});
          }}
        />
      </Paper>
    </div>
  );
};
export default DashboardRefurbish;
