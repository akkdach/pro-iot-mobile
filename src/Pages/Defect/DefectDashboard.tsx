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
import SmsFailedIcon from '@mui/icons-material/SmsFailed';
// import AssignmentIcon from "@mui/icons-material/Assignment";
import AppHearder from "../../Component/AppHeader";
import callApi from "../../Services/callApi";
import { useNavigate } from "react-router-dom";
import {
    WorkOrderRow,
    WorkOrderTodoCard,
    isCompleted,
    isInProgress,
    isPending
} from "../Qc/Detail";

export default function DefectDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    // const [filterType, setFilterType] = useState<"all" | "completed" | "inProgress" | "pending">("all");
    // const [stationFilter, setStationFilter] = useState<string | null>(null);
    const [rows, setRows] = useState<WorkOrderRow[]>([]);

    // extra: search + sort + paging (สำหรับ card list)
    const [q, setQ] = useState("");
    const [sortMode, setSortMode] = useState<"updated" | "sla" | "orderid">("updated");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const onLoad = async () => {
        setLoading(true);
        try {
            const res = await callApi.get("/WorkOrderList/Defect");
            // console.log("API Response:", res.data); // Debug: ดูโครงสร้าง response
            const data = res.data?.DataResult ?? res.data?.dataResult;
            // ป้องกัน error ถ้า data ไม่ใช่ array
            console.log("Data:", data);
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

    const filteredRows = useMemo(() => {
        // 1. Filter where station (current_operation) is "0000"
        let base = rows.filter((r) => String(r.current_operation || "").padStart(4, "0") === "0000");

        // 2. Search filter
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

        // 3. Sort
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
    }, [rows, q, sortMode]);

    // reset page เมื่อ filter เปลี่ยน
    useEffect(() => {
        setPage(1);
    }, [q, sortMode, rows]); // Added rows dependency to reset if data reloads, though strictly simpler is just q/sort

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

    const onRefresh = async () => {
        // Reuse onLoad
        onLoad();
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1500, mx: "auto" }}>
            {/* Header */}
            <AppHearder title="Defect Dashboard" />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, mt: 7 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                        Defect Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
                        ทั้งหมด: <b>{filteredRows.length}</b> รายการ (Station 0000)
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

            {/* Summary Card */}
            <Box sx={{ mb: 4 }}>
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        maxWidth: 350,
                        transition: "transform 0.2s",
                        "&:hover": { transform: "translateY(-4px)" }
                    }}
                >
                    <Box sx={{ height: 4, bgcolor: "#d32f2f" }} />
                    <CardContent sx={{ p: 2.2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                    Defect Order Total
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, color: "#d32f2f" }}>
                                    {filteredRows.length}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 3,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "rgba(211, 47, 47, 0.08)",
                                    color: "#d32f2f",
                                }}
                            >
                                <SmsFailedIcon sx={{ fontSize: 32 }} />
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            {/* Card Todo List */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", mb: 5 }}>
                <CardContent sx={{ p: 2.2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 1 }} gap={1.5}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Defect Orders
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
                                    console.log("open orderId:", row.orderid);
                                    console.log("open operationId:", row.worK_ORDER_OPERATION_ID);
                                    // Navigate to same path as QC for now, or maybe Defect has its own detail?
                                    // User didn't specify, but usually it works similarly.
                                    navigate(`/DetailEachOrder/${row.orderid}/${row.worK_ORDER_OPERATION_ID}`, {
                                        state: row
                                    });
                                }}
                                onApprove={async (row) => {
                                    try {
                                        await callApi.post(`/WorkOrderList/approve/${row.orderid}`);
                                        onLoad();
                                    } catch (error) {
                                        console.error("Approve error:", error);
                                    }
                                }}
                                onRework={async (row) => {
                                    try {
                                        await callApi.post(`/WorkOrderList/notApprove/${row.orderid}`);
                                        onLoad();
                                    } catch (error) {
                                        console.error("Rework error:", error);
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    {/* empty state */}
                    {!loading && filteredRows.length === 0 && (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                            <Typography sx={{ fontWeight: 800 }}>ไม่พบรายการ</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                                ลองเปลี่ยนคำค้นหา หรือยังไม่มีงานเข้ามาที่ Station 0000
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
