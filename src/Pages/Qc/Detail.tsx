import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    IconButton,
    Divider,
    Tooltip,
    Button,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { SlaTimer } from "../../Utility/SlaTimer";

// ... (existing imports and types managed by partial match if needed, but here replacing full file content logic for imports is safer if I replace the top block)
// wait, I should do targeted replace.


// ====== types ======
export type WorkOrderRow = {
    orderid: string;
    ordeR_TYPE?: string;
    shorT_TEXT?: string;
    equipment?: string;

    weB_STATUS?: number | string;
    userstatus?: string;
    slA_FLAG?: number;

    plant?: string;
    mN_WK_CTR?: string | null;

    current_operation?: string;
    station?: string;

    slA_FINISH_DATE?: string | null;
    slA_FINISH_TIME?: string | null;
    slA_START_DATE?: string | null;
    slA_START_TIME?: string | null;

    productioN_START_DATE?: string | null;
    productioN_START_TIME?: string | null;

    slaFinishDate?: any;
    slaFinishTime?: any;
    slaStartDate?: any;
    slaStartTime?: any;

    actuaL_START_DATE?: string | null;
    actuaL_START_TIME?: string | null;
    actuaL_FINISH_DATE?: string | null;
    actuaL_FINISH_TIME?: string | null;

    acT_START_DATE?: string | null;
    acT_START_TIME?: string | null;
    acT_END_DATE?: string | null;
    acT_END_TIME?: string | null;

    worK_ACTUAL?: number;
    servicE_TIME?: number;

    worK_ORDER_OPERATION_ID?: number;
    worK_ORDER_COMPONENT_ID?: number;

    froM_STATION?: string;
    tO_STATION?: string;
};

// ====== helpers ======
const formatDate = (value: any) => {
    if (!value) return "-";
    try {
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleString();
    } catch {
        return String(value);
    }
};

export const isCompleted = (r: WorkOrderRow) => r.weB_STATUS === 4 || r.weB_STATUS === "4";
export const isInProgress = (r: WorkOrderRow) => !!r.actuaL_START_DATE && !r.actuaL_FINISH_DATE;
export const isPending = (r: WorkOrderRow) => !r.actuaL_START_DATE && !r.actuaL_FINISH_DATE;

export const getStatusMeta = (r: WorkOrderRow) => {
    if (isCompleted(r)) return { label: "Completed", color: "success" as const };
    if (isInProgress(r)) return { label: "In Progress", color: "info" as const };
    if (isPending(r)) return { label: "Pending", color: "warning" as const };
    return { label: "Unknown", color: "default" as const };
};

// ====== SLA Helpers (Reused from SlaTimer logic) ======
const pad2 = (n: number) => String(n).padStart(2, "0");

function parseTimeToHms(time?: string | null): { hh: number; mm: number; ss: number } | null {
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
        const hh = Number(h), mm = Number(m), ss = Number(s);
        if ([hh, mm, ss].some(Number.isNaN)) return null;
        return { hh, mm, ss };
    }
    return null;
}

function buildTargetMs(dateStr?: string | null, timeStr?: string | null): number | null {
    if (!dateStr) return null;
    const base = new Date(dateStr);
    if (!Number.isFinite(base.getTime())) return null;
    const hms = parseTimeToHms(timeStr);
    if (!hms) return null;
    base.setHours(hms.hh, hms.mm, hms.ss, 0);
    return base.getTime();
}

const getSlaColor = (row: WorkOrderRow) => {
    const slaStartDate = row.slA_START_DATE ?? row.slaStartDate ?? row.productioN_START_DATE;
    const slaStartTime = row.slA_START_TIME ?? row.slaStartTime ?? row.productioN_START_TIME;
    const slaFinishDate = row.slA_FINISH_DATE ?? row.slaFinishDate;
    const slaFinishTime = row.slA_FINISH_TIME ?? row.slaFinishTime;

    const startMs = buildTargetMs(slaStartDate, slaStartTime);
    const finishMs = buildTargetMs(slaFinishDate, slaFinishTime);

    if (!startMs || !finishMs || !Number.isFinite(startMs) || !Number.isFinite(finishMs) || finishMs <= startMs) {
        return "grey.400";
    }

    const nowMs = Date.now();
    const remainingMs = finishMs - nowMs;
    const totalMs = finishMs - startMs;
    const isOverdue = remainingMs < 0;

    // Logic matches SlaTimer.tsx
    // <= 0% (Overdue) -> Red
    // <= 30% remaining -> Yellow
    // > 30% remaining -> Green

    if (isOverdue) return "#d32f2f"; // Red

    const rawPercent = nowMs <= startMs ? 100 : (remainingMs / totalMs) * 100;
    const percent = Math.max(0, Math.min(100, rawPercent));

    if (percent >= 31) return "#2e7d32"; // Green
    return "#f9a825"; // Yellow
};

