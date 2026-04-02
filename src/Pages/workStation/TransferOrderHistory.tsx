import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callApi from "../../Services/callApi";
import AppHearder from "../../Component/AppHeader";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  TextField,
  Skeleton,
  Alert,
  InputAdornment,
  Fade,
  IconButton,
} from "@mui/material";

// ===== Types =====
type TOHistoryItem = {
  reS_ID: number;
  orderid: string;
  worK_ORDER_OBJ: string | null;
  wK_CTR: string;
  worK_CENTER_OBJ: string | null;
  assigneD_WK_CTR: string | null;
  reS_DATE: string;
  movE_TYPE: string | null;
  movE_PLANT: string;
  movE_STLOC: string;
  weB_STATUS: number;
  reservatioN_NO: string;
  froM_VAN: string;
  finaL_GR: string | null;
  posT_SHIP: string | null;
  materialType: string;
  approvE_USER: string | null;
  approvE_DATE: string | null;
  approvE_TIME: string | null;
  isApprove: string;
  spare_part_request_item: any[] | null;
};

type SpareItem = {
  reS_ITEM_ID: number;
  reS_ID: number;
  sparE_PART_REQUEST_OBJ: string | null;
  wK_CTR: string;
  worK_CENTER_OBJ: string | null;
  orderid: string | null;
  worK_ORDER_OBJ: string | null;
  material: string;
  plant: string;
  stgE_LOC: string;
  batch: string | null;
  vaL_TYPE: string | null;
  entrY_QNT: number;
  movement: string | null;
};

// ===== Helpers =====
const fmtDateTimeTH = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const approveInfo = (val?: string) => {
  switch (val?.toUpperCase()) {
    case "Y":
      return { bg: "#DCFCE7", color: "#15803D", label: "อนุมัติแล้ว", dot: "#22C55E" };
    case "N":
      return { bg: "#FEF3C7", color: "#92400E", label: "รอดำเนินการ", dot: "#F59E0B" };
    case "R":
      return { bg: "#FEE2E2", color: "#DC2626", label: "ปฏิเสธ", dot: "#EF4444" };
    default:
      return { bg: "#F1F5F9", color: "#64748B", label: val || "-", dot: "#94A3B8" };
  }
};

