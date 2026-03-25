"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

const pad2 = (n: number) => String(n).padStart(2, "0");

type StartAt = Date | string | number | null | undefined;

const parseToMs = (v: StartAt): number | null => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isFinite(t) ? t : null;
  }
  const s = v.trim();
  const safeS = s.replace(" ", "T");
  const isoTry = new Date(safeS);
  if (!Number.isNaN(isoTry.getTime())) return isoTry.getTime();
  return null;
};

type Props = {
  startAt: StartAt;
  durationMinutes: number | null | undefined;
  running: boolean;
  intervalMs?: number;
};

/**
 * Compact inline countdown — designed to sit next to SimpleElapsedTimer.
 * Shows remaining time, a thin progress bar, and color-coded status.
 */
export default function StandardTimeCountdown({
  startAt,
  durationMinutes,
  running,
  intervalMs = 500,
}: Props) {
  const startMs = useMemo(() => parseToMs(startAt), [startAt]);
  const durationMs = useMemo(
    () =>
      durationMinutes != null && Number.isFinite(durationMinutes) && durationMinutes > 0
        ? durationMinutes * 60 * 1000
        : null,
    [durationMinutes]
  );

  const [, setTick] = useState(0);

  useEffect(() => {
    if (!running || startMs == null || durationMs == null) return;
    const id = window.setInterval(() => setTick(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [running, startMs, durationMs, intervalMs]);

  if (durationMs == null) return null;

  const elapsedMs =
    startMs == null ? 0 : running ? Math.max(0, Date.now() - startMs) : 0;
  const remainingMs = durationMs - elapsedMs;
  const isOverdue = remainingMs < 0;

  const absMs = Math.abs(remainingMs);
  const totalSec = Math.floor(absMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const timeStr = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;

  const percent = Math.max(0, Math.min(100, (Math.max(0, remainingMs) / durationMs) * 100));

  let tone: "green" | "orange" | "red";
  if (isOverdue) tone = "red";
  else if (percent >= 50) tone = "green";
  else if (percent >= 20) tone = "orange";
  else tone = "red";

  const palette = {
    green: { fg: "#16a34a", bar: "#22c55e" },
    orange: { fg: "#ea580c", bar: "#f97316" },
    red: { fg: "#dc2626", bar: "#ef4444" },
  }[tone];

  const stdMin = durationMinutes ?? 0;
  const stdH = Math.floor(stdMin / 60);
  const stdM = Math.round(stdMin % 60);
  const stdLabel = stdH > 0 ? `${stdH}h ${pad2(stdM)}m` : `${stdM}m`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
      {/* Countdown value */}
      <Typography
        sx={{
          fontFamily: "'Roboto Mono', monospace",
          fontWeight: 800,
          fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
          color: palette.fg,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        {isOverdue ? `+${timeStr}` : timeStr}
      </Typography>

      {/* Progress bar */}
      <Box
        sx={{
          mt: 0.75,
          width: "100%",
          height: 5,
          borderRadius: 3,
          bgcolor: `${palette.fg}18`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${percent}%`,
            borderRadius: 3,
            bgcolor: palette.bar,
            transition: "width 1s linear",
          }}
        />
      </Box>

      {/* Status label */}
      <Typography
        variant="caption"
        sx={{
          mt: 0.25,
          fontWeight: 600,
          fontSize: 10,
          color: palette.fg,
          opacity: 0.85,
          whiteSpace: "nowrap",
        }}
      >
        {isOverdue ? "OVERDUE" : `${Math.round(percent)}%`} · STD {stdLabel}
      </Typography>
    </Box>
  );
}
