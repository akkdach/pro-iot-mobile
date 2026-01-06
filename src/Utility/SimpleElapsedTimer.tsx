"use client";
import { useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";

type StartAt = Date | string | number | null | undefined;

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

// รองรับ "2026-01-06 06:17:18.7152301"
const parseToMs = (v: StartAt): number | null => {
    if (v == null) return null;

    if (typeof v === "number") return Number.isFinite(v) ? v : null;

    if (v instanceof Date) {
        const t = v.getTime();
        return Number.isFinite(t) ? t : null;
    }

    const s = v.trim();

    // ลอง parse แบบ ISO ก่อน (replace space เป็น T)
    const isoTry = new Date(s.replace(" ", "T"));
    if (!Number.isNaN(isoTry.getTime())) return isoTry.getTime();

    const m = s.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/
    );
    if (!m) return null;

    const [, Y, Mo, D, H, Mi, S2, frac = ""] = m;
    const ms = Number((frac + "000").slice(0, 3));

    const dt = new Date(
        Number(Y),
        Number(Mo) - 1,
        Number(D),
        Number(H),
        Number(Mi),
        Number(S2),
        Number.isFinite(ms) ? ms : 0
    );

    const t = dt.getTime();
    return Number.isFinite(t) ? t : null;
};

type Props = {
    startAt: StartAt;       // เวลาเริ่ม
    running: boolean;       // ✅ true=วิ่ง, false=ค้าง
    intervalMs?: number;    // ความถี่อัปเดต
};

export default function SimpleElapsedTimer({ startAt, running, intervalMs = 250 }: Props) {
    const startMs = useMemo(() => parseToMs(startAt), [startAt]);

    const [frozenMs, setFrozenMs] = useState(0);
    const [, setTick] = useState(0);

    // เมื่อ startAt เปลี่ยน (เริ่มงานใหม่) ให้รีเซ็ตค่าค้าง
    useEffect(() => {
        setFrozenMs(0);
    }, [startMs]);

    // ถ้า running=true ให้ tick เพื่อให้เวลา “วิ่ง”
    useEffect(() => {
        if (!running || startMs == null) return;
        const id = window.setInterval(() => setTick(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [running, startMs, intervalMs]);

    // ตอนเปลี่ยนจาก running=true -> false ให้ “จับค่า” แล้วค้างไว้
    useEffect(() => {
        if (running) return;
        if (startMs == null) {
            setFrozenMs(0);
            return;
        }
        setFrozenMs(Math.max(0, Date.now() - startMs));
    }, [running, startMs]);

    const elapsedMs =
        startMs == null
            ? 0
            : running
                ? Math.max(0, Date.now() - startMs)
                : frozenMs;

    return (
        <Typography
            sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: { xs: "24px", sm: "32px", md: "40px" },
                lineHeight: 1.1,
            }}
        >
            {formatElapsed(elapsedMs)}
        </Typography>
    );
}
