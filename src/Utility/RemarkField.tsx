import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Fade,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";

export type RemarkOption = { value: string; label: string };

type RemarkFieldProps = {
    open: boolean;
    onClose: () => void;

    title?: string;

    // --- Dropdown ---
    dropdownLabel?: string;
    dropdownOptions: RemarkOption[];
    dropdownValue?: string;
    dropdownDefaultValue?: string;
    onDropdownChange?: (val: string) => void;
    dropdownDisabled?: boolean;

    disabled?: boolean;

    onSave: (dropdown: string) => void | Promise<void>;

    headerSlot?: React.ReactNode;
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
    const [inputMode, setInputMode] = useState<"dropdown" | "text">("dropdown");
    const [customText, setCustomText] = useState("");

    const ddValue = isControlledDropdown ? dropdownValue! : innerDropdown;

    useEffect(() => {
        if (!open) return;
        if (!isControlledDropdown) setInnerDropdown(dropdownDefaultValue ?? "");
        setInputMode("dropdown");
        setCustomText("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, dropdownDefaultValue]);

    const setDropdown = (next: string) => {
        if (!isControlledDropdown) setInnerDropdown(next);
        onDropdownChange?.(next);
    };

    // ค่าสุดท้ายที่จะส่งออกไป
    const finalValue = inputMode === "dropdown" ? ddValue : customText.trim();
    const isMissingValue = !finalValue;

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(finalValue);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const dropdownEmptyAllowed = dropdownDefaultValue === "" && dropdownValue === undefined;
    const isDropdownMissing = !ddValue;

    // สีตาม option ที่เลือก
    const optionColorMap: Record<string, { bg: string; border: string; icon: string }> = {
        delay: { bg: "#FFF8E1", border: "#FFB300", icon: "⏳" },
        waiting_part: { bg: "#E3F2FD", border: "#42A5F5", icon: "🔧" },
        rework: { bg: "#FBE9E7", border: "#EF5350", icon: "🔄" },
    };

    const selectedColor = optionColorMap[ddValue] ?? { bg: "#F5F5F5", border: "#BDBDBD", icon: "📝" };

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 20px 60px -12px rgba(0,0,0,0.25)",
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <ChatBubbleOutlineIcon sx={{ color: "rgba(255,255,255,0.9)", fontSize: 24 }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: "#fff",
                            letterSpacing: 0.5,
                        }}
                    >
                        {title}
                    </Typography>
                    {headerSlot}
                </Stack>
                <Button
                    onClick={onClose}
                    disabled={saving}
                    sx={{
                        minWidth: 36,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        color: "rgba(255,255,255,0.8)",
                        "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.15)",
                            color: "#fff",
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </Button>
            </Box>

            <DialogContent sx={{ px: 3, py: 3 }}>
                {/* Toggle: Dropdown vs Text */}
                <ToggleButtonGroup
                    value={inputMode}
                    exclusive
                    onChange={(_, val) => val && setInputMode(val)}
                    size="small"
                    fullWidth
                    sx={{
                        mb: 2.5,
                        "& .MuiToggleButton-root": {
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            textTransform: "none",
                            py: 1,
                            border: "2px solid #E0E0E0",
                            color: "#757575",
                            "&.Mui-selected": {
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff",
                                borderColor: "transparent",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #5a6fd6 0%, #6a4393 100%)",
                                },
                            },
                        },
                    }}
                >
                    <ToggleButton value="dropdown">
                        <ListAltIcon sx={{ mr: 0.5, fontSize: 18 }} />
                        เลือกจากรายการ
                    </ToggleButton>
                    <ToggleButton value="text">
                        <EditNoteIcon sx={{ mr: 0.5, fontSize: 18 }} />
                        พิมพ์เอง
                    </ToggleButton>
                </ToggleButtonGroup>

                {/* Selected option indicator */}
                {finalValue && (
                    <Box
                        sx={{
                            mb: 2.5,
                            p: 1.5,
                            borderRadius: 2.5,
                            backgroundColor: inputMode === "dropdown" ? selectedColor.bg : "#F3E5F5",
                            border: `2px solid ${inputMode === "dropdown" ? selectedColor.border : "#764ba2"}`,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            transition: "all 0.3s ease",
                        }}
                    >
                        <Typography sx={{ fontSize: "1.3rem" }}>
                            {inputMode === "dropdown" ? selectedColor.icon : "✏️"}
                        </Typography>
                        <Typography sx={{
                            fontWeight: 700,
                            color: inputMode === "dropdown" ? selectedColor.border : "#764ba2",
                            fontSize: "0.9rem",
                        }}>
                            {inputMode === "dropdown"
                                ? (dropdownOptions.find(o => o.value === ddValue)?.label ?? ddValue)
                                : customText.trim()}
                        </Typography>
                    </Box>
                )}

                {/* === Mode: Dropdown === */}
                {inputMode === "dropdown" && (
                    <FormControl fullWidth size="medium">
                        <InputLabel sx={{ fontWeight: 600 }}>{dropdownLabel}</InputLabel>
                        <Select
                            label={dropdownLabel}
                            value={ddValue}
                            onChange={(e) => setDropdown(String(e.target.value))}
                            disabled={dropdownDisabled || disabled || saving}
                            sx={{
                                borderRadius: 2.5,
                                backgroundColor: "#FAFAFA",
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#E0E0E0",
                                    borderWidth: 2,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#667eea",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#764ba2",
                                },
                            }}
                        >
                            {dropdownEmptyAllowed && (
                                <MenuItem value="">
                                    <Typography color="text.secondary">— เลือก —</Typography>
                                </MenuItem>
                            )}
                            {dropdownOptions.map((opt) => (
                                <MenuItem
                                    key={opt.value}
                                    value={opt.value}
                                    sx={{
                                        py: 1.2,
                                        borderRadius: 1,
                                        mx: 0.5,
                                        "&:hover": { backgroundColor: "#F3E5F5" },
                                        "&.Mui-selected": {
                                            backgroundColor: "#EDE7F6",
                                            "&:hover": { backgroundColor: "#E1BEE7" },
                                        },
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography sx={{ fontSize: "1.1rem" }}>
                                            {optionColorMap[opt.value]?.icon ?? "📝"}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>

                        {isDropdownMissing && (
                            <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.75, ml: 0.5 }}>
                                กรุณาเลือก{dropdownLabel}
                            </Typography>
                        )}
                    </FormControl>
                )}

                {/* === Mode: Free Text === */}
                {inputMode === "text" && (
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={6}
                        placeholder="พิมพ์ remark ที่ต้องการ..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        disabled={disabled || saving}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                backgroundColor: "#FAFAFA",
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#E0E0E0",
                                    borderWidth: 2,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#667eea",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#764ba2",
                                },
                            },
                        }}
                    />
                )}

                {/* Buttons */}
                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                    <Button
                        fullWidth
                        onClick={onClose}
                        disabled={saving}
                        variant="outlined"
                        sx={{
                            py: 1.3,
                            borderRadius: 2.5,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            borderColor: "#E0E0E0",
                            borderWidth: 2,
                            color: "#757575",
                            "&:hover": {
                                borderColor: "#BDBDBD",
                                borderWidth: 2,
                                backgroundColor: "#FAFAFA",
                            },
                        }}
                    >
                        ยกเลิก
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSave}
                        disabled={disabled || saving || isMissingValue}
                        startIcon={<SaveIcon />}
                        sx={{
                            py: 1.3,
                            borderRadius: 2.5,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            boxShadow: "0 4px 14px -2px rgba(102, 126, 234, 0.4)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4393 100%)",
                                boxShadow: "0 6px 20px -2px rgba(102, 126, 234, 0.5)",
                            },
                            "&.Mui-disabled": {
                                background: "#E0E0E0",
                                color: "#9E9E9E",
                            },
                        }}
                    >
                        {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};
