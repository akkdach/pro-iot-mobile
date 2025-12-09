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
import React, {
  use,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import AppHeader from "../../Component/AppHeader";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import callApi from "../../Services/callApi";
import { set } from "react-hook-form";
import { formatDate, formatTime } from "../../Utility/DatetimeService";
import { useWork } from "../../Context/WorkStationContext";

const DashboardRefurbish = () => {
  const { work, setWork } = useWork();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<any>(location?.state);
  const [workOrderFilter, setWorkOrderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [stationToFilter, setStationToFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState(today);
  const [items, setItems] = useState<any[]>([]);
  const [itemEach, setItemEach] = useState();

  useEffect(() => {
    setStep(location.state);
    console.log(location.state);
  }, [location?.state]);

  useEffect(() => {
    onLoad();
    //onLoad2();
  }, []);

  const onLoad = async () => {
    if (step.station == null) {
      let res = await callApi.get("/WorkOrderList/workOrderList");
      console.log("work order list", res.data.dataResult);
      setItems(res.data.dataResult);
      setWork(res.data.dataResult);
    } else {
      let res = await callApi.get(
        `/workOrderList/workOrderList/${step.Station}`
      );
      const data = res.data.dataResult;
      console.log("Each order in fontend : ", data);
      //setItemEach(data);
      setWork(res.data.dataResult);
    }
  };

  // const onLoad2 = async () => {
  //   let res = await callApi.get(`/workOrderList/workOrderList/${step.Station}`);
  //   const data = res.data.dataResult;
  //   console.log("Each order in fontend : ", data);
  //   //setItemEach(data);
  //   setWork(res.data.dataResult);
  // };

  const columns: GridColDef[] = [
    // {
    //   field: "State",
    //   headerName: "State",
    //   width: 130,
    //   renderCell: (params) => {
    //     const level = params.value;
    //     const dotCount =
    //       level === "high"
    //         ? 3
    //         : level === "medium"
    //         ? 2
    //         : level === "low"
    //         ? 1
    //         : 0;

    //     return (
    //       <Box
    //         sx={{
    //           display: "flex",
    //           alignItems: "center",
    //           justifyContent: "flex-start",
    //           height: "100%",
    //           width: "100%",
    //           gap: 0.8,
    //         }}
    //       >
    //         {[1, 2, 3].map((i) => (
    //           <Box
    //             key={i}
    //             sx={{
    //               width: 10,
    //               height: 10,
    //               borderRadius: "50%",
    //               backgroundColor: i <= dotCount ? "#1565c0" : "#e0e0e0",
    //               transition: "0.2s",
    //             }}
    //           />
    //         ))}
    //       </Box>
    //     );
    //   },
    // },
    { field: "orderid", headerName: "Work Order", width: 130, flex: 1 },
    { field: "ordeR_TYPE", headerName: "Order Type", width: 130, flex: 1 },
    { field: "shorT_TEXT", headerName: "Description", width: 200, flex: 1 },
    { field: "equipment", headerName: "Equipment", width: 100, flex: 1 },
    { field: "weB_STATUS", headerName: "Status", width: 100, flex: 1 },
    // { field: "CurrentStation", headerName: "Current Station", width: 130 },
    {
      field: "actuaL_START_DATE",
      headerName: "Start Date",
      // type: "date",
      width: 130,
      renderCell: (params) => {
        return formatDate(params.value);
      },
      flex: 1,
    },

    {
      field: "actuaL_FINISH_DATE",
      headerName: "Finish Date",
      // type: "date",
      width: 130,
      renderCell: (params) => {
        return formatDate(params.value);
      },
      flex: 1,
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  const orderTypes = Array.from(new Set(items.map((row) => row.ordeR_TYPE)));

  const filteredRows = items.filter((row) => {
    const matchWorkOrder = row.orderid
      ?.toString()
      .toLowerCase()
      .includes(workOrderFilter.toLowerCase());

    const matchStatus = statusFilter === "" || row.weB_STATUS === statusFilter;

    const matchOrderType =
      orderTypeFilter === "" || row.ordeR_TYPE === orderTypeFilter;

    // const matchDate =
    //   !dateFilter ||
    //   (row.StartDate instanceof Date &&
    //     row.StartDate.toISOString().split("T")[0] === dateFilter);

    return matchWorkOrder && matchStatus && matchOrderType;
  });

  return (
    <div style={{ height: "100%" }}>
      <AppHeader title={step?.title} icon={<BackupTableIcon />} />
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
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4">4</MenuItem>
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

      <Paper sx={{ height: "100vh", width: "100%", paddingBottom: 8 }}>
        <DataGrid
          checkboxSelection={false}
          rows={filteredRows}
          getRowId={(items) => items.orderid}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 30, page: 0 },
            },
          }}
          pageSizeOptions={[10, 20, 30]}
          sx={{ border: 0, width: "100%" }}
          onRowClick={(params) => {
            navigate(`/WorkStation`, { state: params.row });
          }}
        />
      </Paper>
    </div>
  );
};
export default DashboardRefurbish;
