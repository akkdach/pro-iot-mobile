import React, { useEffect, useMemo, useState } from "react";
import AppHearder from "../../Component/AppHeader";
import InventoryIcon from "@mui/icons-material/Inventory";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Tooltip,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import type { MRT_ColumnDef } from "material-react-table";
import callApi from "../../Services/callApi";
import { useNavigate } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

type WorkCenterObj = {
  wK_CTR: string;
  plant: string;
  description: string;
  starT_TIME: string;
  finisH_TIME: string;
  breaK_TIME: string;
  length: string;
  width: string;
  height: string;
  ot: string;
  zone: string;
  vaN_SUP: string;
};

type StockReportItem = {
  reS_ID: number;
  orderid: string | null;
  worK_ORDER_OBJ: any;
  reS_DATE: string;
  movE_TYPE: string | null;
  wK_CTR: string;
  worK_CENTER_OBJ: WorkCenterObj;
  materialType: string;
};

const fmtDateTimeTH = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const hhmmssToHHMM = (v?: string) => {
  if (!v || v.length < 4) return "-";
  const hh = v.slice(0, 2);
  const mm = v.slice(2, 4);
  return `${hh}:${mm}`;
};

const StockReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StockReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters (MVP)
  const [q, setQ] = useState("");
  const [workCenter, setWorkCenter] = useState("");
  const [plant, setPlant] = useState("");
  const [materialType, setMaterialType] = useState("");

  // Detail dialog
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StockReportItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await callApi.get("/WorkOrderList/stockReport");
        setData(res?.data?.dataResult ?? []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // options
  const wcOptions = useMemo(() => {
    const s = new Set(data.map((x) => x.wK_CTR).filter(Boolean));
    return Array.from(s).sort();
  }, [data]);

  const plantOptions = useMemo(() => {
    const s = new Set(
      data.map((x) => x.worK_CENTER_OBJ?.plant).filter(Boolean)
    );
    return Array.from(s).sort();
  }, [data]);

  const mtOptions = useMemo(() => {
    const s = new Set(data.map((x) => x.materialType).filter(Boolean));
    return Array.from(s).sort();
  }, [data]);

  // filter data (simple + fast)
  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return data.filter((x) => {
      const hitKeyword =
        !keyword ||
        String(x.reS_ID).includes(keyword) ||
        (x.wK_CTR ?? "").toLowerCase().includes(keyword) ||
        (x.worK_CENTER_OBJ?.description ?? "")
          .toLowerCase()
          .includes(keyword) ||
        (x.worK_CENTER_OBJ?.plant ?? "").toLowerCase().includes(keyword) ||
        (x.materialType ?? "").toLowerCase().includes(keyword) ||
        (x.orderid ?? "").toLowerCase().includes(keyword);

      const hitWC = !workCenter || x.wK_CTR === workCenter;
      const hitPlant = !plant || x.worK_CENTER_OBJ?.plant === plant;
      const hitMT = !materialType || x.materialType === materialType;

      return hitKeyword && hitWC && hitPlant && hitMT;
    });
  }, [data, q, workCenter, plant, materialType]);

  // KPI
  const kpi = useMemo(() => {
    const total = filtered.length;
    const wc = new Set(filtered.map((x) => x.wK_CTR)).size;
    const dates = filtered
      .map((x) => new Date(x.reS_DATE))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    const range =
      dates.length === 0
        ? "-"
        : `${dates[0].toLocaleDateString("th-TH")} → ${dates[
            dates.length - 1
          ].toLocaleDateString("th-TH")}`;
    return { total, wc, range };
  }, [filtered]);

  const columns = useMemo<MRT_ColumnDef<StockReportItem>[]>(
    () => [
      {
        accessorKey: "reS_ID",
        header: "ID",
        size: 70,
      },
      {
        accessorKey: "reS_DATE",
        header: "วันที่/เวลา",
        size: 170,
        Cell: ({ cell }) => (
          <Stack spacing={0.5}>
            <Typography fontWeight={700}>
              {fmtDateTimeTH(cell.getValue<string>())}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ISO: {String(cell.getValue<string>()).slice(0, 19)}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "wK_CTR",
        header: "Work Center",
        size: 110,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={row.original.wK_CTR} />
            <Typography variant="body2" color="text.secondary">
              {row.original.worK_CENTER_OBJ?.description || "-"}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "worK_CENTER_OBJ.plant",
        header: "Plant",
        size: 80,
        Cell: ({ row }) => row.original.worK_CENTER_OBJ?.plant || "-",
      },
      {
        accessorKey: "materialType",
        header: "Material",
        size: 90,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue<string>() || "-"}
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: "orderid",
        header: "Order",
        size: 120,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? "-",
      },
      {
        id: "shift",
        header: "กะเวลา",
        size: 130,
        Cell: ({ row }) => {
          const wc = row.original.worK_CENTER_OBJ;
          return (
            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label={`เริ่ม ${hhmmssToHHMM(wc?.starT_TIME)}`}
              />
              <Chip
                size="small"
                label={`จบ ${hhmmssToHHMM(wc?.finisH_TIME)}`}
              />
            </Stack>
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ p: 2, background: "#f5f6fa", minHeight: "100vh", marginTop: 7 }}>
      <AppHearder title="Stock Report" icon={<InventoryIcon />} />

      <Stack spacing={2}>
        {/* Title + KPI */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="stretch"
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={800} color="#2d3a4b">
              รายงานสต็อก / Movement Log
            </Typography>
            <Typography variant="body2" color="text.secondary">
              เหมาะกับข้อมูลแบบ log (มี null เยอะและมี object ซ้อน) —
              แยกดูรายละเอียดรายแถวได้
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <Paper sx={{ px: 2, py: 1.2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                รายการ
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {kpi.total}
              </Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1.2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Work Center
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {kpi.wc}
              </Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1.2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                ช่วงวันที่
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {kpi.range}
              </Typography>
            </Paper>
          </Stack>
        </Stack>

        {/* Filters */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              size="small"
              label="ค้นหา (ID, WC, Plant, Type, Order)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ flex: 1, minWidth: 260 }}
            />

            <TextField
              select
              size="small"
              label="Work Center"
              value={workCenter}
              onChange={(e) => setWorkCenter(e.target.value)}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {wcOptions.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Plant"
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {plantOptions.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Material Type"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {mtOptions.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 2,
            height: "calc(100vh - 180px)",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Action bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start", // ✅ ชิดซ้าย
              mb: 1,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
                py: 0.8,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
              }}
              onClick={() => {
                navigate("/AddSpareFromStock");
              }}
            >
              เพิ่มรายการ
            </Button>
          </Box>
          <MaterialReactTable
            displayColumnDefOptions={{
              "mrt-row-actions": {
                header: "Action",
                size: 160,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
              },
            }}
            columns={columns}
            data={filtered}
            enableStickyHeader
            enableDensityToggle={false}
            initialState={{
              pagination: { pageSize: 30, pageIndex: 0 },
              sorting: [{ id: "reS_DATE", desc: true }],
            }}
            state={{
              isLoading: loading,
              showProgressBars: loading,
              showSkeletons: loading,
            }}
            muiTablePaperProps={{
              elevation: 0,
              sx: { flex: 1, display: "flex", flexDirection: "column" },
            }}
            muiTableContainerProps={{
              sx: {
                flex: 1,
                height: "100%",
                borderRadius: 2,
              },
            }}
            muiTableBodyRowProps={({ row }) => ({
              onDoubleClick: () => {
                setSelected(row.original);
                setOpen(true);
              },
              sx: {
                cursor: "pointer",
                "&:nth-of-type(odd)": { backgroundColor: "rgba(0,0,0,0.02)" },
              },
            })}
            enableRowActions
            positionActionsColumn="last"
            renderRowActions={({ row }) => (
              <Tooltip title="ดูรายละเอียด">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<InfoOutlinedIcon />}
                  onClick={() =>
                    navigate(`/StockReportItem/${row.original.reS_ID}`)
                  }
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    px: 2.5,
                    whiteSpace: "nowrap",
                    minWidth: 120,
                  }}
                >
                  รายละเอียด
                </Button>
              </Tooltip>
            )}
            localization={{
              noRecordsToDisplay: "ไม่พบข้อมูล",
            }}
          />
        </Paper>
      </Stack>

      {/* Detail Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>รายละเอียดรายการ</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`ID: ${selected.reS_ID}`} />
                <Chip label={`WC: ${selected.wK_CTR}`} variant="outlined" />
                <Chip
                  label={`Type: ${selected.materialType}`}
                  variant="outlined"
                />
              </Stack>

              <Typography>
                <b>วันที่บันทึก:</b> {fmtDateTimeTH(selected.reS_DATE)}
              </Typography>
              <Typography>
                <b>Order ID:</b> {selected.orderid ?? "-"}
              </Typography>
              <Divider />

              <Typography fontWeight={800}>Work Center</Typography>
              <Typography>
                <b>Plant:</b> {selected.worK_CENTER_OBJ?.plant || "-"}
              </Typography>
              <Typography>
                <b>Description:</b>{" "}
                {selected.worK_CENTER_OBJ?.description || "-"}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={`Start: ${hhmmssToHHMM(
                    selected.worK_CENTER_OBJ?.starT_TIME
                  )}`}
                />
                <Chip
                  label={`Finish: ${hhmmssToHHMM(
                    selected.worK_CENTER_OBJ?.finisH_TIME
                  )}`}
                />
                <Chip
                  label={`Break: ${hhmmssToHHMM(
                    selected.worK_CENTER_OBJ?.breaK_TIME
                  )}`}
                />
              </Stack>

              <Divider />
              <Typography fontWeight={800}>Raw JSON</Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.2,
                  borderRadius: 2,
                  background: "rgba(0,0,0,0.04)",
                  overflow: "auto",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(selected, null, 2)}
              </Box>
            </Stack>
          ) : (
            <Typography color="text.secondary">-</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StockReport;
