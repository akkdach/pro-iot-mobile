// CheckList.tsx
import React, { useMemo, useReducer, useState } from "react";
import {
    Alert,
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Toolbar,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type InspectionType = "pre_trip" | "post_trip";
type ItemStatus = "unchecked" | "pass" | "repair" | "fail";
type FinalDecision = "FIT" | "HOLD" | "UNFIT";

type Photo = {
    id: string;
    name: string;
    dataUrl: string; // store as base64 for MVP
};

type ChecklistItem = {
    key: string;
    category: string;
    label: string;
    hint?: string;
    status: ItemStatus;
    note: string;
    photos: Photo[];
};

type ChecklistForm = {
    checklistId: string;
    createdAt: string;

    inspectionType: InspectionType;

    plateNo: string;
    vehicleNo: string;
    odometer: string;
    location: string;
    route: string;

    inspectorId: string;
    inspectorName: string;

    overallNote: string;
    supervisorName: string;
};

type RuleHit = { level: FinalDecision; message: string };

function pad2(n: number) {
    return String(n).padStart(2, "0");
}
function newId(prefix: string) {
    const d = new Date();
    return `${prefix}-${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(
        d.getHours()
    )}${pad2(d.getMinutes())}${pad2(d.getSeconds())}-${Math.floor(Math.random() * 900 + 100)}`;
}
function isoNow() {
    return new Date().toISOString();
}

const DEFAULT_ITEMS: Array<Omit<ChecklistItem, "status" | "note" | "photos">> = [
    // ภายนอก
    { key: "tire", category: "ภายนอก", label: "ยาง / ดอกยาง / แรงดัน", hint: "ดูรอยบวม รั่ว สึกผิดปกติ" },
    { key: "lights", category: "ภายนอก", label: "ไฟหน้า / ไฟท้าย / ไฟเลี้ยว / ไฟเบรก" },
    { key: "mirrors", category: "ภายนอก", label: "กระจกมองข้าง / กระจกหน้า", hint: "ไม่มีร้าว/แตก" },
    { key: "wiper", category: "ภายนอก", label: "ที่ปัดน้ำฝน / น้ำฉีดกระจก" },

    // ของเหลว
    { key: "engine_oil", category: "ของเหลว", label: "น้ำมันเครื่อง", hint: "อยู่ในระดับที่กำหนด" },
    { key: "coolant", category: "ของเหลว", label: "น้ำหล่อเย็น / หม้อน้ำ" },
    { key: "brake_fluid", category: "ของเหลว", label: "น้ำมันเบรก" },

    // ระบบขับขี่
    { key: "brake", category: "ระบบขับขี่", label: "เบรก / มือเบรก", hint: "เหยียบไม่จม ไม่ลื่น" },
    { key: "steering", category: "ระบบขับขี่", label: "พวงมาลัย / ช่วงล่าง", hint: "ไม่มีเสียง/สั่นผิดปกติ" },
    { key: "horn", category: "ระบบขับขี่", label: "แตร" },

    // ความปลอดภัย
    { key: "seatbelt", category: "ความปลอดภัย", label: "เข็มขัดนิรภัย" },
    { key: "dash_warning", category: "ความปลอดภัย", label: "ไฟเตือนบนหน้าปัด", hint: "ไม่มีไฟเตือนสำคัญค้าง" },

    // อุปกรณ์ฉุกเฉิน
    { key: "fire_ext", category: "อุปกรณ์ฉุกเฉิน", label: "ถังดับเพลิง", hint: "อยู่ครบ/ไม่หมดอายุ" },
    { key: "triangle", category: "อุปกรณ์ฉุกเฉิน", label: "สามเหลี่ยมสะท้อนแสง" },
    { key: "first_aid", category: "อุปกรณ์ฉุกเฉิน", label: "ชุดปฐมพยาบาล" },

    // ห้องโดยสาร
    { key: "clean", category: "ห้องโดยสาร", label: "ความสะอาด / กลิ่นผิดปกติ" },
    { key: "documents", category: "ห้องโดยสาร", label: "เอกสารรถ / พรบ. / ประกัน", hint: "อยู่ครบตามข้อกำหนด" },
];

function buildInitialItems(): ChecklistItem[] {
    return DEFAULT_ITEMS.map((x) => ({
        ...x,
        status: "unchecked",
        note: "",
        photos: [],
    }));
}

type State = { form: ChecklistForm; items: ChecklistItem[] };

type Action =
    | { type: "SET_FORM"; key: keyof ChecklistForm; value: any }
    | { type: "SET_STATUS"; itemKey: string; status: ItemStatus }
    | { type: "SET_NOTE"; itemKey: string; note: string }
    | { type: "ADD_PHOTOS"; itemKey: string; photos: Photo[] }
    | { type: "REMOVE_PHOTO"; itemKey: string; photoId: string }
    | { type: "RESET" }
    | { type: "LOAD"; payload: State };

const initialState: State = {
    form: {
        checklistId: newId("VCL"),
        createdAt: isoNow(),
        inspectionType: "pre_trip",
        plateNo: "",
        vehicleNo: "",
        odometer: "",
        location: "",
        route: "",
        inspectorId: "",
        inspectorName: "",
        overallNote: "",
        supervisorName: "",
    },
    items: buildInitialItems(),
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_FORM":
            return { ...state, form: { ...state.form, [action.key]: action.value } };
        case "SET_STATUS":
            return {
                ...state,
                items: state.items.map((it) =>
                    it.key === action.itemKey
                        ? {
                            ...it,
                            status: action.status,
                            // ถ้าเลือก pass/unchecked ให้เคลียร์ note+photos อัตโนมัติ (MVP friendly)
                            note: action.status === "pass" || action.status === "unchecked" ? "" : it.note,
                            photos: action.status === "pass" || action.status === "unchecked" ? [] : it.photos,
                        }
                        : it
                ),
            };
        case "SET_NOTE":
            return {
                ...state,
                items: state.items.map((it) => (it.key === action.itemKey ? { ...it, note: action.note } : it)),
            };
        case "ADD_PHOTOS":
            return {
                ...state,
                items: state.items.map((it) => {
                    if (it.key !== action.itemKey) return it;
                    const merged = [...it.photos, ...action.photos].slice(0, 3); // จำกัด 3 รูป/รายการ
                    return { ...it, photos: merged };
                }),
            };
        case "REMOVE_PHOTO":
            return {
                ...state,
                items: state.items.map((it) =>
                    it.key === action.itemKey ? { ...it, photos: it.photos.filter((p) => p.id !== action.photoId) } : it
                ),
            };
        case "RESET":
            return {
                form: { ...initialState.form, checklistId: newId("VCL"), createdAt: isoNow() },
                items: buildInitialItems(),
            };
        case "LOAD":
            return action.payload;
        default:
            return state;
    }
}

