import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";

type RemarkFieldProps = {
    open: boolean;
    onClose: () => void;

    title?: string;
    label?: string;

    value?: string;            // controlled
    defaultValue?: string;     // uncontrolled
    maxLength?: number;
    minRows?: number;
    placeholder?: string;
    disabled?: boolean;
    errorText?: string;

    onChange?: (val: string) => void;
    onSave: (val: string) => void | Promise<void>;

    headerSlot?: React.ReactNode; // เช่น ORDERID chip
};

export const RemarkField: React.FC<RemarkFieldProps> = ({
    open,
    onClose,
    title = "Remark",
    label = "Remark",
    value,
    defaultValue = "",
    maxLength = 300,
    minRows = 4,
    placeholder = "พิมพ์หมายเหตุ...",
    disabled,
    errorText,
    onChange,
    onSave,
    headerSlot,
}) => {
    const isControlled = value !== undefined;

    const [inner, setInner] = useState(defaultValue);
    const [saving, setSaving] = useState(false);

    const text = isControlled ? value! : inner;

    useEffect(() => {
        // เปิด modal แล้ว sync ค่าเริ่มต้น
        if (!open) return;
        if (!isControlled) setInner(defaultValue ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, defaultValue]);

    const countText = useMemo(() => `${text.length}/${maxLength}`, [text.length, maxLength]);

    const setText = (next: string) => {
        const clipped = next.length > maxLength ? next.slice(0, maxLength) : next;
        if (!isControlled) setInner(clipped);
        onChange?.(clipped);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(text);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        setText("");
    };

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 900 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <span>{title}</span>
                    {headerSlot}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Box
                    sx={{
                        width: "100%",
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.12)",
                        bgcolor: "rgba(0,0,0,0.02)",
                        p: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                            {countText}
                        </Typography>
                    </Box>

                    <TextField
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled || saving}
                        multiline
                        minRows={minRows}
                        fullWidth
                        error={Boolean(errorText)}
                        helperText={errorText ?? " "}
                        inputProps={{ maxLength }}
                        sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "white" },
                        }}
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                        <Button variant="outlined" onClick={handleClear} disabled={disabled || saving || text.length === 0}>
                            Clear
                        </Button>
                        <Button variant="contained" onClick={handleSave} disabled={disabled || saving}>
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};
