import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callApi from "../../Services/callApi";
import AppHearder from "../../Component/AppHeader";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Button,
  TextField,
  Skeleton,
  Alert,
  Divider,
} from "@mui/material";

// ===== Types =====
type TOHistoryItem = {
  id?: number;
  material: string;
  quantity: number;
  description: string;
  stge_loc?: string;
  material_type?: string;
  created_date?: string;
  status?: string;
};

// ===== Helpers =====
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

const statusColor = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
    case "C":
    case "Y":
      return { bg: "#DCFCE7", color: "#16A34A", label: "สำเร็จ" };
    case "PENDING":
    case "N":
      return { bg: "#FEF9C3", color: "#A16207", label: "รอดำเนินการ" };
    case "REJECTED":
    case "R":
      return { bg: "#FEE2E2", color: "#DC2626", label: "ปฏิเสธ" };
    default:
      return { bg: "#F1F5F9", color: "#64748B", label: status || "-" };
  }
};

// ===== Component =====
export default function TransferOrderHistory() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const [data, setData] = useState<TOHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (orderId) fetchTOHistory();
  }, [orderId]);

  const fetchTOHistory = async () => {
    setLoading(true);
    setError("");
    try {
      // TODO: ใส่ endpoint จริงเมื่อได้
      // const res = await callApi.get(`/Mobile/TransferOrderHistory/${orderId}`);
      // const result = res.data?.dataResult || [];
      // setData(result);

      console.log("⏳ TO History API — waiting for endpoint. orderId:", orderId);
      setData([]); // placeholder — ยังไม่มี API
    } catch (e: any) {
      console.error("TO History Error:", e);
      setError("โหลดข้อมูลไม่สำเร็จ");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();
    if (!k) return data;
    return data.filter(
      (item) =>
        item.material.toLowerCase().includes(k) ||
        (item.description || "").toLowerCase().includes(k) ||
        (item.stge_loc || "").toLowerCase().includes(k)
    );
  }, [data, search]);

  // KPI
  const totalItems = filtered.length;
  const totalQty = filtered.reduce((sum, x) => sum + (x.quantity || 0), 0);

  return (
    <Box sx={{ p: 2, background: "#f5f6fa", minHeight: "100vh" }}>
      <AppHearder
        title="Transfer Order History"
        icon={<LocalShippingIcon />}
      />

      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 7 }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
          mb={3}
        >
          <Box>

            <Typography
              variant="h4"
              fontWeight={900}
              sx={{ letterSpacing: -0.5, color: "#1D3557", mt: 1 }}
            >
              รายการ Transfer Order
            </Typography>
            <Typography variant="body1" sx={{ color: "#5C6F7C", mt: 0.5 }}>
              Work Order: <b>{orderId || "-"}</b> — แสดงรายการ TO
              ที่สร้างจากการเพิ่มอะไหล่
            </Typography>
          </Box>

          {/* KPI Cards */}
          <Stack direction="row" spacing={1.5}>
            <Paper
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                border: "1px solid #DBEAFE",
                bgcolor: "#EFF6FF",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                รายการ
              </Typography>
              <Typography variant="h5" fontWeight={900} color="#2563EB">
                {totalItems}
              </Typography>
            </Paper>
            <Paper
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                border: "1px solid #BBF7D0",
                bgcolor: "#F0FDF4",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                จำนวนรวม
              </Typography>
              <Typography variant="h5" fontWeight={900} color="#16A34A">
                {totalQty}
              </Typography>
            </Paper>
          </Stack>
        </Stack>

        {/* Search */}
        <TextField
          placeholder="ค้นหา Material / Description..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            bgcolor: "white",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Paper key={i} sx={{ p: 2, borderRadius: 3 }}>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="70%" height={22} />
                <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
              </Paper>
            ))}
          </Stack>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <Paper
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: "center",
              border: "1px solid #E2E8F0",
            }}
          >
            <LocalShippingIcon
              sx={{ fontSize: 56, color: "#CBD5E1", mb: 1.5 }}
            />
            <Typography
              variant="h6"
              sx={{ color: "#94A3B8", fontWeight: 600 }}
            >
              ยังไม่มีรายการ Transfer Order
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#B0BEC5", mt: 0.5 }}
            >
              รายการ TO จะแสดงที่นี่เมื่อมีการเพิ่มอะไหล่และสร้าง TO สำเร็จ
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#94A3B8", mt: 2, display: "block" }}
            >
              ⏳ API endpoint สำหรับดึงข้อมูล TO ยังไม่พร้อมใช้งาน
            </Typography>
          </Paper>
        )}

        {/* TO List */}
        {!loading && filtered.length > 0 && (
          <Stack spacing={1.5}>
            {filtered.map((item, idx) => {
              const sc = statusColor(item.status);
              return (
                <Paper
                  key={item.id ?? idx}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid #E2E8F0",
                    transition: "box-shadow 0.15s ease",
                    "&:hover": {
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={800} noWrap>
                        {item.material}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748B" }}
                        noWrap
                      >
                        {item.description || "-"}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Chip
                        size="small"
                        label={`+${item.quantity}`}
                        sx={{
                          bgcolor: "#DCFCE7",
                          color: "#16A34A",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      />
                      <Chip
                        size="small"
                        label={sc.label}
                        sx={{
                          bgcolor: sc.bg,
                          color: sc.color,
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                  >
                    {item.stge_loc && (
                      <Chip
                        size="small"
                        label={`SLOC: ${item.stge_loc}`}
                        variant="outlined"
                      />
                    )}
                    {item.created_date && (
                      <Chip
                        size="small"
                        label={fmtDateTimeTH(item.created_date)}
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
