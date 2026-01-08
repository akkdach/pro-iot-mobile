import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";

export type RemarkOption = { value: string; label: string };

type RemarkFieldProps = {
    open: boolean;
    onClose: () => void;

    title?: string;

    // --- Dropdown ---
    dropdownLabel?: string;           // เช่น "Category"
    dropdownOptions: RemarkOption[];  // รายการ dropdown
    dropdownValue?: string;           // controlled
    dropdownDefaultValue?: string;    // uncontrolled
    onDropdownChange?: (val: string) => void;
    dropdownDisabled?: boolean;

    disabled?: boolean;

    // save ส่งค่า dropdown กลับไป
    onSave: (dropdown: string) => void | Promise<void>;

    headerSlot?: React.ReactNode; // เช่น Chip ORDERID
};

export const RemarkField: React.FC<RemarkFieldProps> = ({
    open,
    onClose,
    title = "Remark",

    dropdownLabel = "Type",
    dropdownOptions,
    dropdownValue,
    dropdownDefaultValue = "",
    onDropdownChange,
    dropdownDisabled,

    disabled,

    onSave,
    headerSlot,
}) => {
    const isControlledDropdown = dropdownValue !== undefined;

    const [innerDropdown, setInnerDropdown] = useState(dropdownDefaultValue);
    const [saving, setSaving] = useState(false);

    const ddValue = isControlledDropdown ? dropdownValue! : innerDropdown;

    useEffect(() => {
        if (!open) return;

        // sync ค่าเริ่มต้นเมื่อเปิด modal (เฉพาะ uncontrolled)
        if (!isControlledDropdown) setInnerDropdown(dropdownDefaultValue ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, dropdownDefaultValue]);

    const setDropdown = (next: string) => {
        if (!isControlledDropdown) setInnerDropdown(next);
        onDropdownChange?.(next);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(ddValue);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    // ถ้า default เป็น "" และไม่ได้ส่ง dropdownValue แบบ controlled => อนุญาตให้เลือก "-"
    const dropdownEmptyAllowed = dropdownDefaultValue === "" && dropdownValue === undefined;
    const isDropdownMissing = !ddValue;

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
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
                    <FormControl fullWidth size="small">
                        <InputLabel>{dropdownLabel}</InputLabel>
                        <Select
                            label={dropdownLabel}
                            value={ddValue}
                            onChange={(e) => setDropdown(String(e.target.value))}
                            disabled={dropdownDisabled || disabled || saving}
                        >
                            {dropdownEmptyAllowed && <MenuItem value="">-</MenuItem>}

                            {dropdownOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>

                        {isDropdownMissing && (
                            <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.75 }}>
                                กรุณาเลือก {dropdownLabel}
                            </Typography>
                        )}
                    </FormControl>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                        <Button onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={disabled || saving || isDropdownMissing}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ display: "none" }} />
        </Dialog>
    );
};
