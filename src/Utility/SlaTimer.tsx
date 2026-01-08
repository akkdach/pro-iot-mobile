import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

type SlaTimerProps = {
    slaStartDate?: string | null;
    slaStartTime?: string | null;
    slaFinishDate?: string | null;
    slaFinishTime?: string | null;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseTimeToHms(time?: string | null): { hh: number; mm: number; ss: number } | null {
    if (!time) return null;
    const t = time.trim();

    if (/^\d{6}$/.test(t)) {
        const hh = Number(t.slice(0, 2));
        const mm = Number(t.slice(2, 4));
        const ss = Number(t.slice(4, 6));
        if ([hh, mm, ss].some(Number.isNaN)) return null;
        return { hh, mm, ss };
    }

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
        const [h, m, s = "00"] = t.split(":");
        const hh = Number(h), mm = Number(m), ss = Number(s);
        if ([hh, mm, ss].some(Number.isNaN)) return null;
        return { hh, mm, ss };
    }

    return null;
}

function buildTargetMs(dateStr?: string | null, timeStr?: string | null): number | null {
    if (!dateStr) return null;

    const base = new Date(dateStr); // ไม่มี Z => parse เป็นเวลา local
    if (!Number.isFinite(base.getTime())) return null;

    const hms = parseTimeToHms(timeStr);
    if (!hms) return null;

    base.setHours(hms.hh, hms.mm, hms.ss, 0);
    return base.getTime();
}

function formatDayTime(ms: number) {
    const abs = Math.abs(ms);
    const totalSec = Math.floor(abs / 1000);

    const days = Math.floor(totalSec / 86400);
    const hh = Math.floor((totalSec % 86400) / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;

    const time = `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
    return days > 0 ? `${days} วัน ${time}` : time;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const SlaTimer: React.FC<SlaTimerProps> = ({
    slaStartDate,
    slaStartTime,
    slaFinishDate,
    slaFinishTime,
}) => {
    const startMs = useMemo(
        () => buildTargetMs(slaStartDate, slaStartTime),
        [slaStartDate, slaStartTime]
    );

    const finishMs = useMemo(
        () => buildTargetMs(slaFinishDate, slaFinishTime),
        [slaFinishDate, slaFinishTime]
    );

    const [nowMs, setNowMs] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    if (!startMs || !finishMs || !Number.isFinite(startMs) || !Number.isFinite(finishMs) || finishMs <= startMs) {
        return <Typography sx={{ color: "text.secondary" }}>SLA: -</Typography>;
    }

    const remainingMs = finishMs - nowMs; // ติดลบได้
    const totalMs = finishMs - startMs;

    const isOverdue = remainingMs < 0;

    // % ที่เหลือ (ตาม timeline start->finish)
    // - ถ้ายังไม่ถึงเวลาเริ่ม: ให้ 100%
    // - ถ้าอยู่ในช่วง: remaining/total
    // - ถ้าเลยแล้ว: จะติดลบ แต่เราจะ clamp เป็น 0 เพื่อเอาไปเทียบสี/แสดงผล
    const rawPercent =
        nowMs <= startMs ? 100 : (remainingMs / totalMs) * 100;

    const percent = clamp(rawPercent, 0, 100);

    // สีตามกติกา
    let tone: "green" | "yellow" | "red";
    if (isOverdue) tone = "red";
    else if (percent >= 31) tone = "green";
    else tone = "yellow";

    const palette =
        tone === "green"
            ? { bg: "#e8f5e9", fg: "#2e7d32" }
            : tone === "yellow"
                ? { bg: "#fff8e1", fg: "#f9a825" }
                : { bg: "#ffebee", fg: "#d32f2f" };

    const label = isOverdue
        ? `เลย SLA +${formatDayTime(remainingMs)}`
        : `เหลือ ${formatDayTime(remainingMs)}`;

    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: palette.bg,
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 700,
                    color: palette.fg,
                    opacity: 0.85,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                }}
            >
                SLA
            </Typography>

            <Typography
                sx={{
                    fontSize: { xs: 14, sm: 16 },
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1.2,
                    color: palette.fg,
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </Typography>

            <Typography
                variant="caption"
                sx={{
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 700,
                    color: palette.fg,
                    opacity: 0.9,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                }}
            >
                {isOverdue ? "0%" : `${Math.round(percent)}%`}
            </Typography>
        </Box>
    );
};
