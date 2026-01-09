// WorkerRows.tsx
import React, { useMemo } from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Avatar,
    Chip,
    Divider,
} from "@mui/material";

export type WorkerApiItem = {
    orderid: string;
    current_operation: string;
    personneL_NUMBER: string; // ตาม response จริง
    name: string;
};

type NormalizedWorker = {
    orderid: string;
    current_operation: string;
    personnelNumber: string;
    name: string;
};

type Props = {
    dataResult: WorkerApiItem[];
    dedupe?: boolean; // default true
    onRowClick?: (row: NormalizedWorker) => void; // optional
};

const getInitial = (name?: string) => {
    const t = (name ?? "").trim();
    return t ? t[0] : "?";
};

export default function WorkerRows({ dataResult, dedupe = false, onRowClick }: Props) {
    const rows = useMemo<NormalizedWorker[]>(() => {
        if (!Array.isArray(dataResult)) return [];

        const normalized: NormalizedWorker[] = dataResult.map((x) => ({
            orderid: String(x.orderid ?? ""),
            current_operation: String(x.current_operation ?? ""),
            personnelNumber: String((x as any).personneL_NUMBER ?? ""), // normalize
            name: String(x.name ?? ""),
        }));

        if (!dedupe) return normalized;

        const map = new Map<string, NormalizedWorker>();
        for (const r of normalized) {
            const key = `${r.orderid}|${r.current_operation}|${r.personnelNumber}`;
            if (!map.has(key)) map.set(key, r);
        }
        return Array.from(map.values());
    }, [dataResult, dedupe]);

    if (rows.length === 0) {
        return (
            <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography sx={{ color: "text.secondary" }}>ไม่มีข้อมูลพนักงาน</Typography>
            </Box>
        );
    }

    return (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            {rows.map((r, idx) => {
                const clickable = Boolean(onRowClick);
                return (
                    <React.Fragment key={`${r.orderid}-${r.current_operation}-${r.personnelNumber}-${idx}`}>
                        <Box
                            onClick={() => onRowClick?.(r)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: 2,
                                py: 1.5,
                                cursor: clickable ? "pointer" : "default",
                                "&:hover": clickable ? { bgcolor: "action.hover" } : undefined,
                            }}
                        >
                            <Avatar sx={{ width: 36, height: 36 }}>{getInitial(r.name)}</Avatar>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography sx={{ fontWeight: 800 }} noWrap>
                                    {r.name || "-"}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                                    รหัสพนักงาน: {r.personnelNumber || "-"}
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ justifyContent: "flex-end" }}>
                                <Chip size="small" label={`ORDER: ${r.orderid || "-"}`} />
                                <Chip size="small" label={`OP: ${r.current_operation || "-"}`} />
                            </Stack>
                        </Box>

                        {idx !== rows.length - 1 && <Divider />}
                    </React.Fragment>
                );
            })}
        </Paper>
    );
}
