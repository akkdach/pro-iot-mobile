import React, { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Stack, Chip, IconButton, Button, Divider } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

// ====== types ======
export type WorkOrderRow = {
    orderid: string;
    ordeR_TYPE?: string;
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

// ====== helpers ======
const formatDate = (value: any) => {
    if (!value) return "-";
    // รองรับทั้ง ISO string / Date / หรือ string อื่นๆ
    try {
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleString(); // ปรับ format ตามใจ
    } catch {
        return String(value);
    }
};

function KpiCard(props: {
    title: string;
    value: string | number;
    sub?: string;
    icon?: React.ReactNode;
    accent?: string;
}) {
    const { title, value, sub, icon, accent = "#1976d2" } = props;
    return (
        <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
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

// ====== คุณมี SlaTimer อยู่แล้ว ใช้ของเดิมได้เลย ======
// import SlaTimer from "...";
const SlaTimer = (props: any) => {
    // placeholder: เอาออกแล้วใช้ของจริง
    return (
        <Chip
            size="small"
            label={`SLA`}
            variant="outlined"
        />
    );
};

export default function DashboardMonitoring() {
    const [loading, setLoading] = useState(false);

    // ✅ ตรงนี้แทนด้วย data จาก API จริง
    const [rows, setRows] = useState<WorkOrderRow[]>([
        {
            orderid: "WO-0001",
            ordeR_TYPE: "PM01",
            equipment: "ZC15",
            shorT_TEXT: "Replace bearing",
            weB_STATUS: "IN_PROGRESS",
            actuaL_START_DATE: "2026-01-14T01:00:00.000Z",
            actuaL_FINISH_DATE: null,
            slA_START_DATE: "2026-01-14",
            slA_START_TIME: "080000",
            slA_FINISH_DATE: "2026-01-14",
            slA_FINISH_TIME: "160000",
        },
        {
            orderid: "WO-0002",
            ordeR_TYPE: "PM01",
            equipment: "ZR10",
            shorT_TEXT: "Refurbish motor",
            weB_STATUS: "COMPLETED",
            actuaL_START_DATE: "2026-01-13T01:00:00.000Z",
            actuaL_FINISH_DATE: "2026-01-13T06:00:00.000Z",
            slA_START_DATE: "2026-01-13",
            slA_START_TIME: "080000",
            slA_FINISH_DATE: "2026-01-13",
            slA_FINISH_TIME: "160000",
        },
    ]);

    // ====== columns (ใช้ของคุณ 그대로) ======
    const columns = useMemo<MRT_ColumnDef<WorkOrderRow>[]>(
        () => [
            {
                header: "SLA Timer",
                accessorKey: "slaFinishDate",
                enableSorting: false,
                enableColumnFilter: false,
                size: 160,
                Cell: ({ row }) => (
                    <SlaTimer
                        slaFinishDate={row.original.slA_FINISH_DATE ?? row.original.slaFinishDate}
                        slaFinishTime={row.original.slA_FINISH_TIME ?? row.original.slaFinishTime}
                        slaStartDate={String(row.original.slA_START_DATE)}
                        slaStartTime={String(row.original.slA_START_TIME)}
                    />
                ),
            },
            { accessorKey: "orderid", header: "Work Order", size: 140 },
            { accessorKey: "ordeR_TYPE", header: "Order Type", size: 110 },
            { accessorKey: "equipment", header: "Equipment", size: 110 },
            {
                accessorKey: "actuaL_START_DATE",
                header: "Start Date",
                size: 160,
                Cell: ({ cell }) => formatDate(cell.getValue<string>()),
            },
            {
                accessorKey: "actuaL_FINISH_DATE",
                header: "Finish Date",
                size: 160,
                Cell: ({ cell }) => formatDate(cell.getValue<string>()),
            },
            { accessorKey: "shorT_TEXT", header: "Description", size: 260 },
        ],
        []
    );

    // ====== KPI สำหรับ cards ด้านบน ======
    const kpi = useMemo(() => {
        const total = rows.length;

        // ใช้ finish date เป็นหลัก (ชัวร์สุด)
        const completed = rows.filter((r) => !!r.actuaL_FINISH_DATE).length;

        // started = มี start แล้ว แต่ยังไม่ finish
        const inProgress = rows.filter((r) => !!r.actuaL_START_DATE && !r.actuaL_FINISH_DATE).length;

        // pending = ยังไม่ start
        const pending = rows.filter((r) => !r.actuaL_START_DATE && !r.actuaL_FINISH_DATE).length;

        return { total, completed, inProgress, pending };
    }, [rows]);

    const onRefresh = async () => {
        setLoading(true);
        try {
            // TODO: เรียก API จริง
            // const res = await callApi.get("/WorkOrderList/....");
            // setRows(res.data.DataResult ?? res.data ?? []);
            await new Promise((r) => setTimeout(r, 600));
            setRows((prev) => [...prev]);
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
                        Work Order Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Cards ด้านบน + ตาราง Work Order (Material React Table)
                    </Typography>
                </Box>

                <Stack direction="row" gap={1} alignItems="center">
                    <IconButton onClick={onRefresh} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                    <Button variant="contained" onClick={onRefresh} disabled={loading} sx={{ borderRadius: 2 }}>
                        Refresh
                    </Button>
                </Stack>
            </Stack>

            {/* Top Cards */}
            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
                    mb: 2,
                }}
            >
                <KpiCard title="Total" value={kpi.total} sub="ทั้งหมด" icon={<AssignmentIcon />} accent="#1976d2" />
                <KpiCard title="In Progress" value={kpi.inProgress} sub="เริ่มแล้ว ยังไม่จบ" icon={<PlayCircleIcon />} accent="#3498db" />
                <KpiCard title="Completed" value={kpi.completed} sub="จบงานแล้ว" icon={<CheckCircleIcon />} accent="#2ecc71" />
                <KpiCard title="Pending" value={kpi.pending} sub="ยังไม่เริ่ม" icon={<HourglassTopIcon />} accent="#f1c40f" />
            </Box>

            {/* Bottom Table */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 2.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Work Orders
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                SLA Timer + รายละเอียดตาม columns ที่คุณให้มา
                            </Typography>
                        </Box>
                        <Chip size="small" label={`${rows.length} rows`} variant="outlined" />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <MaterialReactTable
                        columns={columns}
                        data={rows}
                        state={{ isLoading: loading }}
                        enableGlobalFilter
                        enableColumnFilters
                        enableSorting
                        enablePagination
                        initialState={{
                            density: "compact",
                            pagination: { pageIndex: 0, pageSize: 10 },
                        }}
                        muiTablePaperProps={{
                            elevation: 0,
                            sx: {
                                borderRadius: 2,
                                border: "1px solid rgba(0,0,0,0.08)",
                                overflow: "hidden",
                            },
                        }}
                        muiTableHeadCellProps={{
                            sx: { fontWeight: 800, bgcolor: "rgba(0,0,0,0.03)" },
                        }}
                        muiTableBodyRowProps={{
                            sx: { "&:hover": { bgcolor: "rgba(25,118,210,0.05)" } },
                        }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
}
