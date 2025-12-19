import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callApi from "../../Services/callApi";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  TextField,
  Skeleton,
  Alert,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AppHearder from "../../Component/AppHeader";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { MaterialReactTable } from "material-react-table";
import type { MRT_ColumnDef } from "material-react-table";

type SparePartRequestObj = {
  reS_ID: number;
  wK_CTR: string | null;
  reS_DATE: string | null;
  movE_PLANT: string | null;
  movE_STLOC: string | null;
  froM_VAN: string | null;
  materialType: string | null;
  weB_STATUS: number | null;
  isApprove: string | null;
};

type StockReportDetailItem = {
  reS_ITEM_ID: number;
  reS_ID: number;
  sparE_PART_REQUEST_OBJ: SparePartRequestObj | null;
  wK_CTR: string | null; // ใน item (เช่น 3FL1)
  material: string | null;
  plant: string | null;
  stgE_LOC: string | null;
  batch: string | null;
  vaL_TYPE: string | null;
  entrY_QNT: number | null;
  movement: string | null;
};

type ApiResp = {
  isSuccess: boolean;
  message: string;
  dataResult: StockReportDetailItem[];
};

const fmtDateTimeTH = (iso?: string | null) => {
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

const statusLabel = (webStatus?: number | null) => {
  if (webStatus === 1) return "Active";
  if (webStatus === 0) return "Inactive";
  return "Unknown";
};

const approveLabel = (v?: string | null) => {
  if (!v) return "-";
  if (v === "C") return "Completed";
  if (v === "A") return "Approved";
  if (v === "R") return "Rejected";
  return v;
};

const StockReportItem: React.FC = () => {
  const navigate = useNavigate();
  const { resId } = useParams<{ resId: string }>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [items, setItems] = useState<StockReportDetailItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    onLoad();
  }, []);

  const onLoad = async () => {
    if (!resId) return;
    setLoading(true);
    setError("");
    console.log("ID : na", resId);
    try {
      const res = await callApi.get<ApiResp>(
        `/WorkOrderList/StockReportItem/${resId}`
      );
      const data = res.data?.dataResult ?? [];
      setItems(data);
    } catch (e: any) {
      setItems([]);
      setError("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = useMemo<MRT_ColumnDef<StockReportDetailItem>[]>(
    () => [
      { accessorKey: "reS_ITEM_ID", header: "Item ID", size: 90 },
      { accessorKey: "material", header: "Material", size: 140 },
      {
        accessorKey: "entrY_QNT",
        header: "Qty",
        size: 80,
        Cell: ({ cell }) => {
          const v = cell.getValue<number | null>();
          if (v === null || v === undefined) return "-";
          const n = Number(v);
          if (Number.isNaN(n)) return "-";
          return Number.isInteger(n) ? String(n) : n.toFixed(2);
        },
      },
      { accessorKey: "plant", header: "Plant", size: 80 },
      { accessorKey: "stgE_LOC", header: "SLOC", size: 90 },
      {
        accessorKey: "batch",
        header: "Batch",
        size: 100,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? "-",
      },
      {
        accessorKey: "vaL_TYPE",
        header: "ValType",
        size: 90,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? "-",
      },
      {
        accessorKey: "wK_CTR",
        header: "WK",
        size: 90,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? "-",
      },
      {
        accessorKey: "movement",
        header: "Move",
        size: 90,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? "-",
      },
    ],
    []
  );

  const header = useMemo(() => {
    // ใช้ข้อมูลจากตัวแรกเป็น summary (เพราะเหมือนกันทั้งชุด)
    const first = items?.[0];
    const req = first?.sparE_PART_REQUEST_OBJ;

    return {
      resId: Number(resId) || first?.reS_ID,
      date: req?.reS_DATE ?? null,
      plant: req?.movE_PLANT ?? first?.plant ?? null,
      stloc: req?.movE_STLOC ?? first?.stgE_LOC ?? null,
      fromVan: req?.froM_VAN ?? first?.wK_CTR ?? null,
      wc: req?.wK_CTR ?? null,
      materialType: req?.materialType ?? null,
      webStatus: req?.weB_STATUS ?? null,
      approve: req?.isApprove ?? null,
    };
  }, [items, resId]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((x) => {
      const s = [
        x.reS_ITEM_ID,
        x.material,
        x.plant,
        x.stgE_LOC,
        x.batch,
        x.vaL_TYPE,
        x.wK_CTR,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return s.includes(keyword);
    });
  }, [items, q]);

  const totalQty = useMemo(() => {
    return items.reduce((sum, x) => sum + (Number(x.entrY_QNT) || 0), 0);
  }, [items]);

  return (
    <Box sx={{ p: 2, background: "#f5f6fa", minHeight: "100vh", mb: 6 }}>
      {/* Top bar */}
      <AppHearder title="Stock Report Item" icon={<EventNoteIcon />} />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2, mt: 7 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SummarizeIcon />
          <Box>
            <Typography variant="h5" fontWeight={900} color="#2d3a4b">
              Detail Item
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รายละเอียดรายการย่อยของ RES_ID #{header.resId ?? "-"}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {/* Summary */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          mb: 2,
        }}
      >
        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="70%" height={22} />
            <Skeleton variant="rectangular" height={64} />
          </Stack>
        ) : (
          <Stack spacing={1.2}>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
            >
              <Chip label={`RES_ID: ${header.resId ?? "-"}`} />
              <Chip
                label={`Date: ${fmtDateTimeTH(header.date)}`}
                variant="outlined"
              />
              <Chip
                label={`Plant: ${header.plant ?? "-"}`}
                variant="outlined"
              />
              <Chip label={`SLOC: ${header.stloc ?? "-"}`} variant="outlined" />
              <Chip
                label={`From: ${header.fromVan ?? "-"}`}
                variant="outlined"
              />
              <Chip label={`WC: ${header.wc ?? "-"}`} variant="outlined" />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
            >
              <Chip
                label={`Material Type: ${header.materialType ?? "-"}`}
                color="default"
              />
              <Chip
                label={`Web Status: ${statusLabel(header.webStatus)}`}
                color="default"
              />
              <Chip
                label={`Approve: ${approveLabel(header.approve)}`}
                color="default"
              />
              <Chip label={`Items: ${items.length}`} variant="outlined" />
              <Chip label={`Total Qty: ${totalQty}`} variant="outlined" />
            </Stack>
          </Stack>
        )}
      </Paper>

      {/* Items section */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          height: "100vh"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography fontWeight={900}>รายการวัสดุ (Items)</Typography>
            <Typography variant="body2" color="text.secondary">
              ตารางรายการวัสดุ (ค้นหา/เรียงลำดับได้)
            </Typography>
          </Box>
        </Stack>

        <MaterialReactTable
          columns={itemColumns}
          data={filtered} 
          enableStickyHeader
          enableDensityToggle={false}
          initialState={{
            density: "compact",
            pagination: { pageSize: 10, pageIndex: 0 },
            showGlobalFilter: true, 
          }}
          state={{
            isLoading: loading,
            showProgressBars: loading,
            showSkeletons: loading,
          }}
          muiSearchTextFieldProps={{
            placeholder:
              "Search material / plant / sloc / batch / val type ...",
            size: "small",
            sx: { minWidth: { xs: "100%", md: 380 } },
          }}
          muiTableContainerProps={{ sx: { maxHeight: 520, borderRadius: 2 } }}
          localization={{
            noRecordsToDisplay: "ไม่พบข้อมูล",
          }}
        />
      </Paper>
    </Box>
  );
};

export default StockReportItem;
