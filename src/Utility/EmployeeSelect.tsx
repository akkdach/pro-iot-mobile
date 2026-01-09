// EmployeeMultiSelectModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    InputAdornment,
    Box,
    Typography,
    Card,
    CardActionArea,
    CardContent,
    Avatar,
    CircularProgress,
    Alert,
    Chip,
    Button,
    Stack,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import callApi from "../Services/callApi"


export type Employee = {
    personnelName: string;
    personnelNumber: string;
};

type Props = {
    open: boolean;
    onClose: () => void;

    // ✅ กดยืนยันแล้วค่อยส่งกลับ
    onConfirm: (selected: Employee[]) => void;

    title?: string;

    // ✅ ค่าเริ่มต้นที่ถูกเลือก (optional)
    initialSelected?: Employee[];
};

export default function EmployeeMultiSelectModal({
    open,
    onClose,
    onConfirm,
    title = "เลือกช่าง",
    initialSelected = [],
}: Props) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const [q, setQ] = useState("");

    // สถานะที่เลือกภายใน modal
    const [selectedMap, setSelectedMap] = useState<Record<string, Employee>>({});

    // เมื่อเปิด modal: set ค่า selected เริ่มต้น
    useEffect(() => {
        if (!open) return;

        const map: Record<string, Employee> = {};
        for (const e of initialSelected) {
            if (!e?.personnelNumber) continue;
            map[String(e.personnelNumber)] = {
                personnelName: String(e.personnelName ?? ""),
                personnelNumber: String(e.personnelNumber ?? ""),
            };
        }
        setSelectedMap(map);
        setQ("");
    }, [open, initialSelected]);

    // โหลดรายชื่อพนักงาน
    useEffect(() => {
        let alive = true;

        const load = async () => {
            try {
                setError("");
                setLoading(true);

                const res = await callApi.get("/Refurbish/employees");
                const data = Array.isArray(res.data) ? res.data : res.data?.dataResult ?? [];

                const normalized: Employee[] = (Array.isArray(data) ? data : [])
                    .filter(Boolean)
                    .map((x: any) => ({
                        personnelName: String(x.personnelName ?? ""),
                        personnelNumber: String(x.personnelNumber ?? ""),
                    }))
                    .filter((x) => x.personnelName || x.personnelNumber);

                if (!alive) return;
                setEmployees(normalized);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "โหลดรายชื่อพนักงานไม่สำเร็จ");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        if (open && employees.length === 0 && !loading) load();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const selectedList = useMemo(
        () => Object.values(selectedMap),
        [selectedMap]
    );

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return employees;

        return employees.filter((emp) => {
            const name = emp.personnelName.toLowerCase();
            const num = emp.personnelNumber.toLowerCase();
            return name.includes(s) || num.includes(s);
        });
    }, [employees, q]);

    const toggleSelect = (emp: Employee) => {
        const key = String(emp.personnelNumber ?? "");
        if (!key) return;

        setSelectedMap((prev) => {
            const next = { ...prev };
            if (next[key]) delete next[key];
            else next[key] = emp;
            return next;
        });
    };

    const removeSelected = (personnelNumber: string) => {
        setSelectedMap((prev) => {
            const next = { ...prev };
            delete next[String(personnelNumber)];
            return next;
        });
    };

    const clearAll = () => setSelectedMap({});

    const handleConfirm = () => {
        onConfirm(selectedList);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pr: 1,
                    gap: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
                <IconButton onClick={onClose} size="small" aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1.5 }}>
                {/* Search */}
                <TextField
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="ค้นหาด้วยชื่อ หรือรหัสพนักงาน..."
                    fullWidth
                    autoFocus
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Selected chips */}
                <Box sx={{ mt: 2 }}>
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="center"
                    >
                        <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>
                            Selected ({selectedList.length})
                        </Typography>

                        {selectedList.length === 0 ? (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                ยังไม่ได้เลือก
                            </Typography>
                        ) : (
                            selectedList.map((e) => (
                                <Chip
                                    key={e.personnelNumber}
                                    label={`${e.personnelName} (${e.personnelNumber})`}
                                    onDelete={() => removeSelected(e.personnelNumber)}
                                    size="small"
                                />
                            ))
                        )}

                        {selectedList.length > 0 && (
                            <Button size="small" onClick={clearAll}>
                                ล้างทั้งหมด
                            </Button>
                        )}
                    </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* List */}
                {loading && (
                    <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography sx={{ color: "text.secondary" }}>
                            ไม่พบพนักงานที่ตรงกับคำค้นหา
                        </Typography>
                    </Box>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <Box
                        sx={{
                            display: "grid",
                            gap: 1.5,
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                            },
                        }}
                    >
                        {filtered.map((emp) => {
                            const key = String(emp.personnelNumber ?? "");
                            const isSelected = Boolean(selectedMap[key]);

                            return (
                                <Card
                                    key={key}
                                    variant="outlined"
                                    sx={{
                                        borderColor: isSelected ? "primary.main" : "divider",
                                        boxShadow: isSelected ? 2 : 0,
                                    }}
                                >
                                    <CardActionArea onClick={() => toggleSelect(emp)}>
                                        <CardContent sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                            <Avatar>
                                                {emp.personnelName?.trim()?.[0] ?? "?"}
                                            </Avatar>

                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ fontWeight: 700 }}
                                                    noWrap
                                                >
                                                    {emp.personnelName || "-"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                                                    {emp.personnelNumber || "-"}
                                                </Typography>
                                            </Box>

                                            {isSelected ? (
                                                <CheckCircleIcon />
                                            ) : (
                                                <AddCircleOutlineIcon />
                                            )}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </Box>
                )}

                <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 2, color: "text.secondary" }}
                >
                    ทั้งหมด {employees.length} คน • แสดง {filtered.length} คน
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>ยกเลิก</Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={selectedList.length === 0}
                >
                    ยืนยันเลือก ({selectedList.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
}
