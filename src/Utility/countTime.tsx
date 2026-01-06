"use client";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { useTimer } from "../Context/TimerContext";

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

export default function CountTime({ intervalMs = 250 }: { intervalMs?: number }) {
    const { startAtMs, accumulatedMs, running } = useTimer();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!running) return;

        // Update 'now' immediately to prevent stale display
        setNow(Date.now());

        const id = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [running, intervalMs]);

    // คำนวณเวลาสดๆ ที่หน้า Component นี้
    const elapsedMs = accumulatedMs + (running && startAtMs != null ? now - startAtMs : 0);

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
