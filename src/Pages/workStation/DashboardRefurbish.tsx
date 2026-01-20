// DataGrid ถูกแทนที่ด้วย MaterialReactTable
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
  Button,
} from "@mui/material";
import { Description, Filter } from "@mui/icons-material";
import React, {
  use,
  useEffect,
  useState,
  createContext,
  useContext,
  useMemo,
} from "react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import AppHeader from "../../Component/AppHeader";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import callApi from "../../Services/callApi";
import { set } from "react-hook-form";
import { formatDate, formatTime } from "../../Utility/DatetimeService";
import { useWork } from "../../Context/WorkStationContext";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import Swal from "sweetalert2";
import { SlaTimer } from "../../Utility/SlaTimer";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

// Copy จาก SlaTimer.tsx
function parseTimeToHms(time?: string | null) {
  if (!time) return null;
  const t = time.trim();
  if (/^\d{6}$/.test(t)) {
    const hh = Number(t.slice(0, 2));
    const mm = Number(t.slice(2, 4));
    const ss = Number(t.slice(4, 6));
    if ([hh, mm, ss].some(Number.isNaN)) return null;
    return { hh, mm, ss };
  }
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
    const [h, m, s = "00"] = t.split(":");
    return { hh: Number(h), mm: Number(m), ss: Number(s) };
  }
  return null;
}

function buildTargetMs(dateStr?: string | null, timeStr?: string | null) {
  if (!dateStr) return null;
  const base = new Date(dateStr);
  if (!Number.isFinite(base.getTime())) return null;
  const hms = parseTimeToHms(timeStr);
  if (!hms) return null;
  base.setHours(hms.hh, hms.mm, hms.ss, 0);
  return base.getTime();
}