// ====== WorkOrderTodoCard Component ======
export function WorkOrderTodoCard(props: {
    row: WorkOrderRow;
    onOpen?: (row: WorkOrderRow) => void;
    onApprove?: (row: WorkOrderRow) => void;
    onRework?: (row: WorkOrderRow) => void;
}) {
    const { row, onOpen, onApprove, onRework } = props;
    const status = getStatusMeta(row);

    const stationLabelMap: Record<string, string> = {
        "0010": "Inspector",
        "0020": "Remove Part",
        "0030": "Clean",
        "0040": "Color",
        "0050": "Fix Cooling",
        "0060": "Assembly Part",
        "0070": "Test",
        "0080": "QC",
    };

    const stationCode = row.current_operation ?? row.station ?? "-";
    const stationName = stationLabelMap[stationCode] ?? stationCode;

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                height: "100%", // ensure height for flex spacing if needed
            }}
        >
            {/* accent bar */}
            <Box
                sx={{
                    height: 4,
                    bgcolor: getSlaColor(row),
                }}
            />

            <CardContent sx={{ p: 2, flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>

                            <Chip size="small" variant="outlined" label={`Station: ${stationName}`} />
                            {!!row.equipment && <Chip size="small" variant="outlined" label={`EQ: ${row.equipment}`} />}
                        </Stack>

                        <Typography sx={{ fontWeight: 900, mt: 1, lineHeight: 1.2 }} noWrap>
                            {row.orderid}
                        </Typography>

                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }} noWrap>
                            {row.shorT_TEXT || "-"}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Open">
                            <IconButton size="small" onClick={() => onOpen?.(row)}>
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1.5}>
                    {/* SLA Timer */}
                    <Box sx={{ transform: "scale(0.85)", transformOrigin: "left center" }}>
                        <SlaTimer
                            slaStartDate={row.slA_START_DATE ?? row.slaStartDate ?? row.productioN_START_DATE}
                            slaStartTime={row.slA_START_TIME ?? row.slaStartTime ?? row.productioN_START_TIME}
                            slaFinishDate={row.slA_FINISH_DATE ?? row.slaFinishDate}
                            slaFinishTime={row.slA_FINISH_TIME ?? row.slaFinishTime}
                        />
                    </Box>

                    {/* Start / Finish */}
                    <Stack direction="row" spacing={2}>
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Start
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {formatDate(row.actuaL_START_DATE)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Finish
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {formatDate(row.actuaL_FINISH_DATE)}
                            </Typography>
                        </Box>
                    </Stack>
                    {(row.froM_STATION || row.tO_STATION) && (
                        <Stack direction="row" spacing={2}>
                            {row.froM_STATION && (
                                <Chip size="small" label={`From: ${row.froM_STATION}`} variant="outlined" color="default" sx={{ height: 20, fontSize: '0.65rem' }} />
                            )}
                            {row.tO_STATION && (
                                <Chip size="small" label={`To: ${row.tO_STATION}`} variant="outlined" color="default" sx={{ height: 20, fontSize: '0.65rem' }} />
                            )}
                        </Stack>
                    )}
                </Stack>
            </CardContent>

            {/* Actions: Approve / Not Approve */}
            {(onApprove || onRework) && stationCode === "0000" && (
                <Box sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1}>
                        {onApprove && (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                disableElevation
                                fullWidth
                                startIcon={<CheckCircleIcon />}
                                onClick={() => onApprove(row)}
                                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                            >
                                Approve
                            </Button>
                        )}
                        {onRework && (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                disableElevation
                                fullWidth
                                startIcon={<CancelIcon />}
                                onClick={() => onRework(row)}
                                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                            >
                                Not Approve
                            </Button>
                        )}
                    </Stack>
                </Box>
            )}
        </Card>
    );
}

export default WorkOrderTodoCard;
