import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QRCodeLib from "qrcode";
import { QrPdfDocument, PdfItem } from "./QrPdf";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Divider,
    Chip,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import AppHeader from "../../Component/AppHeader";
import callApi from "../../Services/callApi";
import { callApiOneleke } from "../../Services/callApiOneleke";
import ClearIcon from "@mui/icons-material/Clear";

type QrItem = {
    id: string;
    title: string;
    subtitle?: string; // Description
    tradeName?: string; // BPC Trade Name
    objectID?: string; // Service Object ID
    payload: string; // QR Value
    createdAt: string;
};

type LayoutPreset = "2x3" | "3x4" | "4x6";

const PRINT_AREA_ID = "qr-print-area";

const toQrValue = (payload: any) => JSON.stringify(payload);




const buildMock = (): QrItem[] => {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString();

    const base = [
        { orderId: "000049030218", activity: "0010", station: "CUT" },
        { orderId: "000049030218", activity: "0020", station: "WELD" },
        { orderId: "000049030218", activity: "0030", station: "PAINT" },
        { orderId: "000049030218", activity: "0040", station: "QC" },
        { orderId: "000049029334", activity: "0010", station: "CUT" },
        { orderId: "000049029334", activity: "0070", station: "ASSEMBLY" },
        { orderId: "000049029334", activity: "0080", station: "FINAL" },
        { orderId: "000049029260", activity: "0049", station: "REWORK" },
        { orderId: "000049029260", activity: "0079", station: "REPAIR" },
        { orderId: "000049029260", activity: "0080", station: "FINAL" },
        { orderId: "000049029999", activity: "0010", station: "CUT" },
        { orderId: "000049029999", activity: "0020", station: "WELD" },
    ];

    return base.map((x, i) => ({
        id: `${x.orderId}-${x.activity}-${i}`,
        title: `WO: ${x.orderId}`,
        subtitle: `OP: ${x.activity} • ${x.station}`,
        payload: x.orderId,
        createdAt: fmt(now),
    }));
};

const presetToCols = (preset: LayoutPreset) => {
    if (preset === "2x3") return 2;
    if (preset === "3x4") return 3;
    return 4;
};

