import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import StationChecklist from "./StationChecklist";

/**
 * หน้า Embed สำหรับใช้กับ iframe จาก project อื่น
 *
 * Query Params:
 *   - station  : รหัสสถานี เช่น "0010"
 *   - orderId  : Work Order ID (optional)
 *   - token    : JWT token สำหรับ auth (required)
 *
 * ตัวอย่าง URL:
 *   /checklist/embed?station=0010&orderId=WO-2024-001&token=eyJhbG...
 */
export default function ChecklistEmbed() {
    const [searchParams] = useSearchParams();
    const station = searchParams.get("station");
    const orderId = searchParams.get("orderId") ?? undefined;
    const token = searchParams.get("token");

    const [ready, setReady] = useState(false);

    // ── ฉีด token เข้า localStorage เพื่อให้ API interceptors ใช้งานได้ ──
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        }
        setReady(true);
    }, [token]);

    // ── Loading ขณะ inject token ──
    if (!ready) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    // ── ไม่ได้ส่ง token ──
    if (!token) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="error" fontWeight={700}>
                    ❌ กรุณาระบุ token ใน query parameter
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, fontSize: "0.85rem" }}>
                    ตัวอย่าง: /checklist/embed?station=0010&orderId=WO-001&<b>token=eyJhbG...</b>
                </Typography>
            </Box>
        );
    }

    // ── ไม่ได้ส่ง station ──
    if (!station) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="error" fontWeight={700}>
                    ❌ กรุณาระบุ station ใน query parameter
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, fontSize: "0.85rem" }}>
                    ตัวอย่าง: /checklist/embed?<b>station=0010</b>&orderId=WO-001&token=...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#FFFFFF",
                p: 2,
            }}
        >
            <StationChecklist
                stationCode={station}
                orderId={orderId}
            />
        </Box>
    );
}