// ===== Component =====
export default function TransferOrderHistory() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const [data, setData] = useState<TOHistoryItem[]>([]);
  const [spareItems, setSpareItems] = useState<Record<number, SpareItem[]>>({});
  const [materialNames, setMaterialNames] = useState<Record<string, string>>({});
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
      // ดึง TO History + Material Master พร้อมกัน
      const [res, resMaster] = await Promise.all([
        callApi.get(`/WorkOrderList/TO_history/${orderId}`),
        callApi.get("/Mobile/GetMaterialMaster").catch(() => null),
      ]);

      const result: TOHistoryItem[] = res.data?.dataResult || [];
      console.log("✅ TO History:", result);
      setData(result);

      // สร้าง map ชื่ออะไหล่จาก Material Master
      const masterList: any[] = resMaster?.data?.dataResult ?? [];
      const nameMap: Record<string, string> = {};
      masterList.forEach((sp: any) => {
        if (sp.material && sp.description) {
          nameMap[sp.material] = sp.description;
        }
      });
      console.log("✅ Material Name Map:", nameMap);
      setMaterialNames(nameMap);

      // ดึง spare items ของแต่ละ TO
      const spareMap: Record<number, SpareItem[]> = {};
      await Promise.all(
        result.map(async (to) => {
          try {
            const spareRes = await callApi.get(`/WorkOrderList/TO_history/spareItem/${to.reS_ID}`);
            spareMap[to.reS_ID] = spareRes.data?.dataResult || [];
          } catch {
            spareMap[to.reS_ID] = [];
          }
        })
      );
      console.log("✅ Spare Items:", spareMap);
      setSpareItems(spareMap);
    } catch (e: any) {
      console.error("TO History Error:", e);
      setError("โหลดข้อมูลไม่สำเร็จ");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();
    if (!k) return data;
    return data.filter(
      (item) =>
        (item.wK_CTR || "").toLowerCase().includes(k) ||
        (item.reservatioN_NO || "").toLowerCase().includes(k) ||
        (item.movE_STLOC || "").toLowerCase().includes(k) ||
        (item.froM_VAN || "").toLowerCase().includes(k) ||
        (item.movE_PLANT || "").toLowerCase().includes(k) ||
        String(item.reS_ID).includes(k)
    );
  }, [data, search]);

  const totalItems = filtered.length;
  const approvedCount = filtered.filter((x) => x.isApprove === "Y").length;
  const pendingCount = filtered.filter((x) => x.isApprove === "N").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F6FA", pb: 6 }}>
      <AppHearder title="TO History" icon={<LocalShippingIcon />} />

      <Box sx={{ mt: 9, px: 1.5 }}>

        {/* ── Header ── */}
        <Fade in timeout={400}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5} mt={1.5}>
            <Box>
              <Typography fontWeight={800} fontSize={20} sx={{ color: "#1E293B", lineHeight: 1.2 }}>
                รายการ TO
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                Order: <b style={{ color: "#3B82F6" }}>{orderId || "-"}</b>
              </Typography>
            </Box>
            <IconButton
              onClick={fetchTOHistory}
              disabled={loading}
              sx={{
                bgcolor: "#EEF2FF",
                border: "1px solid #C7D2FE",
                "&:hover": { bgcolor: "#E0E7FF" },
              }}
            >
              <RefreshRoundedIcon sx={{ color: "#6366F1", fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Fade>

        {/* ── KPI Row ── */}
        <Fade in timeout={500}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <KpiCard
              label="ทั้งหมด"
              value={totalItems}
              bgColor="#EFF6FF"
              borderColor="#BFDBFE"
              valueColor="#1D4ED8"
              icon={<InventoryRoundedIcon sx={{ fontSize: 28, color: "#3B82F6", opacity: 0.15 }} />}
            />
            <KpiCard
              label="อนุมัติ"
              value={approvedCount}
              bgColor="#F0FDF4"
              borderColor="#BBF7D0"
              valueColor="#15803D"
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 28, color: "#22C55E", opacity: 0.15 }} />}
            />
            <KpiCard
              label="รอดำเนินการ"
              value={pendingCount}
              bgColor="#FFFBEB"
              borderColor="#FDE68A"
              valueColor="#92400E"
              icon={<AccessTimeRoundedIcon sx={{ fontSize: 28, color: "#F59E0B", opacity: 0.15 }} />}
            />
          </Box>
        </Fade>

        {/* ── Search ── */}
        <TextField
          placeholder="ค้นหา..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: "#fff",
              height: 42,
              fontSize: "0.875rem",
              border: "1px solid #E2E8F0",
              "&:hover": { borderColor: "#CBD5E1" },
              "&.Mui-focused": {
                borderColor: "#3B82F6",
                boxShadow: "0 0 0 3px rgba(59,130,246,0.08)",
              },
              "& fieldset": { border: "none" },
            },
          }}
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.85rem" }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                <Skeleton variant="text" width="50%" height={22} />
                <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} />
                <Skeleton variant="rounded" height={48} sx={{ mt: 1, borderRadius: 2 }} />
              </Paper>
            ))}
          </Stack>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && !error && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <LocalShippingIcon sx={{ fontSize: 30, color: "#A5B4FC" }} />
              </Box>
              <Typography fontWeight={700} fontSize={16} sx={{ color: "#64748B" }}>
                ยังไม่มีรายการ TO
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", mt: 0.5, display: "block" }}>
                รายการจะแสดงเมื่อมีการสร้าง TO สำเร็จ
              </Typography>
            </Box>
          </Fade>
        )}

        {/* ── TO Cards ── */}
        {!loading && filtered.length > 0 && (
          <Stack spacing={2}>
            {filtered.map((item, idx) => {
              const status = approveInfo(item.isApprove);
              return (
                <Fade in timeout={300 + idx * 60} key={item.reS_ID ?? idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #E2E8F0",
                      overflow: "hidden",
                      transition: "box-shadow 0.15s",
                      "&:active": { boxShadow: "0 0 0 2px rgba(59,130,246,0.15)" },
                    }}
                  >
                    {/* Color bar */}
                    <Box sx={{ height: 3, bgcolor: status.dot }} />

                    <Box sx={{ p: 2, py: 2.5 }}>
                      {/* Top: ID + Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography fontWeight={800} fontSize={15} sx={{ color: "#1E293B" }}>
                            TO #{item.reservatioN_NO} (resId: {item.reS_ID})
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94A3B8", lineHeight: 1 }}>
                            {fmtDateTimeTH(item.reS_DATE)}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={status.label}
                          sx={{
                            bgcolor: status.bg,
                            color: status.color,
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            height: 24,
                            borderRadius: 1.5,
                          }}
                        />
                      </Stack>

                      {/* Detail 2x2 grid */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px 12px",
                          mt: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "#FAFBFC",
                        }}
                      >
                        <MiniDetail label="Work Center" value={item.wK_CTR} />
                        <MiniDetail label="Plant" value={item.movE_PLANT} />
                        <MiniDetail label="SLOC ปลายทาง" value={item.movE_STLOC} />
                        <MiniDetail label="จากคลัง" value={item.froM_VAN} />
                      </Box>

                      {/* ── Spare Part Items ── */}
                      {(spareItems[item.reS_ID] || []).length > 0 && (
                        <Box
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            border: "1px solid #E2E8F0",
                            overflow: "hidden",
                          }}
                        >
                          {/* Table header */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 80px 80px",
                              px: 1.5,
                              py: 1,
                              bgcolor: "#F1F5F9",
                              borderBottom: "1px solid #E2E8F0",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.3 }}>
                              Material
                            </Typography>
                            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.3, textAlign: "center" }}>
                              จำนวน
                            </Typography>
                            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.3, textAlign: "center" }}>
                              SLOC
                            </Typography>
                          </Box>

                          {/* Rows */}
                          {(spareItems[item.reS_ID] || []).map((sp, spIdx) => (
                            <Box
                              key={sp.reS_ITEM_ID}
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 80px 80px",
                                px: 1.5,
                                py: 1,
                                bgcolor: spIdx % 2 === 0 ? "#fff" : "#FAFBFC",
                                borderBottom: spIdx < (spareItems[item.reS_ID] || []).length - 1 ? "1px solid #F1F5F9" : "none",
                                alignItems: "center",
                              }}
                            >
                              <Box>
                                <Typography fontWeight={700} fontSize={13} sx={{ color: "#334155" }} noWrap>
                                  {materialNames[sp.material] || sp.material}
                                </Typography>
                                {materialNames[sp.material] && (
                                  <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", lineHeight: 1.2 }} noWrap>
                                    {sp.material}
                                  </Typography>
                                )}
                              </Box>
                              <Chip
                                size="small"
                                label={sp.entrY_QNT}
                                sx={{
                                  bgcolor: "#DCFCE7",
                                  color: "#15803D",
                                  fontWeight: 800,
                                  fontSize: "0.75rem",
                                  height: 22,
                                  borderRadius: 1.5,
                                  mx: "auto",
                                }}
                              />
                              <Typography fontSize={12} sx={{ color: "#64748B", textAlign: "center" }}>
                                {sp.stgE_LOC || "-"}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Extra chips */}
                      {(item.materialType || item.reservatioN_NO) && (
                        <Stack direction="row" spacing={0.75} mt={1.5} flexWrap="wrap" useFlexGap>
                          {item.materialType && (
                            <Chip
                              size="small"
                              label={`ประเภท: ${item.materialType}`}
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 22, borderRadius: 1.5, borderColor: "#E2E8F0" }}
                            />
                          )}
                          {item.reservatioN_NO && (
                            <Chip
                              size="small"
                              label={`Resv: ${item.reservatioN_NO}`}
                              sx={{
                                fontSize: "0.7rem",
                                height: 22,
                                borderRadius: 1.5,
                                bgcolor: "#EFF6FF",
                                color: "#2563EB",
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Stack>
                      )}

                      {/* Approve footer */}
                      {item.approvE_USER && (
                        <Stack direction="row" alignItems="center" spacing={0.5} mt={1.5} sx={{ pt: 1, borderTop: "1px solid #F1F5F9" }}>
                          <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "#22C55E" }} />
                          <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.7rem" }}>
                            {item.approvE_USER}
                            {item.approvE_DATE ? ` · ${fmtDateTimeTH(item.approvE_DATE)}` : ""}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Paper>
                </Fade>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// ===== KPI Card =====
function KpiCard({
  label,
  value,
  bgColor,
  borderColor,
  valueColor,
  icon,
}: {
  label: string;
  value: number;
  bgColor: string;
  borderColor: string;
  valueColor: string;
  icon: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 2.5,
        bgcolor: bgColor,
        border: `1px solid ${borderColor}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "absolute", right: 4, bottom: 2 }}>{icon}</Box>
      <Typography
        sx={{
          fontSize: "0.6rem",
          fontWeight: 700,
          color: valueColor,
          textTransform: "uppercase",
          letterSpacing: 0.3,
          lineHeight: 1,
          opacity: 0.8,
        }}
      >
        {label}
      </Typography>
      <Typography fontWeight={900} fontSize={24} sx={{ color: valueColor, lineHeight: 1.2, mt: 0.25 }}>
        {value}
      </Typography>
    </Paper>
  );
}

// ===== Mini Detail Cell =====
function MiniDetail({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: "0.6rem",
          fontWeight: 600,
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: 0.3,
          lineHeight: 1,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography fontWeight={700} fontSize={13} sx={{ color: "#334155", lineHeight: 1.2 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}