function decisionColor(d: FinalDecision): "success" | "warning" | "error" {
    if (d === "FIT") return "success";
    if (d === "HOLD") return "warning";
    return "error";
}
function decisionLabel(d: FinalDecision) {
    if (d === "FIT") return "ผ่าน (FIT)";
    if (d === "HOLD") return "ต้องซ่อม/ติดตาม (HOLD)";
    return "ไม่พร้อมใช้งาน (UNFIT)";
}

function evaluate(items: ChecklistItem[]): { decision: FinalDecision; hits: RuleHit[] } {
    const hits: RuleHit[] = [];
    const hasFail = items.some((i) => i.status === "fail");
    const hasRepair = items.some((i) => i.status === "repair");

    if (hasFail) hits.push({ level: "UNFIT", message: "พบรายการ “ไม่ผ่าน (Fail)” อย่างน้อย 1 รายการ" });
    if (!hasFail && hasRepair) hits.push({ level: "HOLD", message: "พบรายการ “ต้องซ่อม (Repair)”" });
    if (!hasFail && !hasRepair) hits.push({ level: "FIT", message: "ไม่มีรายการผิดปกติ" });

    const decision: FinalDecision = hasFail ? "UNFIT" : hasRepair ? "HOLD" : "FIT";
    return { decision, hits };
}

function groupByCategory(items: ChecklistItem[]) {
    const map = new Map<string, ChecklistItem[]>();
    for (const it of items) {
        if (!map.has(it.category)) map.set(it.category, []);
        map.get(it.category)!.push(it);
    }
    return Array.from(map.entries()).map(([category, list]) => ({ category, list }));
}

