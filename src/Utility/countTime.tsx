import { useEffect, useRef, useState } from "react";

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

export function CountTime({ running, intervalMs = 250 }: { running: boolean; intervalMs?: number }) {
    const startAtRef = useRef<number | null>(null);
    const accumulatedRef = useRef<number>(0);
    const [, setTick] = useState(0);

    useEffect(() => {
        let id: number | null = null;

        if (running) {
            if (startAtRef.current == null) startAtRef.current = Date.now();
            id = window.setInterval(() => setTick(Date.now()), intervalMs);
        } else {
            if (startAtRef.current != null) {
                accumulatedRef.current += Date.now() - startAtRef.current;
                startAtRef.current = null;
            }
        }

        return () => {
            if (id != null) window.clearInterval(id);
        };
    }, [running, intervalMs]);

    const elapsedMs =
        accumulatedRef.current +
        (startAtRef.current != null ? Date.now() - startAtRef.current : 0);

    return <>{formatElapsed(elapsedMs)}</>;
}
