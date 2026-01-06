"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

type TimerCtx = {
    startAtMs: number | null;           // เวลาเริ่มรอบปัจจุบัน
    accumulatedMs: number;              // เวลาสะสม (ค้างตอน stop)
    running: boolean;                   // กำลังนับอยู่ไหม
    elapsedMs: number;                  // เวลารวมที่ผ่านไป

    start: (startAt?: number | Date | string) => void; // start/resume
    stop: () => void;                                  // pause (ค้างเวลา)
    reset: () => void;                                 // รีเซ็ตเป็น 0
};

const Ctx = createContext<TimerCtx | null>(null);

const parseStartAt = (v: number | Date | string | undefined): number | null => {
    if (v == null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (v instanceof Date) return Number.isFinite(v.getTime()) ? v.getTime() : null;

    // รองรับ "2026-01-06 06:17:18.7152301"
    const s = v.trim();
    const m = s.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/
    );
    if (!m) return null;

    const [, Y, Mo, D, H, Mi, S, frac = ""] = m;
    const ms = Number((frac + "000").slice(0, 3));
    const dt = new Date(
        Number(Y),
        Number(Mo) - 1,
        Number(D),
        Number(H),
        Number(Mi),
        Number(S),
        Number.isFinite(ms) ? ms : 0
    );

    const t = dt.getTime();
    return Number.isFinite(t) ? t : null;
};

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const [startAtMs, setStartAtMs] = useState<number | null>(null);
    const [running, setRunning] = useState(false);
    const [accumulatedMs, setAccumulatedMs] = useState(0);

    const value = useMemo<TimerCtx>(() => {
        const elapsedMs =
            accumulatedMs + (running && startAtMs != null ? Date.now() - startAtMs : 0);

        return {
            startAtMs,
            accumulatedMs,
            running,
            elapsedMs,

            // ✅ start/resume
            start: (v) => {
                // ถ้ากำลังนับอยู่แล้ว ไม่ต้อง start ซ้ำ
                if (running) return;

                const parsed = parseStartAt(v);
                setStartAtMs(parsed ?? Date.now());
                setRunning(true);
            },

            // ✅ stop แล้วค้างเวลาไว้
            stop: () => {
                if (!running || startAtMs == null) return;

                setAccumulatedMs((prev) => prev + (Date.now() - startAtMs));
                setStartAtMs(null);
                setRunning(false);
            },

            // ✅ reset กลับ 0
            reset: () => {
                setStartAtMs(null);
                setAccumulatedMs(0);
                setRunning(false);
            },
        };
    }, [startAtMs, running, accumulatedMs]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTimer() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useTimer must be used within TimerProvider");
    return ctx;
}