export default function PrintQRCodes() {
    // 1. State Declarations
    // 1. State Declarations
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [allItems, setAllItems] = useState<QrItem[]>([]); // Store ALL fetched items
    const [displayLimit, setDisplayLimit] = useState(30);   // How many to render

    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const [query, setQuery] = useState("");
    const [preset, setPreset] = useState<LayoutPreset>("3x4");
    const [qrSize, setQrSize] = useState(92);
    const [showPayloadHint, setShowPayloadHint] = useState(false);

    const [pdfItems, setPdfItems] = useState<PdfItem[]>([]);
    const [isPdfReady, setIsPdfReady] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // 2. Helper Functions
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Load ALL data at once
            const res = await callApiOneleke("GET", "qrcode", {
                params: { page: 0, limit: 100000 }
            });

            const list = res.data?.data || [];

            const newItems: QrItem[] = list.map((item: any) => ({
                id: item.serviceorderid,
                title: item.serviceorderid,
                subtitle: item.description,
                tradeName: item.bpc_tradename,
                objectID: item.serviceobjectid,
                payload: item.serviceobjectid,
                createdAt: new Date().toISOString()
            }));

            setAllItems(newItems);
        } catch (err) {
            console.error(err);
            setError("Failed to load data from API");
        } finally {
            setLoading(false);
        }
    };

    // 3. Effects
    // Initial Load
    useEffect(() => {
        fetchAllData();
    }, []);

    // Reset display limit when query changes (to show top results of new search)
    useEffect(() => {
        setDisplayLimit(30);
    }, [query]);

    const handleGeneratePdf = async () => {
        try {
            setGeneratingPdf(true);
            setIsPdfReady(false);

            const newItems = await Promise.all(
                selectedItems.map(async (item) => {
                    const payloadStr = toQrValue(item.payload);
                    const dataUrl = await QRCodeLib.toDataURL(payloadStr, {
                        width: 200, // Sufficient res for small label
                        margin: 1
                    });

                    return {
                        id: item.id,
                        title: item.title,
                        subtitle: item.subtitle,
                        tradeName: item.tradeName,
                        qrDataUrl: dataUrl
                    };
                })
            );

            setPdfItems(newItems);
            setIsPdfReady(true);
        } catch (err) {
            console.error(err);
        } finally {
            setGeneratingPdf(false);
        }
    };

    // Filter Logic (Client Side)
    const filteredFull = useMemo(() => {
        const rawQ = query.toLowerCase();
        if (!rawQ.trim()) return allItems;

        const searchTerms = rawQ.split('|').map(s => s.trim()).filter(s => s.length > 0);
        if (searchTerms.length === 0) return allItems;

        return allItems.filter((x) => {
            const hay = `${x.id} ${x.title} ${x.subtitle ?? ""} ${toQrValue(x.payload)}`.toLowerCase();
            return searchTerms.some(term => hay.includes(term));
        });
    }, [allItems, query]);

    // Slice for Rendering
    const filtered = useMemo(() => {
        return filteredFull.slice(0, displayLimit);
    }, [filteredFull, displayLimit]);

    // Use 'allItems' for selection logic if needed, but usually we select from what we see or search
    // But 'selectedItems' should probably come from allItems to ensure we don't lose selection if we filter?
    // Actually, 'selected' is an ID map, so let's Map back to objects from allItems
    const selectedItems = useMemo(() => allItems.filter((x) => selected[x.id]), [allItems, selected]);

    const allChecked = useMemo(() => filteredFull.length > 0 && filteredFull.every((x) => selected[x.id]), [filteredFull, selected]);
    const someChecked = useMemo(() => {
        if (filteredFull.length === 0) return false;
        const any = filteredFull.some((x) => selected[x.id]);
        return any && !allChecked;
    }, [filteredFull, selected, allChecked]);

    const cols = presetToCols(preset);

    const toggleAllFiltered = () => {
        const next = { ...selected };
        // Toggle all visible (or all matching search)
        // Usually "Select All" means select all matching current filter
        const nextVal = !allChecked;
        filteredFull.forEach((x) => (next[x.id] = nextVal));
        setSelected(next);
    };

    const toggleOne = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

    const handlePrint = () => window.print();

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        // Check if near bottom
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            // If we have more items to show than currently displayed
            if (displayLimit < filteredFull.length) {
                setDisplayLimit(prev => prev + 30);
            }
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <style>
                {`
          @media print {
            /* 1. Hide everything and collapse space */
            body * {
                visibility: hidden;
                height: 0; /* Collapse space of hidden items */
                overflow: hidden; /* Hide content */
            }
            
            /* 2. Show the print area and restore layout */
            #${PRINT_AREA_ID}, #${PRINT_AREA_ID} * {
                visibility: visible;
                height: auto; /* Restore height */
                overflow: visible; /* Restore overflow */
            }
            
            /* 3. Position print area absolutely */
            #${PRINT_AREA_ID} {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important; 
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                z-index: 9999;
            }

            /* 4. Ensure grid/cards behave for print */
            .print-grid { 
                display: block !important;
                gap: 0 !important;
            }

            .print-card { 
                /* Content IS the page size */
                width: 7.4cm !important;
                height: 2.8cm !important;
                
                /* Reset positioning to fill the @page */
                margin: 0 !important;
                position: relative !important;
                top: 0 !important;
                transform: none !important;
                
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important; 
                justify-content: center !important; 
                gap: 2mm !important; 
                
                border: 1px solid #000 !important;
                padding: 1mm !important;
                box-sizing: border-box;
                
                overflow: hidden;
                
                break-inside: avoid;
                page-break-inside: avoid;
                break-after: always;
                page-break-after: always;
            }

            /* Force Browser Print Size */
            @page {
                size: 7.4cm 2.8cm;
                margin: 0mm;
            }

            /* Remove pseudo element */
            .print-card::after {
                content: none !important;
                display: none !important;
            }
        `}
            </style>

            <Box className="no-print">
                <AppHeader title="พิมพ์ QR Code" />
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 7, mb: 5 }} spacing={2} alignItems="stretch">
                <Card className="no-print" sx={{ flex: "0 0 420px" }}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight={700}>พิมพ์ QR Code</Typography>

                            {loading && allItems.length === 0 && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size={18} />
                                    <Typography variant="body2">กำลังโหลดข้อมูล...</Typography>
                                </Stack>
                            )}
                            {error && <Alert severity="error">{error}</Alert>}

                            <TextField
                                label="ค้นหา (ใช้ | คั่นเพื่อค้นหาหลายคำ)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                size="small"
                                InputProps={{
                                    endAdornment: query && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setQuery("")}>
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Stack direction="row" spacing={2}>
                                {/* Hidden in print logic now, but useful for preview */}



                            </Stack>

                            <Divider />



                            {/* <FormControlLabel
                                control={<Checkbox checked={showPayloadHint} onChange={(e) => setShowPayloadHint(e.target.checked)} />}
                                label="แสดงตัวอย่าง payload ใต้ QR (preview)"
                            /> */}

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    onClick={handlePrint}
                                    disabled={selectedItems.length === 0 || loading}
                                    fullWidth
                                    startIcon={<LocalPrintshopIcon />}
                                >
                                    สั่งพิมพ์ (Browser Print)
                                </Button>

                                {/* {!isPdfReady ? (
                                    <Button
                                        variant="outlined"
                                        onClick={handleGeneratePdf}
                                        disabled={selectedItems.length === 0 || loading || generatingPdf}
                                        fullWidth
                                    >
                                        {generatingPdf ? "กำลังสร้าง PDF..." : "Export PDF (7.4x2.8cm / Batch)"}
                                    </Button>
                                ) : (
                                    <PDFDownloadLink
                                        document={
                                            <QrPdfDocument
                                                items={pdfItems}
                                                showPayload={showPayloadHint}
                                            />
                                        }
                                        fileName="qrcode-labels.pdf"
                                        style={{ textDecoration: 'none', width: '100%' }}
                                    >
                                        {({ loading: pdfLoading }) => (
                                            <Button variant="contained" color="success" fullWidth disabled={pdfLoading}>
                                                {pdfLoading ? "Loading..." : "Download PDF"}
                                            </Button>
                                        )}
                                    </PDFDownloadLink>
                                )} */}

                            </Stack>


                        </Stack>
                    </CardContent>
                </Card>

                <Box sx={{ flex: 1, minWidth: 320 }}>
                    <Card className="no-print" sx={{ mb: 2 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700}>รายการ</Typography>
                                <Chip label={`ทั้งหมด ${allItems.length} (โหลดแล้ว) • เลือก ${selectedItems.length}`} size="small" />
                            </Stack>

                            <Stack
                                spacing={1}
                                sx={{ maxHeight: 320, overflow: "auto", pr: 1 }}
                                onScroll={handleScroll}
                            >
                                {filtered.map((x) => (
                                    <Box
                                        key={x.id}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            p: 1,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <Checkbox checked={!!selected[x.id]} onChange={() => toggleOne(x.id)} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={700}>
                                                {x.objectID}{" "}
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    ({x.id})
                                                </Typography>
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">{x.subtitle}</Typography>
                                        </Box>

                                        <Box sx={{ width: 54, height: 54, display: "grid", placeItems: "center" }}>
                                            <QRCodeSVG value={toQrValue(x.payload)} size={48} />
                                        </Box>
                                    </Box>
                                ))}
                                {loading && (
                                    <Stack alignItems="center" sx={{ py: 2 }}>
                                        <CircularProgress size={24} />
                                    </Stack>
                                )}
                                {!loading && filtered.length === 0 && <Alert severity="info">ไม่พบรายการตามคำค้น</Alert>}
                            </Stack>
                        </CardContent>
                    </Card>



                    <Box
                        id={PRINT_AREA_ID}
                        sx={{
                            borderRadius: 2,
                            border: "1px dashed",
                            borderColor: "divider",
                            p: 2,
                        }}
                    >
                        <Box
                            className="print-grid"
                            sx={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                                gap: 2,
                            }}
                        >
                            {selectedItems.map((x) => (
                                <Box
                                    key={x.id}
                                    className="print-card"
                                    sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 2,
                                        p: 1.25,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    {/* For screen preview: stack vertical. For Print: Row (via CSS) */}
                                    <Box className="qr-container" sx={{ display: 'grid', placeItems: 'center', mr: { print: 1, xs: 0 } }}>
                                        <QRCodeSVG value={x.payload} size={54} />
                                    </Box>

                                    <Box sx={{
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        pl: 1.5, /* Give it some space from QR */
                                        pr: 0.5
                                    }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={800}
                                            sx={{
                                                lineHeight: 1,
                                                fontSize: { print: '12px', xs: '14px' },
                                                m: 0,
                                                mb: { print: 0.5 }
                                            }}
                                        >
                                            {x.objectID}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight={800}
                                            sx={{
                                                lineHeight: 1.1,
                                                fontSize: { print: '10px', xs: '12px' }, // Reduce font slightly for description
                                                m: 0,
                                                mb: { print: 0.5 },
                                                py: { print: 0 } // Reset py
                                            }}
                                        >
                                            THAIMAPTHIP
                                        </Typography>

                                        {x.tradeName && (
                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                sx={{
                                                    color: "#000",
                                                    lineHeight: 1,
                                                    fontSize: { print: '9px', xs: '11px' },
                                                    m: 0
                                                }}
                                            >
                                                {x.tradeName}
                                            </Typography>
                                        )}

                                        {x.subtitle && (
                                            <Typography
                                                variant="caption"
                                                fontWeight={700}
                                                sx={{
                                                    color: "#000",
                                                    lineHeight: 1,
                                                    fontSize: { print: '9px', xs: '8px' },
                                                    m: 0
                                                }}
                                            >
                                                {x.subtitle}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))}

                            {!loading && selectedItems.length === 0 && (
                                <Alert severity="warning" sx={{ gridColumn: `1 / span ${cols}` }}>
                                    ยังไม่ได้เลือกรายการสำหรับพิมพ์
                                </Alert>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
}
