// CheckSheet.tsx
import React, { useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AppHeader from "../../Component/AppHeader";

/**
 * Safety Check Sheet - Driver Health (React TSX)
 * - โฟกัส: บันทึก/ประเมินความพร้อมขับรถแบบ "คัดกรอง" (ไม่ใช่การวินิจฉัยโรค)
 * - แนะนำให้ปรับ thresholds ให้ตรงกับนโยบายองค์กร/แพทย์อาชีวอนามัย
 */

type YesNo = "yes" | "no";

type CheckSheetForm = {
    // meta
    sheetId: string;
    createdAt: string; // ISO

    // driver info
    driverId: string;
    driverName: string;
    companyOrFleet: string;
    vehicleNo: string;
    route: string;

    // shift
    shiftType: "day" | "night" | "ot";
    shiftStart: string; // HH:mm
    shiftEnd: string; // HH:mm

    // vitals
    temperatureC: string; // keep as string for input
    bpSystolic: string;
    bpDiastolic: string;
    pulse: string;
    spo2: string;

    // rest & lifestyle
    sleepHours: string;
    lastMealHoursAgo: string;
    caffeineToday: "none" | "1-2" | "3-4" | "5+";
    hydration: "ok" | "low";

    // substances & meds
    alcoholLast12h: YesNo;
    alcoholTest: "not_tested" | "negative" | "positive";
    drugsSuspected: YesNo;
    medsAffectDriving: YesNo; // ยาที่อาจง่วง/เวียนหัว
    medsNote: string;

    // symptoms checklist
    symptoms: {
        feverChills: boolean;
        coughSoreThroat: boolean;
        shortBreath: boolean;
        chestPain: boolean;
        dizziness: boolean;
        headacheSevere: boolean;
        nauseaVomiting: boolean;
        diarrhea: boolean;
        blurredVision: boolean;
        muscleWeakness: boolean;
        injuryOrPain: boolean;
        stressAnxious: boolean;
        sleepyYawning: boolean;
    };

    // fatigue / readiness
    fatigueScale: 1 | 2 | 3 | 4 | 5; // 1 สดชื่น ... 5 ง่วงมาก
    reactionSelfCheck: "ok" | "not_ok"; // ทดสอบง่ายๆ เช่น นับถอยหลัง/สังเกตสมาธิ
    notes: string;

    // decision
    finalDecision: "auto" | "fit" | "hold" | "unfit";
    supervisorName: string;
    driverConfirmName: string;
};

type Decision = "FIT" | "HOLD" | "UNFIT";

type RuleHit = {
    code: string;
    level: Decision;
    message: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function newSheetId() {
    const d = new Date();
    // e.g. CS-20260119-104500-123
    return `CS-${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(
        d.getHours()
    )}${pad2(d.getMinutes())}${pad2(d.getSeconds())}-${Math.floor(Math.random() * 900 + 100)}`;
}

function isoNow() {
    return new Date().toISOString();
}

const initialForm: CheckSheetForm = {
    sheetId: newSheetId(),
    createdAt: isoNow(),

    driverId: "",
    driverName: "",
    companyOrFleet: "",
    vehicleNo: "",
    route: "",

    shiftType: "day",
    shiftStart: "08:00",
    shiftEnd: "17:00",

    temperatureC: "",
    bpSystolic: "",
    bpDiastolic: "",
    pulse: "",
    spo2: "",

    sleepHours: "",
    lastMealHoursAgo: "",
    caffeineToday: "none",
    hydration: "ok",

    alcoholLast12h: "no",
    alcoholTest: "not_tested",
    drugsSuspected: "no",
    medsAffectDriving: "no",
    medsNote: "",

    symptoms: {
        feverChills: false,
        coughSoreThroat: false,
        shortBreath: false,
        chestPain: false,
        dizziness: false,
        headacheSevere: false,
        nauseaVomiting: false,
        diarrhea: false,
        blurredVision: false,
        muscleWeakness: false,
        injuryOrPain: false,
        stressAnxious: false,
        sleepyYawning: false,
    },

    fatigueScale: 2,
    reactionSelfCheck: "ok",
    notes: "",

    finalDecision: "auto",
    supervisorName: "",
    driverConfirmName: "",
};

type Action =
    | { type: "SET"; key: keyof CheckSheetForm; value: any }
    | { type: "SET_SYMPTOM"; key: keyof CheckSheetForm["symptoms"]; value: boolean }
    | { type: "RESET" }
    | { type: "LOAD"; payload: CheckSheetForm };

function reducer(state: CheckSheetForm, action: Action): CheckSheetForm {
    switch (action.type) {
        case "SET":
            return { ...state, [action.key]: action.value };
        case "SET_SYMPTOM":
            return { ...state, symptoms: { ...state.symptoms, [action.key]: action.value } };
        case "RESET":
            return { ...initialForm, sheetId: newSheetId(), createdAt: isoNow() };
        case "LOAD":
            return action.payload;
        default:
            return state;
    }
}

function toNumber(v: string): number | null {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/**
 * กฎคัดกรอง (ตัวอย่าง)
 * ปรับค่า threshold ตาม SOP ขององค์กรได้เลย
 */
function evaluate(form: CheckSheetForm): { decision: Decision; hits: RuleHit[] } {
    const hits: RuleHit[] = [];

    const temp = toNumber(form.temperatureC);
    const sys = toNumber(form.bpSystolic);
    const dia = toNumber(form.bpDiastolic);
    const pulse = toNumber(form.pulse);
    const spo2 = toNumber(form.spo2);
    const sleep = toNumber(form.sleepHours);
    const lastMeal = toNumber(form.lastMealHoursAgo);

    // --- UNFIT (แดง) ---
    if (form.alcoholTest === "positive") {
        hits.push({ code: "ALC_POS", level: "UNFIT", message: "ผลตรวจแอลกอฮอล์เป็นบวก" });
    }
    if (form.drugsSuspected === "yes") {
        hits.push({ code: "DRUG_SUS", level: "UNFIT", message: "สงสัยสารเสพติด/มึนเมา" });
    }
    if (temp != null && temp >= 38.0) {
        hits.push({ code: "TEMP_HIGH", level: "UNFIT", message: "อุณหภูมิ ≥ 38.0°C" });
    }
    if (sys != null && sys >= 180) {
        hits.push({ code: "BP_SYS_CRIT", level: "UNFIT", message: "ความดันตัวบน ≥ 180" });
    }
    if (dia != null && dia >= 110) {
        hits.push({ code: "BP_DIA_CRIT", level: "UNFIT", message: "ความดันตัวล่าง ≥ 110" });
    }
    if (spo2 != null && spo2 < 93) {
        hits.push({ code: "SPO2_LOW", level: "UNFIT", message: "SpO₂ < 93%" });
    }
    if (pulse != null && (pulse < 45 || pulse > 130)) {
        hits.push({ code: "PULSE_CRIT", level: "UNFIT", message: "ชีพจร < 45 หรือ > 130" });
    }
    if (form.symptoms.chestPain) {
        hits.push({ code: "CHEST_PAIN", level: "UNFIT", message: "เจ็บหน้าอก" });
    }
    if (form.symptoms.shortBreath) {
        hits.push({ code: "SOB", level: "UNFIT", message: "หายใจลำบาก/เหนื่อยหอบ" });
    }
    if (form.symptoms.blurredVision) {
        hits.push({ code: "VISION", level: "UNFIT", message: "ตามัว/มองไม่ชัด" });
    }
    if (form.symptoms.muscleWeakness) {
        hits.push({ code: "WEAKNESS", level: "UNFIT", message: "อ่อนแรงผิดปกติ" });
    }

    // --- HOLD (เหลือง): ควรพัก/ตรวจซ้ำ/ปรึกษาหัวหน้า ---
    if (form.alcoholLast12h === "yes" && form.alcoholTest !== "negative") {
        hits.push({
            code: "ALC_RECENT",
            level: "HOLD",
            message: "ดื่มแอลกอฮอล์ใน 12 ชม. และยังไม่ยืนยันผลเป็นลบ",
        });
    }
    if (temp != null && temp >= 37.5 && temp < 38.0) {
        hits.push({ code: "TEMP_MILD", level: "HOLD", message: "อุณหภูมิ 37.5–37.9°C" });
    }
    if (sys != null && sys >= 160 && sys < 180) {
        hits.push({ code: "BP_SYS_HIGH", level: "HOLD", message: "ความดันตัวบน 160–179" });
    }
    if (dia != null && dia >= 100 && dia < 110) {
        hits.push({ code: "BP_DIA_HIGH", level: "HOLD", message: "ความดันตัวล่าง 100–109" });
    }
    if (spo2 != null && spo2 >= 93 && spo2 < 95) {
        hits.push({ code: "SPO2_BORDER", level: "HOLD", message: "SpO₂ 93–94%" });
    }
    if (pulse != null && (pulse < 50 || (pulse > 110 && pulse <= 130))) {
        hits.push({ code: "PULSE_WARN", level: "HOLD", message: "ชีพจร < 50 หรือ 111–130" });
    }
    if (sleep != null && sleep < 4) {
        hits.push({ code: "SLEEP_LOW", level: "HOLD", message: "นอน < 4 ชม." });
    }
    if (sleep != null && sleep >= 4 && sleep < 6) {
        hits.push({ code: "SLEEP_BORDER", level: "HOLD", message: "นอน 4–5.9 ชม." });
    }
    if (form.fatigueScale >= 4) {
        hits.push({ code: "FATIGUE_HIGH", level: "HOLD", message: "ความง่วงระดับ 4–5" });
    }
    if (form.reactionSelfCheck === "not_ok") {
        hits.push({ code: "REACTION", level: "HOLD", message: "สมาธิ/การตอบสนองไม่ดี" });
    }
    if (form.medsAffectDriving === "yes") {
        hits.push({ code: "MEDS", level: "HOLD", message: "มียาที่อาจมีผลต่อการขับขี่ (ง่วง/เวียนหัว)" });
    }

    // กลุ่มอาการทั่วไป ถ้ามีหลายข้อให้ HOLD
    const symptomCount = Object.values(form.symptoms).filter(Boolean).length;
    if (symptomCount >= 3) {
        hits.push({ code: "SYMPTOMS_3P", level: "HOLD", message: "มีอาการผิดปกติหลายข้อ (≥ 3)" });
    } else if (symptomCount >= 1) {
        hits.push({ code: "SYMPTOMS", level: "HOLD", message: "มีอาการผิดปกติ (อย่างน้อย 1 ข้อ)" });
    }

    // ไม่ได้กินข้าวนานมาก อาจหน้ามืด
    if (lastMeal != null && lastMeal >= 8) {
        hits.push({ code: "MEAL_GAP", level: "HOLD", message: "ไม่ได้ทานอาหาร ≥ 8 ชม." });
    }

    // สรุป decision
    const hasUnfit = hits.some((h) => h.level === "UNFIT");
    const hasHold = hits.some((h) => h.level === "HOLD");

    let decision: Decision = "FIT";
    if (hasUnfit) decision = "UNFIT";
    else if (hasHold) decision = "HOLD";

    return { decision, hits };
}

function decisionLabel(d: Decision) {
    if (d === "FIT") return "ผ่าน (FIT)";
    if (d === "HOLD") return "พัก/ตรวจซ้ำ (HOLD)";
    return "ไม่พร้อมขับ (UNFIT)";
}

function decisionSeverity(d: Decision): "success" | "warning" | "error" {
    if (d === "FIT") return "success";
    if (d === "HOLD") return "warning";
    return "error";
}

function buildPayload(form: CheckSheetForm, auto: { decision: Decision; hits: RuleHit[] }) {
    const final =
        form.finalDecision === "auto"
            ? auto.decision
            : form.finalDecision === "fit"
                ? "FIT"
                : form.finalDecision === "hold"
                    ? "HOLD"
                    : "UNFIT";

    return {
        ...form,
        evaluated: {
            autoDecision: auto.decision,
            autoHits: auto.hits,
            finalDecision: final,
        },
    };
}

export default function CheckSheet() {
    const navigate = useNavigate();
    const [form, dispatch] = useReducer(reducer, initialForm);
    const [openSubmit, setOpenSubmit] = useState(false);
    const [openSaved, setOpenSaved] = useState(false);
    const [lastSavedJson, setLastSavedJson] = useState<string>("");

    const auto = useMemo(() => evaluate(form), [form]);

    const finalDecision: Decision = useMemo(() => {
        if (form.finalDecision === "auto") return auto.decision;
        if (form.finalDecision === "fit") return "FIT";
        if (form.finalDecision === "hold") return "HOLD";
        return "UNFIT";
    }, [form.finalDecision, auto.decision]);

    const requiredMissing = useMemo(() => {
        const miss: string[] = [];
        if (!form.driverName.trim()) miss.push("ชื่อพนักงานขับรถ");
        if (!form.driverId.trim()) miss.push("รหัสพนักงาน");
        if (!form.vehicleNo.trim()) miss.push("เลขรถ/ทะเบียน");
        if (!form.shiftStart.trim()) miss.push("เวลาเริ่มงาน");
        if (!form.shiftEnd.trim()) miss.push("เวลาเลิกงาน");
        if (!form.driverConfirmName.trim()) miss.push("ผู้ขับรับรองชื่อ");
        // supervisor เป็น optional (แล้วแต่องค์กร)
        return miss;
    }, [form]);

    const canSubmit = requiredMissing.length === 0;

    const onSave = () => {
        const payload = buildPayload(form, auto);
        const json = JSON.stringify(payload, null, 2);
        setLastSavedJson(json);

        // ตัวอย่างเก็บลง localStorage (จริงๆ อาจยิง API ไปเก็บ)
        const key = `checksheet:${payload.sheetId}`;
        localStorage.setItem(key, json);

        // เก็บรายการ index
        const indexKey = "checksheet:index";
        const index = JSON.parse(localStorage.getItem(indexKey) || "[]") as string[];
        if (!index.includes(key)) {
            index.unshift(key);
            localStorage.setItem(indexKey, JSON.stringify(index.slice(0, 50)));
        }

        setOpenSaved(true);
    };

    const reset = () => {
        dispatch({ type: "RESET" });
        setLastSavedJson("");
    };

    const copyJson = async () => {
        try {
            await navigator.clipboard.writeText(lastSavedJson);
        } catch {
            // ignore
        }
    };

    return (
        <Box sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            maxWidth: 1100,
            mx: "auto",
            pb: { xs: 3, md: 4 }
        }}>
            <AppHeader title="Safety Check Sheet" />
            <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ mt: 7 }}>
                {/* Header Section - Mobile Optimized */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 1.5, sm: 2 }}
                    alignItems={{ xs: "stretch", sm: "flex-start" }}
                    justifyContent="space-between"
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                                lineHeight: 1.2,
                                mb: 0.5
                            }}
                        >
                            🛡️ Safety Check Sheet
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontSize: { xs: "0.813rem", sm: "0.875rem" }
                            }}
                        >
                            ตรวจสภาพความพร้อมคนขับรถ — การคัดกรอง
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/CheckList")}
                        sx={{
                            width: { xs: "100%", sm: "auto" },
                            minHeight: { xs: 44, sm: 36 },
                            whiteSpace: "nowrap"
                        }}
                    >
                        🚗 ตรวจสภาพรถ
                    </Button>
                </Stack>

                {/* Summary Alert - Mobile Optimized */}
                <Alert
                    severity={decisionSeverity(finalDecision)}
                    variant="outlined"
                    sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1.5, sm: 2 }
                    }}
                >
                    <Stack spacing={{ xs: 0.5, sm: 0.75 }}>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: "0.938rem", sm: "1rem" }
                            }}
                        >
                            {finalDecision === "FIT" ? "✅" : finalDecision === "HOLD" ? "⚠️" : "❌"} สรุปผล: {decisionLabel(finalDecision)}
                        </Typography>
                        {auto.hits.length > 0 ? (
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
                            >
                                เหตุผลสำคัญ:{" "}
                                {auto.hits
                                    .filter((h) => h.level === finalDecision || finalDecision === "FIT")
                                    .slice(0, 3)
                                    .map((h) => h.message)
                                    .join(" • ")}
                            </Typography>
                        ) : (
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
                            >
                                ไม่พบเงื่อนไขเสี่ยงจากข้อมูลที่กรอก
                            </Typography>
                        )}
                    </Stack>
                </Alert>


                {/* Vitals Section - Mobile Optimized */}
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: { xs: 1.5, sm: 2 }
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Typography
                            sx={{
                                fontWeight: 800,
                                mb: { xs: 1.5, sm: 2 },
                                fontSize: { xs: "1rem", sm: "1.125rem" }
                            }}
                        >
                            2) สัญญาณชีพ
                        </Typography>

                        <Stack spacing={{ xs: 2, sm: 2.5 }}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                                <TextField
                                    label="อุณหภูมิ (°C)"
                                    placeholder="เช่น 36.7"
                                    value={form.temperatureC}
                                    onChange={(e) =>
                                        dispatch({ type: "SET", key: "temperatureC", value: e.target.value })
                                    }
                                    fullWidth
                                    size="small"
                                    InputProps={{ sx: { minHeight: 44 } }}
                                />
                                <TextField
                                    label="ความดันตัวบน (SYS)"
                                    placeholder="เช่น 120"
                                    value={form.bpSystolic}
                                    onChange={(e) =>
                                        dispatch({ type: "SET", key: "bpSystolic", value: e.target.value })
                                    }
                                    fullWidth
                                    size="small"
                                    InputProps={{ sx: { minHeight: 44 } }}
                                />
                                <TextField
                                    label="ความดันตัวล่าง (DIA)"
                                    placeholder="เช่น 80"
                                    value={form.bpDiastolic}
                                    onChange={(e) =>
                                        dispatch({ type: "SET", key: "bpDiastolic", value: e.target.value })
                                    }
                                    fullWidth
                                    size="small"
                                    InputProps={{ sx: { minHeight: 44 } }}
                                />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                                <TextField
                                    label="ชีพจร (ครั้ง/นาที)"
                                    placeholder="เช่น 72"
                                    value={form.pulse}
                                    onChange={(e) => dispatch({ type: "SET", key: "pulse", value: e.target.value })}
                                    fullWidth
                                    size="small"
                                    InputProps={{ sx: { minHeight: 44 } }}
                                />
                                <TextField
                                    label="SpO₂ (%)"
                                    placeholder="เช่น 98"
                                    value={form.spo2}
                                    onChange={(e) => dispatch({ type: "SET", key: "spo2", value: e.target.value })}
                                    fullWidth
                                    size="small"
                                    InputProps={{ sx: { minHeight: 44 } }}
                                />
                            </Stack>

                            <Alert
                                severity="info"
                                variant="outlined"
                                sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
                            >
                                คำแนะนำ: ถ้าค่าออกนอกเกณฑ์ ให้พัก 10–15 นาทีแล้ววัดซ้ำ / ปรึกษาหัวหน้า/หน่วยพยาบาลตาม SOP
                            </Alert>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Rest / Lifestyle - Mobile Optimized */}
                <Card variant="outlined" sx={{ borderRadius: { xs: 1.5, sm: 2 } }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Typography sx={{ fontWeight: 800, mb: { xs: 1.5, sm: 2 }, fontSize: { xs: "1rem", sm: "1.125rem" } }}>3) การพักผ่อน / พฤติกรรมเสี่ยง</Typography>

                        <Stack spacing={{ xs: 2, sm: 2.5 }}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                                <TextField
                                    label="ชั่วโมงการนอน (ชม.)"
                                    placeholder="เช่น 7"
                                    value={form.sleepHours}
                                    onChange={(e) =>
                                        dispatch({ type: "SET", key: "sleepHours", value: e.target.value })
                                    }
                                    fullWidth
                                    size="small"
                                    InputProps={{ sx: { minHeight: 44 } }}
                                />
                                <TextField
                                    label="ทานอาหารล่าสุด (ชั่วโมงที่ผ่านมา)"
                                    placeholder="เช่น 3"
                                    value={form.lastMealHoursAgo}
                                    onChange={(e) =>
                                        dispatch({ type: "SET", key: "lastMealHoursAgo", value: e.target.value })
                                    }
                                    fullWidth
                                    size="small"
                                    InputProps={{ sx: { minHeight: 44 } }}
                                />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                                <FormControl fullWidth size="small" sx={{ minHeight: 44 }}>
                                    <FormLabel sx={{ mb: 0.5 }}>คาเฟอีนวันนี้</FormLabel>
                                    <Select
                                        value={form.caffeineToday}
                                        onChange={(e) =>
                                            dispatch({ type: "SET", key: "caffeineToday", value: e.target.value })
                                        }
                                    >
                                        <MenuItem value="none">ไม่ดื่ม</MenuItem>
                                        <MenuItem value="1-2">1–2 แก้ว</MenuItem>
                                        <MenuItem value="3-4">3–4 แก้ว</MenuItem>
                                        <MenuItem value="5+">5 แก้วขึ้นไป</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" sx={{ minHeight: 44 }}>
                                    <FormLabel sx={{ mb: 0.5 }}>ภาวะขาดน้ำ</FormLabel>
                                    <Select
                                        value={form.hydration}
                                        onChange={(e) =>
                                            dispatch({ type: "SET", key: "hydration", value: e.target.value })
                                        }
                                    >
                                        <MenuItem value="ok">ปกติ</MenuItem>
                                        <MenuItem value="low">ดื่มน้ำน้อย/ปากแห้ง</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Substances / Meds */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography sx={{ fontWeight: 800, mb: 1 }}>4) แอลกอฮอล์ / สารเสพติด / ยา</Typography>

                        <Stack spacing={2}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                                <FormControl>
                                    <FormLabel>ดื่มแอลกอฮอล์ใน 12 ชม. ที่ผ่านมา</FormLabel>
                                    <RadioGroup
                                        row
                                        value={form.alcoholLast12h}
                                        onChange={(e) =>
                                            dispatch({ type: "SET", key: "alcoholLast12h", value: e.target.value })
                                        }
                                    >
                                        <FormControlLabel value="no" control={<Radio />} label="ไม่ดื่ม" />
                                        <FormControlLabel value="yes" control={<Radio />} label="ดื่ม" />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl sx={{ minWidth: 260 }} size="small">
                                    <FormLabel sx={{ mb: 0.5 }}>ผลตรวจแอลกอฮอล์</FormLabel>
                                    <Select
                                        value={form.alcoholTest}
                                        onChange={(e) =>
                                            dispatch({ type: "SET", key: "alcoholTest", value: e.target.value })
                                        }
                                    >
                                        <MenuItem value="not_tested">ยังไม่ตรวจ</MenuItem>
                                        <MenuItem value="negative">ลบ (Negative)</MenuItem>
                                        <MenuItem value="positive">บวก (Positive)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                                <FormControl>
                                    <FormLabel>สงสัยสารเสพติด/มึนเมา</FormLabel>
                                    <RadioGroup
                                        row
                                        value={form.drugsSuspected}
                                        onChange={(e) =>
                                            dispatch({ type: "SET", key: "drugsSuspected", value: e.target.value })
                                        }
                                    >
                                        <FormControlLabel value="no" control={<Radio />} label="ไม่" />
                                        <FormControlLabel value="yes" control={<Radio />} label="ใช่" />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>มียาที่อาจมีผลต่อการขับขี่ (ง่วง/เวียนหัว)</FormLabel>
                                    <RadioGroup
                                        row
                                        value={form.medsAffectDriving}
                                        onChange={(e) =>
                                            dispatch({ type: "SET", key: "medsAffectDriving", value: e.target.value })
                                        }
                                    >
                                        <FormControlLabel value="no" control={<Radio />} label="ไม่มี" />
                                        <FormControlLabel value="yes" control={<Radio />} label="มี" />
                                    </RadioGroup>
                                </FormControl>
                            </Stack>

                            <TextField
                                label="ระบุชื่อยา/หมายเหตุ"
                                value={form.medsNote}
                                onChange={(e) => dispatch({ type: "SET", key: "medsNote", value: e.target.value })}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                {/* Symptoms */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography sx={{ fontWeight: 800, mb: 1 }}>5) อาการผิดปกติ (เลือกได้หลายข้อ)</Typography>

                        <FormGroup>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                                    gap: 1,
                                }}
                            >
                                {(
                                    [
                                        ["feverChills", "มีไข้/หนาวสั่น"],
                                        ["coughSoreThroat", "ไอ/เจ็บคอ"],
                                        ["shortBreath", "หายใจลำบาก/เหนื่อยหอบ"],
                                        ["chestPain", "เจ็บหน้าอก"],
                                        ["dizziness", "เวียนหัว/หน้ามืด"],
                                        ["headacheSevere", "ปวดศีรษะรุนแรง"],
                                        ["nauseaVomiting", "คลื่นไส้/อาเจียน"],
                                        ["diarrhea", "ท้องเสีย"],
                                        ["blurredVision", "ตามัว/มองไม่ชัด"],
                                        ["muscleWeakness", "อ่อนแรงผิดปกติ"],
                                        ["injuryOrPain", "บาดเจ็บ/ปวดมาก"],
                                        ["stressAnxious", "เครียดมาก/กังวล"],
                                        ["sleepyYawning", "ง่วงมาก/หาวบ่อย"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <FormControlLabel
                                        key={key}
                                        control={
                                            <Checkbox
                                                checked={form.symptoms[key]}
                                                onChange={(e) =>
                                                    dispatch({ type: "SET_SYMPTOM", key, value: e.target.checked })
                                                }
                                            />
                                        }
                                        label={label}
                                    />
                                ))}
                            </Box>
                        </FormGroup>

                        <Box sx={{ mt: 2 }}>
                            <Alert severity="info" variant="outlined">
                                หากมีอาการรุนแรง เช่น เจ็บหน้าอก/หายใจลำบาก/ตามัว ควร “ไม่ขับ” และปฏิบัติตาม SOP ทันที
                            </Alert>
                        </Box>
                    </CardContent>
                </Card>



                {/* Notes & Decision */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography sx={{ fontWeight: 800, mb: 1 }}>7) ข้อสังเกต / ผลสรุป</Typography>

                        <Stack spacing={2}>
                            <TextField
                                label="หมายเหตุเพิ่มเติม"
                                value={form.notes}
                                onChange={(e) => dispatch({ type: "SET", key: "notes", value: e.target.value })}
                                fullWidth
                                multiline
                                minRows={3}
                            />

                            <Divider />

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                                <FormControl sx={{ minWidth: 260 }} size="small">
                                    <FormLabel sx={{ mb: 0.5 }}>ผลสรุป (เลือกได้ / หรือใช้ Auto)</FormLabel>
                                    <Select
                                        value={form.finalDecision}
                                        onChange={(e) =>
                                            dispatch({ type: "SET", key: "finalDecision", value: e.target.value })
                                        }
                                    >
                                        <MenuItem value="auto">Auto (ตามกฎคัดกรอง)</MenuItem>
                                        <MenuItem value="fit">ผ่าน (FIT)</MenuItem>
                                        <MenuItem value="hold">พัก/ตรวจซ้ำ (HOLD)</MenuItem>
                                        <MenuItem value="unfit">ไม่พร้อมขับ (UNFIT)</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box sx={{ flex: 1 }} />
                                <Chip
                                    label={`Final: ${decisionLabel(finalDecision)}`}
                                    color={decisionSeverity(finalDecision)}
                                    variant="outlined"
                                />
                            </Stack>

                            {auto.hits.length > 0 && (
                                <Box>
                                    <Typography sx={{ fontWeight: 700, mb: 1 }}>เหตุผลจากระบบ (Auto Rules)</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {auto.hits.map((h) => (
                                            <Chip
                                                key={h.code}
                                                label={h.message}
                                                color={h.level === "UNFIT" ? "error" : h.level === "HOLD" ? "warning" : "success"}
                                                variant="outlined"
                                                sx={{ mb: 1 }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Divider />

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField
                                    label="หัวหน้างาน/ผู้ตรวจ (ถ้ามี)"
                                    value={form.supervisorName}
                                    onChange={(e) =>
                                        dispatch({ type: "SET", key: "supervisorName", value: e.target.value })
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="ผู้ขับรับรองชื่อ *"
                                    value={form.driverConfirmName}
                                    onChange={(e) =>
                                        dispatch({ type: "SET", key: "driverConfirmName", value: e.target.value })
                                    }
                                    fullWidth
                                />
                            </Stack>

                            <Alert severity="info" variant="outlined">
                                แนะนำ: เมื่อสรุปเป็น HOLD/UNFIT ให้ทำตาม SOP เช่น พัก, วัดซ้ำ, เปลี่ยนพนักงานขับ,
                                ส่งพบเจ้าหน้าที่พยาบาล/อาชีวอนามัย
                            </Alert>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Action Bar - Mobile Optimized */}
                <Box
                    sx={{
                        position: "sticky",
                        bottom: 0,
                        bgcolor: "background.paper",
                        borderTop: "1px solid",
                        borderColor: "divider",
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1.5, sm: 2, md: 3 },
                        mx: { xs: -1.5, sm: -2, md: -3 },
                    }}
                >
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 1, sm: 1.5 }}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                display: { xs: "none", sm: "block" }
                            }}
                        >
                            * ฟิลด์ที่มีเครื่องหมายดอกจันเป็นข้อมูลจำเป็น
                        </Typography>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 1, sm: 1.5 }}
                            justifyContent="flex-end"
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => window.print()}
                                sx={{ width: { xs: "100%", sm: "auto" }, minHeight: { xs: 48, sm: 36 } }}
                            >
                                พิมพ์
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={reset}
                                sx={{ width: { xs: "100%", sm: "auto" }, minHeight: { xs: 48, sm: 36 } }}
                            >
                                ล้างฟอร์ม
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => setOpenSubmit(true)}
                                disabled={!canSubmit}
                                sx={{ width: { xs: "100%", sm: "auto" }, minHeight: { xs: 48, sm: 36 } }}
                            >
                                บันทึก/ส่งผล
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>

            {/* Submit dialog */}
            <Dialog open={openSubmit} onClose={() => setOpenSubmit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>ยืนยันการบันทึก Check Sheet</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity={decisionSeverity(finalDecision)} variant="outlined">
                            ผลสรุปที่จะบันทึก: <b>{decisionLabel(finalDecision)}</b>
                        </Alert>

                        {requiredMissing.length > 0 && (
                            <Alert severity="warning" variant="outlined">
                                ข้อมูลจำเป็นยังไม่ครบ: {requiredMissing.join(", ")}
                            </Alert>
                        )}

                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            เมื่อกด “บันทึก” ระบบตัวอย่างนี้จะเก็บข้อมูลลง localStorage (สามารถเปลี่ยนเป็นเรียก API ได้)
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSubmit(false)}>ยกเลิก</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setOpenSubmit(false);
                            onSave();
                        }}
                        disabled={!canSubmit}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Saved dialog */}
            <Dialog open={openSaved} onClose={() => setOpenSaved(false)} maxWidth="md" fullWidth>
                <DialogTitle>บันทึกสำเร็จ</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity="success" variant="outlined">
                            บันทึก Check Sheet แล้ว (Key: <b>checksheet:{form.sheetId}</b>)
                        </Alert>

                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            <Chip label={`Sheet ID: ${form.sheetId}`} variant="outlined" />
                            <Chip label={`Final: ${decisionLabel(finalDecision)}`} color={decisionSeverity(finalDecision)} variant="outlined" />
                        </Stack>

                        <TextField
                            label="Payload (JSON)"
                            value={lastSavedJson}
                            fullWidth
                            multiline
                            minRows={10}
                            InputProps={{ readOnly: true }}
                        />

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button variant="outlined" onClick={copyJson} disabled={!lastSavedJson}>
                                Copy JSON
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setOpenSaved(false);
                                    // ถ้าต้องการเริ่มใบใหม่หลังบันทึก
                                    dispatch({ type: "RESET" });
                                    setLastSavedJson("");
                                }}
                            >
                                ทำใบใหม่
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
