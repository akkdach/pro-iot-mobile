import React, { useMemo, useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Button,
    Divider,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    TextField,
    Pagination,
    IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AppHearder from "../../Component/AppHeader";
import callApi from "../../Services/callApi";
import { useNavigate } from "react-router-dom";
import {
    WorkOrderRow,
    WorkOrderTodoCard,
    isCompleted,
    isInProgress,
    isPending
} from "./Detail";


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

export default function Dashboard_QC_CardTodo() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "completed" | "inProgress" | "pending">("all");
    const [stationFilter, setStationFilter] = useState<string | null>(null);
    const [rows, setRows] = useState<WorkOrderRow[]>([]);

    // extra: search + sort + paging (สำหรับ card list)
    const [q, setQ] = useState("");
    const [sortMode, setSortMode] = useState<"updated" | "sla" | "orderid">("updated");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const onLoad = async () => {
        setLoading(true);
        try {
            const res = await callApi.get("/WorkOrderList/Qc_Check");
            console.log("API Response:", res.data); // Debug: ดูโครงสร้าง response
            const data = res.data?.DataResult ?? res.data?.dataResult;
            // ป้องกัน error ถ้า data ไม่ใช่ array
            setRows(Array.isArray(data) ? data : []);
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

        const stations = ["0049", "0079", "0080"];
        const stationKpis = stations.reduce((acc, station) => {
            const stationRows = rows.filter((r) => String(r.current_operation || "").padStart(4, "0") === station);
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
            base = base.filter((r) => String(r.current_operation || "").padStart(4, "0") === stationFilter);
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
    }, [filterType, stationFilter, q, sortMode]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

    const handleStatusFilter = (type: "all" | "completed" | "inProgress" | "pending") => {
        setStationFilter(null);
        setFilterType(type);
    };

    const onRefresh = async () => {
        setLoading(true);
        try {
            const res = await callApi.get("/WorkOrderList/Qc_Check");
            console.log("Refresh API Response:", res.data); // Debug
            const data = res.data.dataResult;
            setRows(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1500, mx: "auto" }}>
            {/* Header */}
            <AppHearder title="QC Dashboard" />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, mt: 7 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                        QC Dashboard
                    </Typography>

                </Box>

                <Stack direction="row" gap={2} alignItems="center">


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
                    { station: "0049", title: "QC สี" },
                    { station: "0079", title: "QC ทดสอบ" },
                    { station: "0080", title: "QC final" },
                ].map((item, idx) => {
                    const colors = ["#e67e22", "#3498db", "#9b59b6"]; // โทนสีแต่ละการ์ด
                    const stationData =
                        kpi.stationKpis[item.station] ?? { total: 0, completed: 0, inProgress: 0, pending: 0 };

                    return (
                        <KpiCard
                            key={item.station}
                            title={item.title}
                            value={stationData.total}
                            //sub={`${stationData.completed} เสร็จ | ${stationData.inProgress} กำลังทำ | ${stationData.pending} รอ`}
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
            <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", mb: 5 }}>
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
                                    navigate(`/WorkStation/${row.orderid}/${row.worK_ORDER_OPERATION_ID}`, {
                                        state: row
                                    });
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
