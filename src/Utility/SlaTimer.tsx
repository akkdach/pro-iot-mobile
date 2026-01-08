import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

type SlaTimerProps = {
    slaFinishDate?: string | null; // "2025-08-28T00:00:00"
    slaFinishTime?: string | null; // "080000" (HHmmss) หรือ "08:00:00"
    onExpire?: () => void;         // optional: เรียกครั้งเดียวเมื่อหมดเวลา
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseTimeToHms(time?: string | null): { hh: number; mm: number; ss: number } | null {
    if (!time) return null;

    // รองรับทั้ง "080000" และ "08:00:00"
    const t = time.trim();
    if (/^\d{6}$/.test(t)) {
        const hh = Number(t.slice(0, 2));
        const mm = Number(t.slice(2, 4));
        const ss = Number(t.slice(4, 6));
        if ([hh, mm, ss].some((x) => Number.isNaN(x))) return null;
        return { hh, mm, ss };
    }

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
        const [h, m, s = "00"] = t.split(":");
        const hh = Number(h), mm = Number(m), ss = Number(s);
        if ([hh, mm, ss].some((x) => Number.isNaN(x))) return null;
        return { hh, mm, ss };
    }

    return null;
}

function buildTargetMs(dateStr?: string | null, timeStr?: string | null): number | null {
    if (!dateStr) return null;
    const base = new Date(dateStr); // "YYYY-MM-DDTHH:mm:ss" (ไม่มี Z) จะถูก parse เป็นเวลา local
    if (!Number.isFinite(base.getTime())) return null;

    const hms = parseTimeToHms(timeStr);
    if (!hms) return null;

    base.setHours(hms.hh, hms.mm, hms.ss, 0);
    return base.getTime();
}

function formatCountdown(ms: number): string {
    const abs = Math.abs(ms);
    const totalSec = Math.floor(abs / 1000);
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;
    return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

export const SlaTimer: React.FC<SlaTimerProps> = ({ slaFinishDate, slaFinishTime, onExpire }) => {
    const targetMs = useMemo(() => buildTargetMs(slaFinishDate, slaFinishTime), [slaFinishDate, slaFinishTime]);

    const [remainMs, setRemainMs] = useState<number | null>(() => (targetMs ? targetMs - Date.now() : null));
    const expiredCalledRef = useRef(false);

    useEffect(() => {
        expiredCalledRef.current = false;

        if (!targetMs) {
            setRemainMs(null);
            return;
        }

        const tick = () => {
            const diff = targetMs - Date.now();
            setRemainMs(diff);

            if (diff <= 0 && !expiredCalledRef.current) {
                expiredCalledRef.current = true;
                onExpire?.();
            }
        };

        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [targetMs, onExpire]);

    if (!targetMs || remainMs === null) {
        return (
            <Typography sx={{ color: "text.secondary" }}>
                SLA: -
            </Typography>
        );
    }

    const isOverdue = remainMs < 0;
    const text = isOverdue ? `เลย SLA +${formatCountdown(remainMs)}` : `เหลือ ${formatCountdown(remainMs)}`;

    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: isOverdue ? "rgba(211,47,47,0.35)" : "rgba(25,118,210,0.25)",
                bgcolor: isOverdue ? "rgba(211,47,47,0.08)" : "rgba(25,118,210,0.08)",
            }}
        >
            <Typography
                sx={{
                    fontSize: { xs: 22, sm: 28, md: 32 },
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    color: isOverdue ? "error.main" : "primary.main",
                }}
            >
                {text}
            </Typography>
        </Box>
    );
};