function safeJsonParse<T>(s: string | null): T | null {
    if (!s) return null;
    try {
        return JSON.parse(s) as T;
    } catch {
        return null;
    }
}

async function filesToDataUrls(files: FileList): Promise<Photo[]> {
    const arr = Array.from(files).slice(0, 3);
    const toOne = (f: File) =>
        new Promise<Photo>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
                resolve({
                    id: newId("P"),
                    name: f.name,
                    dataUrl: String(reader.result || ""),
                });
            reader.onerror = () => reject(new Error("read error"));
            reader.readAsDataURL(f);
        });
    return Promise.all(arr.map(toOne));
}

export default function CheckList() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { form, items } = state;

    const [openSubmit, setOpenSubmit] = useState(false);
    const [openSaved, setOpenSaved] = useState(false);
    const [lastSavedJson, setLastSavedJson] = useState("");

    const grouped = useMemo(() => groupByCategory(items), [items]);
    const auto = useMemo(() => evaluate(items), [items]);

    const counts = useMemo(() => {
        const total = items.length;
        const unchecked = items.filter((i) => i.status === "unchecked").length;
        const pass = items.filter((i) => i.status === "pass").length;
        const repair = items.filter((i) => i.status === "repair").length;
        const fail = items.filter((i) => i.status === "fail").length;
        return { total, unchecked, pass, repair, fail };
    }, [items]);

    const missingRequired = useMemo(() => {
        const miss: string[] = [];
        if (!form.plateNo.trim() && !form.vehicleNo.trim()) miss.push("ทะเบียน หรือ เลขรถ");
        if (!form.odometer.trim()) miss.push("เลขไมล์");
        if (!form.inspectorName.trim()) miss.push("ชื่อผู้ตรวจ");
        return miss;
    }, [form]);

    const issueItems = useMemo(
        () => items.filter((i) => i.status === "repair" || i.status === "fail"),
        [items]
    );

    const validationIssues = useMemo(() => {
        const issues: string[] = [];

        if (missingRequired.length > 0) issues.push(`กรอกข้อมูลจำเป็น: ${missingRequired.join(", ")}`);

        if (counts.unchecked > 0) issues.push(`ยังมีรายการ “ยังไม่ตรวจ” อยู่ ${counts.unchecked} รายการ`);

        for (const it of issueItems) {
            if (it.note.trim().length < 3) issues.push(`ต้องใส่หมายเหตุให้ “${it.label}”`);
            if (it.status === "fail" && it.photos.length === 0) issues.push(`Fail ต้องแนบรูปให้ “${it.label}”`);
        }

        return issues;
    }, [missingRequired, counts.unchecked, issueItems]);

    const canSubmit = validationIssues.length === 0;

    const buildPayload = () => {
        return {
            ...form,
            evaluated: {
                finalDecision: auto.decision,
                counts,
                hits: auto.hits,
            },
            items: items.map((i) => ({
                key: i.key,
                category: i.category,
                label: i.label,
                status: i.status,
                note: i.note,
                photos: i.photos, // base64 (MVP)
            })),
        };
    };

    const saveToLocal = () => {
        const payload = buildPayload();
        const json = JSON.stringify(payload, null, 2);

        const key = `vehicle_checklist:${form.checklistId}`;
        localStorage.setItem(key, json);

        const indexKey = "vehicle_checklist:index";
        const index = safeJsonParse<string[]>(localStorage.getItem(indexKey)) ?? [];
        if (!index.includes(key)) index.unshift(key);
        localStorage.setItem(indexKey, JSON.stringify(index.slice(0, 50)));

        setLastSavedJson(json);
        setOpenSaved(true);
    };

    const copyJson = async () => {
        try {
            await navigator.clipboard.writeText(lastSavedJson);
        } catch {
            // ignore
        }
    };

    const loadLatestDraft = () => {
        const indexKey = "vehicle_checklist:index";
        const index = safeJsonParse<string[]>(localStorage.getItem(indexKey)) ?? [];
        const latestKey = index[0];
        if (!latestKey) return;

        const raw = localStorage.getItem(latestKey);
        const parsed = safeJsonParse<any>(raw);
        if (!parsed) return;

        // สร้าง state กลับมา
        const loaded: State = {
            form: {
                ...initialState.form,
                ...parsed,
            },
            items: (parsed.items ?? []).map((x: any) => ({
                key: x.key,
                category: x.category,
                label: x.label,
                hint: DEFAULT_ITEMS.find((d) => d.key === x.key)?.hint,
                status: x.status as ItemStatus,
                note: x.note ?? "",
                photos: (x.photos ?? []) as Photo[],
            })),
        };

        // ถ้ารายการไม่ครบ ให้ merge กับ default
        const keys = new Set(loaded.items.map((i) => i.key));
        for (const def of DEFAULT_ITEMS) {
            if (!keys.has(def.key)) {
                loaded.items.push({ ...def, status: "unchecked", note: "", photos: [] });
            }
        }

        dispatch({ type: "LOAD", payload: loaded });
    };

    return (
        <Box sx={{ maxWidth: 1100, mx: "auto", pb: 10 }}>
            {/* Top bar */}
            <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
                    <Box sx={{ flex: 1, minWidth: 240 }}>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>Checklist ตรวจสภาพรถยนต์</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            MVP: แตะครั้งเดียวเพื่อ “ผ่าน/ต้องซ่อม/ไม่ผ่าน” + แนบรูปเมื่อมีปัญหา
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                        <Chip label={`ID: ${form.checklistId}`} variant="outlined" />
                        <Chip
                            label={form.inspectionType === "pre_trip" ? "ก่อนออก (Pre-trip)" : "หลังกลับ (Post-trip)"}
                            variant="outlined"
                        />
                        <Chip
                            label={`ผลรวม: ${decisionLabel(auto.decision)}`}
                            color={decisionColor(auto.decision)}
                            variant="outlined"
                        />
                        <Button variant="outlined" onClick={loadLatestDraft}>
                            โหลด Draft ล่าสุด
                        </Button>
                        <Button variant="outlined" onClick={() => window.print()}>
                            Print
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={2}>
                    {/* Summary */}
                    <Alert severity={decisionColor(auto.decision)} variant="outlined">
                        <Stack spacing={0.5}>
                            <Typography sx={{ fontWeight: 800 }}>สรุป: {decisionLabel(auto.decision)}</Typography>
                            <Typography variant="body2">
                                Pass {counts.pass}/{counts.total} • Repair {counts.repair} • Fail {counts.fail} • ยังไม่ตรวจ {counts.unchecked}
                            </Typography>
                        </Stack>
                    </Alert>

                    {/* Vehicle info */}
                    <Card variant="outlined">
                        <CardContent>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>1) ข้อมูลรถ / งาน</Typography>
                            <Stack spacing={2}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField
                                        label="ทะเบียน"
                                        value={form.plateNo}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "plateNo", value: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="เลขรถ (Vehicle No.)"
                                        value={form.vehicleNo}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "vehicleNo", value: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="เลขไมล์ (Odometer) *"
                                        value={form.odometer}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "odometer", value: e.target.value })}
                                        fullWidth
                                    />
                                </Stack>

                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField
                                        label="สถานที่ตรวจ"
                                        value={form.location}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "location", value: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="เส้นทาง/งาน"
                                        value={form.route}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "route", value: e.target.value })}
                                        fullWidth
                                    />
                                </Stack>

                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField
                                        label="ชื่อผู้ตรวจ *"
                                        value={form.inspectorName}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "inspectorName", value: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="รหัสผู้ตรวจ"
                                        value={form.inspectorId}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "inspectorId", value: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="ประเภทการตรวจ"
                                        value={form.inspectionType}
                                        onChange={(e) => dispatch({ type: "SET_FORM", key: "inspectionType", value: e.target.value })}
                                        select
                                        fullWidth
                                    >
                                        <option value="pre_trip">ก่อนออก (Pre-trip)</option>
                                        <option value="post_trip">หลังกลับ (Post-trip)</option>
                                    </TextField>
                                </Stack>

                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    เวลา: <b>{new Date(form.createdAt).toLocaleString()}</b>
                                </Typography>

                                {missingRequired.length > 0 && (
                                    <Alert severity="warning" variant="outlined">
                                        กรุณากรอกข้อมูลจำเป็น: {missingRequired.join(", ")}
                                    </Alert>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Checklist */}
                    <Card variant="outlined">
                        <CardContent>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>2) Checklist ตรวจสภาพ</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                แตะสถานะ: ✅ ผ่าน / ⚠️ ต้องซ่อม / ❌ ไม่ผ่าน — ถ้าเลือก ⚠️ หรือ ❌ ให้ใส่หมายเหตุ และแนบรูป (Fail บังคับรูป)
                            </Typography>

                            <Stack spacing={1}>
                                {grouped.map(({ category, list }) => {
                                    const catCounts = {
                                        unchecked: list.filter((i) => i.status === "unchecked").length,
                                        pass: list.filter((i) => i.status === "pass").length,
                                        repair: list.filter((i) => i.status === "repair").length,
                                        fail: list.filter((i) => i.status === "fail").length,
                                    };

                                    return (
                                        <Accordion key={category} defaultExpanded>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                    <Typography sx={{ fontWeight: 800 }}>{category}</Typography>
                                                    <Chip size="small" label={`Pass ${catCounts.pass}`} variant="outlined" />
                                                    <Chip size="small" label={`Repair ${catCounts.repair}`} color="warning" variant="outlined" />
                                                    <Chip size="small" label={`Fail ${catCounts.fail}`} color="error" variant="outlined" />
                                                    {catCounts.unchecked > 0 && (
                                                        <Chip size="small" label={`ยังไม่ตรวจ ${catCounts.unchecked}`} variant="outlined" />
                                                    )}
                                                </Stack>
                                            </AccordionSummary>

                                            <AccordionDetails>
                                                <Stack spacing={2}>
                                                    {list.map((it) => (
                                                        <Box
                                                            key={it.key}
                                                            sx={{
                                                                p: 1.5,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                borderRadius: 2,
                                                            }}
                                                        >
                                                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography sx={{ fontWeight: 800 }}>{it.label}</Typography>
                                                                    {it.hint && (
                                                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                                            {it.hint}
                                                                        </Typography>
                                                                    )}
                                                                </Box>

                                                                <ToggleButtonGroup
                                                                    size="small"
                                                                    exclusive
                                                                    value={it.status}
                                                                    onChange={(_, v) => {
                                                                        if (!v) return;
                                                                        dispatch({ type: "SET_STATUS", itemKey: it.key, status: v as ItemStatus });
                                                                    }}
                                                                >
                                                                    <ToggleButton value="pass">✅ ผ่าน</ToggleButton>
                                                                    <ToggleButton value="repair">⚠️ ต้องซ่อม</ToggleButton>
                                                                    <ToggleButton value="fail">❌ ไม่ผ่าน</ToggleButton>
                                                                    <ToggleButton value="unchecked">ยังไม่ตรวจ</ToggleButton>
                                                                </ToggleButtonGroup>
                                                            </Stack>

                                                            {(it.status === "repair" || it.status === "fail") && (
                                                                <Box sx={{ mt: 1.5 }}>
                                                                    <Stack spacing={1}>
                                                                        <TextField
                                                                            label="หมายเหตุ (อย่างน้อย 3 ตัวอักษร)"
                                                                            value={it.note}
                                                                            onChange={(e) =>
                                                                                dispatch({ type: "SET_NOTE", itemKey: it.key, note: e.target.value })
                                                                            }
                                                                            fullWidth
                                                                            multiline
                                                                            minRows={2}
                                                                            error={it.note.trim().length > 0 && it.note.trim().length < 3}
                                                                            helperText={
                                                                                it.status === "fail"
                                                                                    ? "Fail แนะนำระบุปัญหาให้ชัด และแนบรูป"
                                                                                    : "Repair แนะนำระบุสิ่งที่ต้องแก้ไข"
                                                                            }
                                                                        />

                                                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                                            <Button
                                                                                variant="outlined"
                                                                                startIcon={<PhotoCameraIcon />}
                                                                                component="label"
                                                                            >
                                                                                แนบรูป (สูงสุด 3)
                                                                                <input
                                                                                    hidden
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    multiple
                                                                                    onChange={async (e) => {
                                                                                        const files = e.target.files;
                                                                                        if (!files || files.length === 0) return;
                                                                                        const photos = await filesToDataUrls(files);
                                                                                        dispatch({ type: "ADD_PHOTOS", itemKey: it.key, photos });
                                                                                        e.currentTarget.value = "";
                                                                                    }}
                                                                                />
                                                                            </Button>

                                                                            {it.status === "fail" && it.photos.length === 0 && (
                                                                                <Chip size="small" color="error" label="Fail ต้องแนบรูป" variant="outlined" />
                                                                            )}

                                                                            {it.photos.map((p) => (
                                                                                <Chip
                                                                                    key={p.id}
                                                                                    label={p.name}
                                                                                    variant="outlined"
                                                                                    onDelete={() =>
                                                                                        dispatch({ type: "REMOVE_PHOTO", itemKey: it.key, photoId: p.id })
                                                                                    }
                                                                                    deleteIcon={<DeleteOutlineIcon />}
                                                                                />
                                                                            ))}
                                                                        </Stack>

                                                                        {it.photos.length > 0 && (
                                                                            <Box
                                                                                sx={{
                                                                                    display: "grid",
                                                                                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
                                                                                    gap: 1,
                                                                                    mt: 1,
                                                                                }}
                                                                            >
                                                                                {it.photos.map((p) => (
                                                                                    <Box
                                                                                        key={p.id}
                                                                                        sx={{
                                                                                            border: "1px solid",
                                                                                            borderColor: "divider",
                                                                                            borderRadius: 2,
                                                                                            overflow: "hidden",
                                                                                            position: "relative",
                                                                                        }}
                                                                                    >
                                                                                        <img
                                                                                            src={p.dataUrl}
                                                                                            alt={p.name}
                                                                                            style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                                                                                        />
                                                                                        <Tooltip title="ลบรูป">
                                                                                            <IconButton
                                                                                                size="small"
                                                                                                onClick={() =>
                                                                                                    dispatch({ type: "REMOVE_PHOTO", itemKey: it.key, photoId: p.id })
                                                                                                }
                                                                                                sx={{
                                                                                                    position: "absolute",
                                                                                                    top: 6,
                                                                                                    right: 6,
                                                                                                    bgcolor: "rgba(255,255,255,0.85)",
                                                                                                }}
                                                                                            >
                                                                                                <DeleteOutlineIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                    </Box>
                                                                                ))}
                                                                            </Box>
                                                                        )}
                                                                    </Stack>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Issues auto list */}
                    <Card variant="outlined">
                        <CardContent>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>3) รายการที่ต้องแก้ไข (Auto)</Typography>
                            {issueItems.length === 0 ? (
                                <Alert severity="success" variant="outlined">
                                    ไม่มีรายการต้องแก้ไข
                                </Alert>
                            ) : (
                                <Stack spacing={1}>
                                    {issueItems.map((it) => (
                                        <Alert
                                            key={it.key}
                                            severity={it.status === "fail" ? "error" : "warning"}
                                            variant="outlined"
                                        >
                                            <Typography sx={{ fontWeight: 800 }}>
                                                {it.status === "fail" ? "❌ Fail:" : "⚠️ Repair:"} {it.label}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                หมายเหตุ: {it.note?.trim() ? it.note : "-"} • รูป: {it.photos.length}
                                            </Typography>
                                        </Alert>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>

                    {/* Summary / Decision */}
                    <Card variant="outlined">
                        <CardContent>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>4) สรุปผล</Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                    <Chip label={`Pass ${counts.pass}`} color="success" variant="outlined" />
                                    <Chip label={`Repair ${counts.repair}`} color="warning" variant="outlined" />
                                    <Chip label={`Fail ${counts.fail}`} color="error" variant="outlined" />
                                    {counts.unchecked > 0 && <Chip label={`ยังไม่ตรวจ ${counts.unchecked}`} variant="outlined" />}
                                    <Chip label={`Final: ${decisionLabel(auto.decision)}`} color={decisionColor(auto.decision)} variant="outlined" />
                                </Stack>

                                <TextField
                                    label="หมายเหตุรวม"
                                    value={form.overallNote}
                                    onChange={(e) => dispatch({ type: "SET_FORM", key: "overallNote", value: e.target.value })}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />

                                <TextField
                                    label="หัวหน้ารับทราบ/อนุมัติ (ถ้ามี)"
                                    value={form.supervisorName}
                                    onChange={(e) => dispatch({ type: "SET_FORM", key: "supervisorName", value: e.target.value })}
                                    fullWidth
                                />

                                <Alert severity="info" variant="outlined">
                                    Logic (MVP): มี Fail → UNFIT, ไม่มี Fail แต่มี Repair → HOLD, ไม่มีปัญหา → FIT
                                </Alert>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            {/* Sticky footer actions */}
            <Box
                sx={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "background.paper",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    px: 2,
                    py: 1.5,
                    zIndex: 1200,
                }}
            >
                <Box sx={{ maxWidth: 1100, mx: "auto" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {form.plateNo || form.vehicleNo ? (
                                <>
                                    รถ: <b>{form.plateNo || form.vehicleNo}</b> • ผล: <b>{decisionLabel(auto.decision)}</b>
                                </>
                            ) : (
                                "กรอกข้อมูลรถและตรวจรายการให้ครบก่อนส่งผล"
                            )}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    saveToLocal();
                                }}
                            >
                                บันทึกร่าง
                            </Button>

                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => dispatch({ type: "RESET" })}
                            >
                                ล้างฟอร์ม
                            </Button>

                            <Button
                                variant="contained"
                                onClick={() => setOpenSubmit(true)}
                                disabled={validationIssues.length > 0}
                            >
                                ส่งผลตรวจ
                            </Button>
                        </Stack>
                    </Stack>

                    {validationIssues.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            <Alert severity="warning" variant="outlined">
                                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>ยังส่งผลไม่ได้:</Typography>
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {validationIssues.slice(0, 5).map((x, idx) => (
                                        <li key={idx}>{x}</li>
                                    ))}
                                </ul>
                            </Alert>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Submit dialog */}
            <Dialog open={openSubmit} onClose={() => setOpenSubmit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>ยืนยันการส่งผลตรวจ</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity={decisionColor(auto.decision)} variant="outlined">
                            ผลสรุป: <b>{decisionLabel(auto.decision)}</b>
                            <br />
                            Pass {counts.pass}/{counts.total} • Repair {counts.repair} • Fail {counts.fail}
                        </Alert>

                        {validationIssues.length > 0 ? (
                            <Alert severity="warning" variant="outlined">
                                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>แก้ไขก่อนส่ง:</Typography>
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {validationIssues.map((x, idx) => (
                                        <li key={idx}>{x}</li>
                                    ))}
                                </ul>
                            </Alert>
                        ) : (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                เมื่อกด “ส่งผล” ระบบ MVP นี้จะบันทึกลง localStorage (แทนการยิง API) — คุณสามารถเปลี่ยนเป็น POST ไป backend ได้ทันที
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSubmit(false)}>ยกเลิก</Button>
                    <Button
                        variant="contained"
                        disabled={!canSubmit}
                        onClick={() => {
                            setOpenSubmit(false);
                            saveToLocal();
                        }}
                    >
                        ส่งผล (บันทึก)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Saved dialog */}
            <Dialog open={openSaved} onClose={() => setOpenSaved(false)} maxWidth="md" fullWidth>
                <DialogTitle>บันทึกสำเร็จ</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity="success" variant="outlined">
                            บันทึกเรียบร้อย • Key: <b>vehicle_checklist:{form.checklistId}</b>
                        </Alert>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip label={`Final: ${decisionLabel(auto.decision)}`} color={decisionColor(auto.decision)} variant="outlined" />
                            <Chip label={`Pass ${counts.pass} / Repair ${counts.repair} / Fail ${counts.fail}`} variant="outlined" />
                        </Stack>

                        <TextField
                            label="Payload (JSON)"
                            value={lastSavedJson}
                            fullWidth
                            multiline
                            minRows={10}
                            InputProps={{ readOnly: true }}
                        />

                        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyJson} disabled={!lastSavedJson}>
                                Copy JSON
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setOpenSaved(false);
                                    dispatch({ type: "RESET" });
                                    setLastSavedJson("");
                                }}
                            >
                                ทำใบใหม่
                            </Button>
                        </Stack>

                        <Alert severity="info" variant="outlined">
                            ถ้าจะต่อ backend: ส่ง payload นี้ไป endpoint เช่น <b>POST /api/vehicle-checklist</b>
                        </Alert>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
