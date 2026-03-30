import React from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FactoryIcon from "@mui/icons-material/Factory";
import { useWork } from "../../Context/WorkStationContext";

/* ─── Helpers ─── */
const fmtDate = (d?: string | null) => {
  if (!d) return "-";
  const parts = d.split(".");
  if (parts.length !== 3) return d;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parts[0]} ${months[Number(parts[1]) - 1] ?? parts[1]} ${parts[2]}`;
};

const fmtTime = (t?: string | null) => {
  if (!t) return "-";
  if (t.includes(":")) return t;
  if (t.length >= 4) return `${t.slice(0, 2)}:${t.slice(2, 4)}`;
  return t;
};

const statusColor = (startTime?: string | null, finishTime?: string | null) => {
  if (finishTime) return { bg: "#dcfce7", text: "#166534", label: "Done" };
  if (startTime) return { bg: "#fef9c3", text: "#854d0e", label: "In Progress" };
  return { bg: "#f1f5f9", text: "#64748b", label: "Pending" };
};

/* ─── Sub-components ─── */
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", py: 1, borderBottom: "1px solid #f1f5f9" }}>
    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ minWidth: 120, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ textAlign: "right", wordBreak: "break-word" }}>
      {value || "-"}
    </Typography>
  </Box>
);

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, mt: 1 }}>
    {icon}
    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
      {title}
    </Typography>
  </Box>
);

export default function WorkOrderDetailTab() {
  const { workOrderDetail: data, workOrderDetailLoading: loading } = useWork();

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    );

  if (!data)
    return (
      <Box sx={{ p: 5, textAlign: "center", color: "text.secondary" }}>
        <Typography>ไม่พบข้อมูล Work Order Detail</Typography>
      </Box>
    );

  const header = data.header ?? {};
  const operations: any[] = data.operations ?? [];
  const componentDamages: any[] = data.componentDamages ?? [];

  return (
    <Box sx={{ pb: 4, display: "flex", flexDirection: "column", gap: 2.5 }}>

      {/* ═══════ HEADER ═══════ */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2.5, background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", color: "#fff" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>
                Work Order
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                {header.orderIdDisplay || header.orderIdHead || "-"}
              </Typography>
            </Box>
            <Chip
              label={header.webStatus || "Unknown"}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: header.webStatus === "Completed" ? "#22c55e" : header.webStatus === "Assigned" ? "#f59e0b" : "#64748b",
                color: "#fff",
                fontSize: "0.8rem",
                px: 1,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <SectionTitle icon={<PersonOutlineIcon sx={{ color: "#2563eb", fontSize: 20 }} />} title="ข้อมูลลูกค้า" />
          <InfoRow label="ชื่อลูกค้า" value={header.customerName} />
          <InfoRow label="Segment" value={header.customerSegment} />
          <InfoRow label="Object Type" value={header.objectType} />
          <InfoRow label="Service Item" value={header.serviceItemNo} />
          <InfoRow label="Close Type" value={header.closeType} />

          <Divider sx={{ my: 2 }} />

          <SectionTitle icon={<AccessTimeIcon sx={{ color: "#2563eb", fontSize: 20 }} />} title="กำหนดการ" />
          <InfoRow label="Notification" value={`${header.notificationNumber ?? "-"} (${fmtDate(header.notificationDate)} ${fmtTime(header.notificationTime)})`} />
          <InfoRow label="Scheduled Start" value={`${fmtDate(header.scheduledStart)} ${fmtTime(header.scheduledStartTime)}`} />
          <InfoRow label="Scheduled Finish" value={`${fmtDate(header.scheduledFinish)} ${fmtTime(header.scheduledFinishTime)}`} />
          <InfoRow label="Actual Start" value={`${fmtDate(header.actualStart)} ${fmtTime(header.actualStartTime)}`} />
          <InfoRow label="Actual Finish" value={`${fmtDate(header.actualFinish)} ${fmtTime(header.actualFinishTime)}`} />

          <Divider sx={{ my: 2 }} />

          <SectionTitle icon={<FactoryIcon sx={{ color: "#2563eb", fontSize: 20 }} />} title="ข้อมูลศูนย์ซ่อม" />
          <InfoRow label="Work Center" value={header.workCenter} />
          <InfoRow label="Ticket No." value={header.ticketNumber || "-"} />
          <InfoRow label="Location Code" value={header.locationCode || "-"} />
        </Box>
      </Paper>

      {/* ═══════ OPERATIONS ═══════ */}
      {operations.length > 0 && (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <Box sx={{ p: 2.5 }}>
            <SectionTitle icon={<AssignmentIcon sx={{ color: "#2563eb", fontSize: 20 }} />} title={`ขั้นตอนการทำงาน (${operations.length})`} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {operations.map((op, idx) => {
                const st = statusColor(op.actStartTime, op.actFinishTime);
                return (
                  <Box
                    key={op.worK_ORDER_OPERATION_ID || idx}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#fafbfc",
                      transition: "0.15s",
                      "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={op.opAc}
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: "#e0e7ff", color: "#3730a3", fontSize: "0.75rem", minWidth: 50 }}
                        />
                        <Typography variant="body2" fontWeight={700} color="#0f172a">
                          {op.operationShortText}
                        </Typography>
                      </Box>
                      <Chip
                        label={st.label}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: st.bg, color: st.text, fontSize: "0.7rem" }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", pl: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        👷 {op.workerName || "-"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        🕐 {fmtDate(op.actStartDate)} {fmtTime(op.actStartTime)} → {fmtTime(op.actFinishTime) || "..."}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ⏱ {op.actualWork ?? "0"} {op.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        🏭 {op.worK_CNTR || "-"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>
      )}

      {/* ═══════ COMPONENT DAMAGES ═══════ */}
      {componentDamages.length > 0 && (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0", p: 2.5 }}>
          <SectionTitle icon={<AssignmentIcon sx={{ color: "#ef4444", fontSize: 20 }} />} title={`ความเสียหาย (${componentDamages.length})`} />
          {componentDamages.map((dmg: any, i: number) => (
            <Box key={i} sx={{ p: 1.5, borderRadius: 2, border: "1px solid #fecaca", bgcolor: "#fef2f2", mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>{JSON.stringify(dmg)}</Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
