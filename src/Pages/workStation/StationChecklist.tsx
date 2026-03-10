import React, { useMemo, useState } from "react";
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    TextField,
    Button,
    Paper,
    Divider,
    Stack,
    InputAdornment,
    Chip,
    Radio,
    RadioGroup,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import stationChecklistConfig, {
    ChecklistItem,
} from "./stationChecklistConfig";

interface StationChecklistProps {
    stationCode: string;
    orderId?: string;
    onSave?: (payload: Record<string, string | boolean>) => void;
}

export default function StationChecklist({
    stationCode,
    orderId,
    onSave,
}: StationChecklistProps) {
    // normalize station code → 4 digits
    const normalized = stationCode?.toString().padStart(4, "0") ?? "";

    // find config for this station
    const config = useMemo(
        () => stationChecklistConfig.find((c) => c.station === normalized),
        [normalized]
    );

    // local state: { "INS-01": true, "FIX-02": "150", ... }
    const [values, setValues] = useState<Record<string, string | boolean>>({});

    if (!config) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                    ไม่พบ Checklist สำหรับ Station {normalized}
                </Typography>
            </Box>
        );
    }

    const handleCheckChange = (id: string, checked: boolean) => {
        setValues((prev) => ({ ...prev, [id]: checked }));
    };

    const handleTextChange = (id: string, value: string) => {
        setValues((prev) => ({ ...prev, [id]: value }));
    };

    const totalItems = config.categories.reduce(
        (sum, cat) => sum + cat.items.length,
        0
    );
    const checkedCount = config.categories.reduce((sum, cat) => {
        return (
            sum +
            cat.items.filter((item) => {
                const v = values[item.id];
                if (item.type === "check") return v === true;
                if (item.type === "option")
                    return v !== undefined && v !== "";
                if (item.type === "number" || item.type === "text")
                    return v !== undefined && v !== "";
                return false;
            }).length
        );
    }, 0);

    const handleSave = () => {
        const payload = {
            station: normalized,
            orderId: orderId ?? "",
            items: values,
            timestamp: new Date().toISOString(),
        };
        console.log("📋 Checklist Payload:", payload);

        if (onSave) {
            onSave(values);
        }
    };

    const renderItem = (item: ChecklistItem) => {
        // ── Radio-button option (เช่น ติ๊ก / เปลี่ยน / ล้าง) ──
        if (item.type === "option" && item.options) {
            const selected = typeof values[item.id] === "string" ? (values[item.id] as string) : "";
            return (
                <Box
                    key={item.id}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        transition: "0.15s",
                        "&:hover": { backgroundColor: "#F0F7FF" },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "0.95rem",
                            fontWeight: selected ? 600 : 400,
                            color: selected ? "#1E293B" : "inherit",
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        {item.label}
                    </Typography>
                    <RadioGroup
                        row
                        value={selected}
                        onChange={(e) => handleTextChange(item.id, e.target.value)}
                        sx={{ flexShrink: 0, gap: 0.5 }}
                    >
                        {item.options.map((opt) => {
                            const isSelected = selected === opt;
                            const colorMap: Record<string, string> = {
                                "ติ๊ก": "#4CAF50",
                                "เปลี่ยน": "#FF9800",
                                "ล้าง": "#2196F3",
                            };
                            const bgMap: Record<string, string> = {
                                "ติ๊ก": "#E8F5E9",
                                "เปลี่ยน": "#FFF3E0",
                                "ล้าง": "#E3F2FD",
                            };
                            return (
                                <FormControlLabel
                                    key={opt}
                                    value={opt}
                                    control={
                                        <Radio size="small"
                                            sx={{
                                                color: colorMap[opt] ?? "#9e9e9e",
                                                "&.Mui-checked": { color: colorMap[opt] ?? "#1976d2" },
                                                p: 0.5,
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: "0.82rem", fontWeight: isSelected ? 700 : 400 }}>
                                            {opt}
                                        </Typography>
                                    }
                                    sx={{
                                        m: 0,
                                        px: 1,
                                        py: 0.3,
                                        borderRadius: "12px",
                                        border: "1px solid",
                                        borderColor: isSelected ? (colorMap[opt] ?? "#1976d2") : "#E0E0E0",
                                        backgroundColor: isSelected ? (bgMap[opt] ?? "#F5F5F5") : "transparent",
                                        transition: "0.2s",
                                    }}
                                />
                            );
                        })}
                    </RadioGroup>
                </Box>
            );
        }

        // ── Simple checkbox ──
        if (item.type === "check") {
            return (
                <FormControlLabel
                    key={item.id}
                    control={
                        <Checkbox
                            checked={!!values[item.id]}
                            onChange={(e) => handleCheckChange(item.id, e.target.checked)}
                            sx={{
                                color: "#90CAF9",
                                "&.Mui-checked": { color: "#1976d2" },
                            }}
                        />
                    }
                    label={
                        <Typography
                            sx={{
                                fontSize: "0.95rem",
                                textDecoration: values[item.id] ? "line-through" : "none",
                                color: values[item.id] ? "#9e9e9e" : "inherit",
                                transition: "0.2s",
                            }}
                        >
                            {item.label}
                        </Typography>
                    }
                    sx={{
                        width: "100%",
                        m: 0,
                        py: 0.8,
                        px: 1.5,
                        borderRadius: 2,
                        transition: "0.15s",
                        "&:hover": {
                            backgroundColor: "#F0F7FF",
                        },
                    }}
                />
            );
        }

        // number or text
        return (
            <Box
                key={item.id}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 0.8,
                    px: 1.5,
                }}
            >
                <Checkbox
                    checked={
                        values[item.id] !== undefined &&
                        values[item.id] !== "" &&
                        values[item.id] !== false
                    }
                    disabled
                    size="small"
                    sx={{ color: "#90CAF9", "&.Mui-checked": { color: "#4CAF50" } }}
                />
                <Typography sx={{ flex: 1, fontSize: "0.95rem" }}>
                    {item.label}
                </Typography>
                <TextField
                    size="small"
                    type={item.type === "number" ? "number" : "text"}
                    value={
                        typeof values[item.id] === "string" ? values[item.id] : ""
                    }
                    onChange={(e) => handleTextChange(item.id, e.target.value)}
                    placeholder="—"
                    InputProps={
                        item.unit
                            ? {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {item.unit}
                                    </InputAdornment>
                                ),
                            }
                            : undefined
                    }
                    sx={{
                        width: 140,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#FAFAFA",
                        },
                    }}
                />
            </Box>
        );
    };

    return (
        <Box sx={{ maxWidth: 700, mx: "auto" }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, color: "#1E293B" }}
                    >
                        📋 {config.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Station {config.station}
                        {orderId && ` • Work Order: ${orderId}`}
                    </Typography>
                </Box>
                <Chip
                    icon={<CheckCircleOutlineIcon />}
                    label={`${checkedCount} / ${totalItems}`}
                    color={checkedCount === totalItems ? "success" : "default"}
                    variant={checkedCount === totalItems ? "filled" : "outlined"}
                    sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                />
            </Box>

            {/* Categories */}
            {config.categories.map((cat, catIdx) => (
                <Paper
                    key={catIdx}
                    elevation={1}
                    sx={{
                        mb: 2,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid #E2E8F0",
                    }}
                >
                    {/* Category Header */}
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            backgroundColor: "#F1F5F9",
                            borderBottom: "1px solid #E2E8F0",
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, color: "#334155" }}>
                            {cat.name}
                        </Typography>
                    </Box>

                    {/* Items */}
                    <Box sx={{ p: 1 }}>
                        {cat.items.map((item, idx) => (
                            <React.Fragment key={item.id}>
                                {renderItem(item)}
                                {idx < cat.items.length - 1 && (
                                    <Divider sx={{ mx: 1.5 }} />
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                </Paper>
            ))}

            {/* Save Button */}
            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    pt: 2,
                    pb: 2,
                    backgroundColor: "white",
                    borderTop: "2px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        bgcolor: "#2563EB",
                        boxShadow: "0 4px 12px -2px rgba(37, 99, 235, 0.3)",
                        "&:hover": {
                            bgcolor: "#1D4ED8",
                            boxShadow: "0 6px 16px -2px rgba(37, 99, 235, 0.4)",
                        },
                    }}
                >
                    บันทึก Checklist
                </Button>
            </Box>
        </Box>
    );
}
