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
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

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
    productioN_START_DATE?: any;
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
        header: "Production Start Date",
        accessorFn: (row) => {
          if (!row.productioN_START_DATE) return "ไม่มีข้อมูล";
          const d = new Date(row.productioN_START_DATE);
          return isNaN(d.getTime())
            ? "ไม่มีข้อมูล"
            : d.toLocaleDateString("th-TH", {
              timeZone: "Asia/Bangkok",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
        },
        id: "productioN_START_DATE",
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

  const safeItems = Array.isArray(items) ? items : [];


  const filteredRows = useMemo(() => {
    return safeItems.filter((row) => {
      const matchWorkOrder = row.orderid
        ?.toString()
        .toLowerCase()
        .includes(workOrderFilter.toLowerCase());

      const matchSlaStatus = stationToFilter === "" ||
        getSlaStatus(row) === stationToFilter;
      return matchWorkOrder && matchSlaStatus;
    });
  }, [safeItems, workOrderFilter, stationToFilter]);


  const table = useMaterialReactTable({
    columns,
    data: filteredRows as WorkOrderRow[],
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableGrouping: true,
    enableRowSelection: step?.type === "workOrderList",
    initialState: {
      showGlobalFilter: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      grouping: step?.type === "workOrderList" ? ["productioN_START_DATE"] : [],
      expanded: true, // Expand all groups by default
    },
    muiTablePaperProps: {
      sx: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
      },
    },
    muiTableContainerProps: {
      sx: {
        flexGrow: 1,
        minHeight: "calc(100vh - 280px)",
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        if (step.station == null) return;
        console.log("row.original.worK_ORDER_OPERATION_ID : ", row.original.worK_ORDER_OPERATION_ID);
        console.log("row.original.orderid : ", row.original.orderid);
        navigate(`/WorkStation/${row.original.orderid}/${row.original.worK_ORDER_OPERATION_ID}`, {
          state: {
            current_operation: row.original.current_operation,
            title: step?.title,
            station: step?.station,
          },
        });
      },
      sx: { cursor: step.station != null ? "pointer" : "default" },
    }),
    muiSearchTextFieldProps: {
      placeholder: "ค้นหา Work Order...",
      sx: { minWidth: 300 },
      variant: "outlined",
      size: "small",
    },
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



        {step?.type === "workOrderList" && (
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              const selectedRows = table.getSelectedRowModel().flatRows;

              if (selectedRows.length === 0) {
                await Swal.fire({
                  icon: "warning",
                  title: "ยังไม่ได้เลือกรายการ",
                  text: "กรุณาเลือกรายการที่ต้องการจ่ายงานอย่างน้อย 1 รายการ",
                });
                return;
              }

              const confirm = await Swal.fire({
                title: "ยืนยันการจ่ายงาน",
                text: `คุณต้องการจ่ายงานจำนวน ${selectedRows.length} รายการใช่หรือไม่?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "ยืนยัน",
                cancelButtonText: "ยกเลิก",
              });

              if (!confirm.isConfirmed) return;

              Swal.fire({
                title: "กำลังดำเนินการ...",
                html: "กรุณารอสักครู่",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
              });

              let successCount = 0;
              let failCount = 0;

              for (const row of selectedRows) {
                try {
                  const res = await callApi.post("/WorkOrderList/StartWorkOrder", {
                    ORDERID: row.original.orderid,
                  });
                  if (res.data.isSuccess) {
                    successCount++;
                  } else {
                    failCount++;
                    console.error(`Failed to start order ${row.original.orderid}: ${res.data.Message}`);
                  }
                } catch (error) {
                  failCount++;
                  console.error(`Error starting order ${row.original.orderid}:`, error);
                }
              }

              table.resetRowSelection();
              await onLoad(); // Refresh data

              await Swal.fire({
                icon: failCount === 0 ? "success" : "warning",
                title: "ดำเนินการเสร็จสิ้น",
                text: `จ่ายงานสำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ""}`,
              });
            }}
            sx={{ height: 40 }}
          >
            จ่ายงาน
          </Button>
        )}
      </Stack>

      <Box sx={{ width: "100%", height: "calc(100vh - 180px)", mt: 2, mb: 8 }}>
        <MaterialReactTable table={table} />
      </Box>
    </div>
  );
};
export default DashboardRefurbish;