function getSlaStatus(row: any): "green" | "yellow" | "red" | "none" {
  const startMs = buildTargetMs(row.slA_START_DATE, row.slA_START_TIME);
  const finishMs = buildTargetMs(row.slA_FINISH_DATE, row.slA_FINISH_TIME);
  if (!startMs || !finishMs || finishMs <= startMs) return "none";

  const nowMs = Date.now();
  const remainingMs = finishMs - nowMs;
  const totalMs = finishMs - startMs;

  if (remainingMs < 0) return "red";
  const percent = nowMs <= startMs ? 100 : (remainingMs / totalMs) * 100;
  if (percent >= 31) return "green";
  return "yellow";
}


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



  type WorkOrderRow = {
    orderid: string;
    ordeR_TYPE?: string;
    shorT_TEXT?: string;
    equipment?: string;
    weB_STATUS?: string;

    slA_FINISH_DATE?: any;
    slA_FINISH_TIME?: any;
    slA_START_DATE?: any;
    slA_START_TIME?: any;

    slaFinishDate?: any;
    slaFinishTime?: any;
    slaStartDate?: any;
    slaStartTime?: any;

    actuaL_START_DATE?: any;
    actuaL_FINISH_DATE?: any;

    worK_ORDER_OPERATION_ID?: string;
    current_operation?: string;
  };

  useEffect(() => {
    setStep(location.state);
    console.log(location.state);
  }, []);

  useEffect(() => {
    onLoad();
    //onLoad2();
  }, []);

  const onLoad = async () => {
    if (step.station == null && step.type === "workOrderList") {
      let res = await callApi.get("/WorkOrderList/workOrderList");
      console.log("work order list", res.data.dataResult);
      setItems(res.data.dataResult);
      setWork(res.data.dataResult);
    } else if (step.station == null && step.type === "stockReport") {
      navigate("/StockReport", { replace: true });
    } else {
      console.log("step : ", step.station);
      console.log(work?.orderid);
      let res = await callApi.get(
        `/WorkOrderList/workOrderList/${step.station}`
      );
      console.log("Each order in fontend in dashboard : ", res.data.dataResult);
      setItems(res.data.dataResult);
      setWork(res.data.dataResult);
      console.log(work);
      //setItemEach(data);
    }
  };

  // Material React Table Columns
  const columns = useMemo<MRT_ColumnDef<WorkOrderRow>[]>(
    () => [
      {
        header: "SLA Timer",
        accessorKey: "slaFinishDate",
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <SlaTimer
            slaFinishDate={row.original.slA_FINISH_DATE ?? row.original.slaFinishDate}
            slaFinishTime={row.original.slA_FINISH_TIME ?? row.original.slaFinishTime}
            slaStartDate={String(row.original.slA_START_DATE)}
            slaStartTime={String(row.original.slA_START_TIME)}
          />
        ),
      },
      {
        accessorKey: "orderid",
        header: "Work Order",
      },
      {
        accessorKey: "ordeR_TYPE",
        header: "Order Type",
      },
      {
        accessorKey: "equipment",
        header: "Equipment",
      },
      {
        accessorKey: "actuaL_START_DATE",
        header: "Start Date",
        Cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
      {
        accessorKey: "actuaL_FINISH_DATE",
        header: "Finish Date",
        Cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
      {
        accessorKey: "shorT_TEXT",
        header: "Description",
      },
    ],
    []
  );

  const startWork = (orderid: string) => {
    Swal.fire({
      title: "Start Work?",
      text: "Are you sure you want to start this work order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Start",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#27ae60",
      cancelButtonColor: "#e74c3c",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await callApi.post("/WorkOrderList/StartWorkOrder", {
          ORDERID: orderid,
        });
        const data = res.data;
        console.log("Start Work Order : ", data);

        if (!data.isSuccess) {
          await Swal.fire({
            title: "Failed",
            text: data.Message ?? "Cannot start this work order.",
            icon: "error",
          });
          return;
        }

        Swal.fire({
          title: "Started!",
          text: "Work order has been started successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        console.error("StartWorkOrder error:", err);
        await Swal.fire({
          title: "Error",
          text: err.response?.data?.Message || "Something went wrong.",
          icon: "error",
        });
      }
    });
  };

  const paginationModel = { page: 0, pageSize: 5 };

  const safeItems = Array.isArray(items) ? items : [];


  const filteredRows = safeItems.filter((row) => {
    const matchWorkOrder = row.orderid
      ?.toString()
      .toLowerCase()
      .includes(workOrderFilter.toLowerCase());

    const matchSlaStatus = stationToFilter === "" ||
      getSlaStatus(row) === stationToFilter;
    return matchWorkOrder && matchSlaStatus;
  });


  return (
    <div style={{ height: "100%" }}>
      <AppHeader title={step?.title} icon={<BackupTableIcon />} />
      <Stack direction="row" spacing={2} mb={2} mt={10} px={5}>

        {/* <FormControl size="small" sx={{ minWidth: 140 }}>
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
        </FormControl> */}


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

            <MenuItem value="green">🟢 เวลาเหลือเยอะ</MenuItem>
            <MenuItem value="yellow">🟡 ใกล้ถึงเวลา</MenuItem>
            <MenuItem value="red">🔴 เลย SLA</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ width: "100%", height: "calc(100vh - 180px)", mt: 2, mb: 8 }}>
        <MaterialReactTable
          enableGlobalFilter={true}
          columns={columns}
          data={filteredRows as WorkOrderRow[]}
          enableColumnFilters={true}
          enablePagination={true}
          enableRowSelection={false}
          initialState={{
            showGlobalFilter: true,
            pagination: { pageSize: 30, pageIndex: 0 },
          }}
          muiTablePaperProps={{
            sx: {
              display: "flex",
              flexDirection: "column",
              height: "100%",

            },
          }}
          muiTableContainerProps={{
            sx: {
              flexGrow: 1,
              minHeight: "calc(100vh - 280px)",

            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              if (step.station == null) return;
              console.log("row.original.worK_ORDER_OPERATION_ID : ", row.original.worK_ORDER_OPERATION_ID);
              console.log("row.original.orderid : ", row.original.orderid);
              navigate(`/WorkStation/${row.original.orderid}/${row.original.worK_ORDER_OPERATION_ID}`, {
                state: { current_operation: row.original.current_operation },
              });
            },
            sx: { cursor: step.station != null ? "pointer" : "default" },
          })}
          muiSearchTextFieldProps={{
            placeholder: "ค้นหา Work Order...",
            sx: { minWidth: 300 },
            variant: "outlined",
            size: "small",
          }}
        />
      </Box>
    </div>
  );
};
export default DashboardRefurbish;
