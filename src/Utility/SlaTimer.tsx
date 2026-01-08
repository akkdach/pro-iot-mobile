import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

type SlaTimerProps = {
    slaFinishDate?: string | null; // "2025-08-28T00:00:00"
    slaFinishTime?: string | null; // "080000" (HHmmss) หรือ "08:00:00"
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseTimeToHms(time?: string | null): { hh: number; mm: number; ss: number } | null {
    if (!time) return null;
    const t = time.trim();

    // "080000"
    if (/^\d{6}$/.test(t)) {
        const hh = Number(t.slice(0, 2));
        const mm = Number(t.slice(2, 4));
        const ss = Number(t.slice(4, 6));
        if ([hh, mm, ss].some(Number.isNaN)) return null;
        return { hh, mm, ss };
    }

    // "08:00:00" or "08:00"
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

    const base = new Date(dateStr); // parse เป็น local time (เพราะไม่มี Z)
    if (!Number.isFinite(base.getTime())) return null;

    const hms = parseTimeToHms(timeStr);
    if (!hms) return null;

    base.setHours(hms.hh, hms.mm, hms.ss, 0);
    return base.getTime();
}

/** คืนสตริง "X วัน HH:MM:SS" (รองรับทั้ง + และ -) */
function formatDayTimeSigned(ms: number) {
    const sign = ms < 0 ? "-" : "";
    const abs = Math.abs(ms);

    const totalSec = Math.floor(abs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hh = Math.floor((totalSec % 86400) / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;

    const time = `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
    const body = days > 0 ? `${days} วัน ${time}` : time;

    return { sign, body, days };
}

export const SlaTimer: React.FC<SlaTimerProps> = ({ slaFinishDate, slaFinishTime }) => {
    const targetMs = useMemo(() => buildTargetMs(slaFinishDate, slaFinishTime), [slaFinishDate, slaFinishTime]);

    const [diffMs, setDiffMs] = useState<number | null>(() => (targetMs ? targetMs - Date.now() : null));

    useEffect(() => {
        if (!targetMs) {
            setDiffMs(null);
            return;
        }

        const tick = () => setDiffMs(targetMs - Date.now());
        tick();

        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [targetMs]);

    if (!targetMs || diffMs === null) {
        return <Typography sx={{ color: "text.secondary" }}>SLA: -</Typography>;
    }

    // diffMs > 0 = ยังเหลือเวลา, diffMs < 0 = เลย SLA (ติดลบ)
    const isOverdue = diffMs < 0;
    const { body } = formatDayTimeSigned(diffMs);

    const label = isOverdue ? `เลย SLA +${body}` : `เหลือ ${body}`;

    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                bgcolor: isOverdue ? "#ffebee" : "#e3f2fd",
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 600,
                    color: isOverdue ? "#d32f2f" : "#1976d2",
                    opacity: 0.8,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                }}
            >
                SLA
            </Typography>
            <Typography
                sx={{
                    fontSize: { xs: 14, sm: 16 },
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1.2,
                    color: isOverdue ? "#d32f2f" : "#1976d2",
                    whiteSpace: "nowrap",
                }}
            >
                {body}
            </Typography>
            {isOverdue && (
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: { xs: 10, sm: 11 },
                        fontWeight: 500,
                        color: "#d32f2f",
                        opacity: 0.7,
                    }}
                >
                    เกิน
                </Typography>
            )}
        </Box>
    );
};
