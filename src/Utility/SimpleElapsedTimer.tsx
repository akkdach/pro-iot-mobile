"use client";
import { useEffect, useMemo, useState, useRef } from "react";
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

    // ลอง parse แบบ ISO ก่อน (replace space เป็น T, เติม Z ให้เป็น UTC)
    // ถ้า Backend ส่งมาเป็น Local Time จริงๆ อาจต้องลบ Z ออก แต่เคสนี้มีปัญหา +7 ชม. แสดงว่า Backend น่าจะเป็น UTC
    let safeS = s.replace(" ", "T");
    if (!safeS.endsWith("Z") && !safeS.includes("+")) {
        safeS += "Z";
    }
    const isoTry = new Date(safeS);
    if (!Number.isNaN(isoTry.getTime())) return isoTry.getTime();

    // Fallback regex parsing
    const m = s.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/
    );
    if (!m) return null;

    const [, Y, Mo, D, H, Mi, S2, frac = ""] = m;
    const ms = Number((frac + "000").slice(0, 3));

    // Use Date.UTC instead of new Date (Local)
    return Date.UTC(
        Number(Y),
        Number(Mo) - 1,
        Number(D),
        Number(H),
        Number(Mi),
        Number(S2),
        Number.isFinite(ms) ? ms : 0
    );


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
    const wasRunningRef = useRef(false);

    useEffect(() => {
        setFrozenMs(0);
        wasRunningRef.current = false;
    }, [startMs]);

    // วิ่งเวลา
    useEffect(() => {
        if (!running || startMs == null) return;
        const id = window.setInterval(() => setTick(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [running, startMs, intervalMs]);

    // จับเวลาตอนกด stop (เฉพาะ transition true -> false)
    useEffect(() => {
        if (running) {
            wasRunningRef.current = true;
            return;
        }

        if (!wasRunningRef.current) return; // ยังไม่เคย start มาก่อน ไม่ต้องจับ
        wasRunningRef.current = false;

        if (startMs == null) return;
        setFrozenMs(Math.max(0, Date.now() - startMs)); // ✅ stop - start
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