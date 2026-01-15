import React, { useMemo, useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    IconButton,
    Button,
    Divider,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    TextField,
    Pagination,
    Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DoneIcon from "@mui/icons-material/Done";
import ReplayIcon from "@mui/icons-material/Replay";

import callApi from "../../Services/callApi";


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

const isCompleted = (r: WorkOrderRow) => r.weB_STATUS === 4 || r.weB_STATUS === "4";
const isInProgress = (r: WorkOrderRow) => !!r.actuaL_START_DATE && !r.actuaL_FINISH_DATE;
const isPending = (r: WorkOrderRow) => !r.actuaL_START_DATE && !r.actuaL_FINISH_DATE;

const getStatusMeta = (r: WorkOrderRow) => {
    if (isCompleted(r)) return { label: "Completed", color: "success" as const };
    if (isInProgress(r)) return { label: "In Progress", color: "info" as const };
    if (isPending(r)) return { label: "Pending", color: "warning" as const };
    return { label: "Unknown", color: "default" as const };
};

function KpiCard(props: {
    title: string;
    value: string | number;
    sub?: string;
    icon?: React.ReactNode;
    accent?: string;
    onClick?: () => void;
    isActive?: boolean;
}) {
    const { title, value, sub, icon, accent = "#1976d2", onClick, isActive } = props;
    return (
        <Card
            onClick={onClick}
            sx={{
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                cursor: onClick ? "pointer" : "default",
                transform: isActive ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s ease",
                border: isActive ? `2px solid ${accent}` : "none",
                "&:hover": onClick
                    ? { transform: "scale(1.02)", boxShadow: "0 12px 35px rgba(0,0,0,0.12)" }
                    : {},
            }}
        >
            <Box sx={{ height: 4, bgcolor: accent }} />
            <CardContent sx={{ p: 2.2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.2 }}>
                            {value}
                        </Typography>
                        {sub ? (
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {sub}
                            </Typography>
                        ) : null}
                    </Box>

                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "rgba(25,118,210,0.08)",
                            color: accent,
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function WorkOrderTodoCard(props: {
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
            }}
        >
            {/* accent bar */}
            <Box
                sx={{
                    height: 4,
                    bgcolor:
                        status.color === "success"
                            ? "success.main"
                            : status.color === "info"
                                ? "info.main"
                                : status.color === "warning"
                                    ? "warning.main"
                                    : "grey.400",
                }}
            />

            <CardContent sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={status.label} color={status.color} />
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

                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            SLA Timer
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Start / Finish
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatDate(row.actuaL_START_DATE)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatDate(row.actuaL_FINISH_DATE)}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function Dashboard_QC_CardTodo() {
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "completed" | "inProgress" | "pending">("all");
    const [stationFilter, setStationFilter] = useState<string | null>(null);

    // Date filter state
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [startMonth, setStartMonth] = useState<string>(`${currentYear}-01`);
    const [endMonth, setEndMonth] = useState<string>(`${currentYear}-${String(currentMonth).padStart(2, "0")}`);

    const [rows, setRows] = useState<WorkOrderRow[]>([]);

    // extra: search + sort + paging (สำหรับ card list)
    const [q, setQ] = useState("");
    const [sortMode, setSortMode] = useState<"updated" | "sla" | "orderid">("updated");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const onLoad = async (start?: string, end?: string) => {
        setLoading(true);
        try {
            const startDate = start || startMonth;
            const endDate = end || endMonth;
            const url = `/WorkOrderList/workOrderList?startMonth=${startDate}&endMonth=${endDate}`;
            const res = await callApi.get(url);
            const data = res.data.dataResult;
            setRows(data ?? []);
        } catch (error) {
            console.error("Error loading work orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        onLoad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const kpi = useMemo(() => {
        const total = rows.length;
        const completed = rows.filter(isCompleted).length;
        const inProgress = rows.filter(isInProgress).length;
        const pending = rows.filter(isPending).length;

        const stations = ["0010", "0020", "0030", "0040", "0050", "0060", "0070", "0080"];
        const stationKpis = stations.reduce((acc, station) => {
            const stationRows = rows.filter((r) => r.current_operation === station);
            acc[station] = {
                total: stationRows.length,
                completed: stationRows.filter(isCompleted).length,
                inProgress: stationRows.filter(isInProgress).length,
                pending: stationRows.filter(isPending).length,
            };
            return acc;
        }, {} as Record<string, { total: number; completed: number; inProgress: number; pending: number }>);

        return { total, completed, inProgress, pending, stationKpis };
    }, [rows]);

    const filteredRows = useMemo(() => {
        let base = rows;

        // station filter (ถ้ามี)
        if (stationFilter) {
            base = base.filter((r) => r.current_operation === stationFilter);
        } else {
            // status filter (ถ้าไม่มี station)
            if (filterType === "completed") base = base.filter(isCompleted);
            if (filterType === "inProgress") base = base.filter(isInProgress);
            if (filterType === "pending") base = base.filter(isPending);
        }

        // search filter
        const text = q.trim().toLowerCase();
        if (text) {
            base = base.filter((r) =>
                [r.orderid, r.ordeR_TYPE, r.equipment, r.station, r.current_operation, r.shorT_TEXT]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(text)
            );
        }

        // sort
        const sorted = [...base].sort((a, b) => {
            if (sortMode === "orderid") return String(a.orderid).localeCompare(String(b.orderid));

            if (sortMode === "sla") {
                const aKey = `${a.productioN_START_DATE ?? ""} ${a.productioN_START_TIME ?? ""}`;
                const bKey = `${b.productioN_START_DATE ?? ""} ${b.productioN_START_TIME ?? ""}`;
                return aKey.localeCompare(bKey);
            }

            // updated (fallback ใช้ finish/start/date ที่มี)
            const aKey = String(a.actuaL_FINISH_DATE ?? a.actuaL_START_DATE ?? "");
            const bKey = String(b.actuaL_FINISH_DATE ?? b.actuaL_START_DATE ?? "");
            return bKey.localeCompare(aKey); // desc
        });

        return sorted;
    }, [rows, filterType, stationFilter, q, sortMode]);

    // reset page เมื่อ filter เปลี่ยน
    useEffect(() => {
        setPage(1);
    }, [filterType, stationFilter, q, sortMode, startMonth, endMonth]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

    const handleStatusFilter = (type: "all" | "completed" | "inProgress" | "pending") => {
        setStationFilter(null);
        setFilterType(type);
    };

    const onRefresh = async () => {
        setLoading(true);
        try {
            const res = await callApi.get("/WorkOrderList/WorkOrderList");
            setRows(res.data.dataResult ?? []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1500, mx: "auto" }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                        QC Dashboard
                    </Typography>

                </Box>

                <Stack direction="row" gap={2} alignItems="center">
                    {/* Date Filter */}
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>เริ่มต้น</InputLabel>
                        <Select
                            value={startMonth}
                            label="เริ่มต้น"
                            onChange={(e) => {
                                setStartMonth(e.target.value);
                                onLoad(e.target.value, endMonth);
                            }}
                        >
                            {Array.from({ length: 12 }, (_, i) => {
                                const m = String(i + 1).padStart(2, "0");
                                const key = `${currentYear}-${m}`;
                                const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                                return (
                                    <MenuItem key={key} value={key}>
                                        {thaiMonths[i]} {currentYear}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <Typography variant="body2">ถึง</Typography>

                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>สิ้นสุด</InputLabel>
                        <Select
                            value={endMonth}
                            label="สิ้นสุด"
                            onChange={(e) => {
                                setEndMonth(e.target.value);
                                onLoad(startMonth, e.target.value);
                            }}
                        >
                            {Array.from({ length: 12 }, (_, i) => {
                                const m = String(i + 1).padStart(2, "0");
                                const key = `${currentYear}-${m}`;
                                const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                                return (
                                    <MenuItem key={key} value={key}>
                                        {thaiMonths[i]} {currentYear}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <IconButton onClick={onRefresh} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                    <Button variant="contained" onClick={onRefresh} disabled={loading} sx={{ borderRadius: 2 }}>
                        Refresh
                    </Button>
                </Stack>
            </Stack>

            {/* Station Cards */}
            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    mb: 2,
                }}
            >
                {[
                    { station: "0030", title: "โป้กสี" },
                    { station: "0040", title: "ขัดสี" },
                    { station: "0050", title: "ทำสี" },
                ].map((item, idx) => {
                    const colors = ["#e67e22", "#3498db", "#9b59b6"]; // โทนสีแต่ละการ์ด
                    const stationData =
                        kpi.stationKpis[item.station] ?? { total: 0, completed: 0, inProgress: 0, pending: 0 };

                    return (
                        <KpiCard
                            key={item.station}
                            title={item.title}
                            value={stationData.total}
                            sub={`${stationData.completed} เสร็จ | ${stationData.inProgress} กำลังทำ | ${stationData.pending} รอ`}
                            icon={<AssignmentIcon />}
                            accent={colors[idx]}
                            onClick={() => {
                                setFilterType("all");
                                setStationFilter((prev) => (prev === item.station ? null : item.station));
                            }}
                            isActive={stationFilter === item.station}
                        />
                    );
                })}
            </Box>

            {/* Card Todo List */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 2.2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 1 }} gap={1.5}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                QC Todo List
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} gap={1.2} alignItems="center">
                            <TextField
                                size="small"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="ค้นหา (order / station / desc / equipment)"
                                sx={{ minWidth: { xs: "100%", sm: 320 } }}
                            />

                            <FormControl size="small" sx={{ minWidth: 160, width: { xs: "100%", sm: "auto" } }}>
                                <InputLabel>Sort</InputLabel>
                                <Select value={sortMode} label="Sort" onChange={(e) => setSortMode(e.target.value as any)}>
                                    <MenuItem value="updated">Updated (desc)</MenuItem>
                                    <MenuItem value="sla">SLA / Production</MenuItem>
                                    <MenuItem value="orderid">OrderId</MenuItem>
                                </Select>
                            </FormControl>

                            <Chip size="small" label={`${filteredRows.length} items`} variant="outlined" />
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Box
                        sx={{
                            display: "grid",
                            gap: 2,
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                            opacity: loading ? 0.6 : 1,
                            transition: "opacity 0.2s",
                        }}
                    >
                        {pagedRows.map((r) => (
                            <WorkOrderTodoCard
                                key={r.orderid}
                                row={r}
                                onOpen={(row) => {
                                    console.log("open:", row.orderid);
                                    // TODO: ไปหน้ารายละเอียด หรือเปิด dialog
                                }}
                                onApprove={(row) => {
                                    console.log("approve:", row.orderid);
                                    // TODO: call API approve QC
                                }}
                                onRework={(row) => {
                                    console.log("rework:", row.orderid);
                                    // TODO: call API set rework / remark
                                }}
                            />
                        ))}
                    </Box>

                    {/* empty state */}
                    {!loading && filteredRows.length === 0 && (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                            <Typography sx={{ fontWeight: 800 }}>ไม่พบรายการ</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                                ลองเปลี่ยน filter / คำค้นหา
                            </Typography>
                        </Box>
                    )}

                    {/* Pagination */}
                    <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            color="primary"
                            shape="rounded"
                            siblingCount={1}
                            boundaryCount={1}
                        />
                    </Stack>
                </CardContent>
            </Card>


        </Box>
    );
}
