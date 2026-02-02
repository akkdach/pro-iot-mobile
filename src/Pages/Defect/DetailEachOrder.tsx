import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Divider,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from "@mui/material";
import AppHeader from "../../Component/AppHeader";
import { useParams, useNavigate } from "react-router-dom";
import callApi from "../../Services/callApi";
import { SlaTimer } from "../../Utility/SlaTimer";
import { formatDate } from "../../Utility/DatetimeService";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import InventoryIcon from "@mui/icons-material/Inventory";
import ImageIcon from "@mui/icons-material/Image";
import PersonIcon from "@mui/icons-material/Person";
import { replaceImageBaseUrl } from "../../Services/imageUrl";

export default function DetailEachOrder() {
    const { orderId, operationId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [work, setWork] = useState<any>(null);
    const [components, setComponents] = useState<any[]>([]);
    const [images, setImages] = useState<any[]>([]);

    useEffect(() => {
        if (orderId && operationId) {
            loadData();
        }
    }, [orderId, operationId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Order Detail
            const resOrder = await callApi.get(
                `/WorkOrderList/workOrder/${orderId}/${operationId}`
            );
            const orderData = Array.isArray(resOrder.data?.dataResult)
                ? resOrder.data.dataResult[0]
                : resOrder.data?.dataResult;
            setWork(orderData);

            // 2. Components / Spare Parts
            const resComps = await callApi.get(
                `/WorkOrderList/items_component/${orderId}`
            );
            setComponents(resComps.data?.dataResult || []);

            // 3. Images (Master + Current)
            const [resMaster, resBox] = await Promise.all([
                callApi.get(`/Mobile/GetMasterWorkorderImage?order_id=${orderId}`),
                callApi.get(`/WorkOrderList/ImgBox/${orderId}`),
            ]);

            const masterData = resMaster.data.dataResult || [];
            const boxData = resBox.data.dataResult || {};

            // Merge Logic (Similar to WorkStation)
            if (masterData.length > 0) {
                const boxDataLower: any = {};
                Object.keys(boxData).forEach((k) => {
                    if (k) boxDataLower[k.toLowerCase()] = boxData[k];
                });

                const merged = masterData.map((img: any) => {
                    let targetKey = img.key?.toLowerCase();
                    // specific fix
                    if (targetKey === 'image_pull_condensor_evap') {
                        targetKey = 'image_speed_condensor_evap';
                    }
                    const serverUrl = boxDataLower[targetKey];
                    if (serverUrl) {
                        return { ...img, imageUrl: replaceImageBaseUrl(serverUrl) };
                    }
                    return img;
                });
                setImages(merged);
            } else {
                // fallback if no master, just show whatever is in boxData if needed, 
                // but usually master drives the display. 
                // For now let's just use master logic as primary.
                setImages([]);
            }

        } catch (error) {
            console.error("Error loading detail:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!work) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6">ไม่พบข้อมูล Order</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 8 }}>
            <AppHeader title={`Order: ${work.orderid}`} icon={<AssignmentIcon />} />

            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto", mt: 8 }}>

                {/* Helper Header Info */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        รายละเอียดงาน
                    </Typography>
                    <Chip label={work.weB_STATUS ?? "Status"} color="primary" variant="outlined" />
                </Stack>

                <Grid container spacing={3}>
                    {/* Main Info Card */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
                                    <Box sx={{ p: 1.5, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2 }}>
                                        <BusinessCenterIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Order Information</Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Order ID</Typography>
                                        <Typography variant="body1" fontWeight={600}>{work.orderid}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Order Type</Typography>
                                        <Typography variant="body1" fontWeight={600}>{work.ordeR_TYPE || "-"}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Description</Typography>
                                        <Typography variant="body1" fontWeight={600}>{work.shorT_TEXT || "-"}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Equipment</Typography>
                                        <Typography variant="body1" fontWeight={600}>{work.equipment || "-"}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Station</Typography>
                                        <Typography variant="body1" fontWeight={600}>{work.current_operation || "-"}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* SLA & Time Card */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
                                    <Box sx={{ p: 1.5, bgcolor: 'warning.light', color: 'warning.dark', borderRadius: 2 }}>
                                        <PersonIcon />
                                        {/* Note: Icon choice just generic */}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Timeline & SLA</Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>SLA Timer</Typography>
                                    <SlaTimer
                                        slaFinishDate={work.slA_FINISH_DATE ?? work.SLA_FINISH_DATE}
                                        slaFinishTime={work.slA_FINISH_TIME ?? work.SLA_FINISH_TIME}
                                        slaStartDate={work.slA_START_DATE ?? work.SLA_START_DATE}
                                        slaStartTime={work.slA_START_TIME ?? work.SLA_START_TIME}
                                    />
                                </Box>

                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Planned Start</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatDate(work.slA_START_DATE) || "-"} {work.slA_START_TIME ? String(work.slA_START_TIME).substring(0, 5) : ""}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Planned Finish</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatDate(work.slA_FINISH_DATE) || "-"} {work.slA_FINISH_TIME ? String(work.slA_FINISH_TIME).substring(0, 5) : ""}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Actual Start</Typography>
                                        <Typography variant="body2" fontWeight={600} color={work.actuaL_START_DATE ? "success.main" : "text.secondary"}>
                                            {formatDate(work.actuaL_START_DATE) || "Not Start"}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Actual Finish</Typography>
                                        <Typography variant="body2" fontWeight={600} color={work.actuaL_FINISH_DATE ? "success.main" : "text.secondary"}>
                                            {formatDate(work.actuaL_FINISH_DATE) || "Not Finish"}
                                        </Typography>
                                    </Stack>
                                </Stack>

                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Parts / Components Table */}
                    {components.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
                                        <Box sx={{ p: 1.5, bgcolor: 'secondary.light', color: 'secondary.main', borderRadius: 2 }}>
                                            <InventoryIcon />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Spare Parts Used</Typography>
                                    </Stack>
                                    <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                                <TableRow>
                                                    <TableCell><b>Material No.</b></TableCell>
                                                    <TableCell><b>Description</b></TableCell>
                                                    <TableCell align="right"><b>Quantity</b></TableCell>
                                                    <TableCell><b>Unit</b></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {components.map((p: any, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{p.material || p.reS_ITEM}</TableCell>
                                                        <TableCell>{p.matL_DESC || p.materialDescription}</TableCell>
                                                        <TableCell align="right">{p.actuaL_QUANTITY ?? p.requirementQuantity}</TableCell>
                                                        <TableCell>{p.actuaL_QUANTITY_UNIT ?? p.requirementQuantityUnit}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Images Section */}
                    <Grid size={{ xs: 12 }}>
                        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
                                    <Box sx={{ p: 1.5, bgcolor: 'info.light', color: 'info.main', borderRadius: 2 }}>
                                        <ImageIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Images Documents</Typography>
                                </Stack>

                                {images.length === 0 ? (
                                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No images uploaded.</Typography>
                                ) : (
                                    <Grid container spacing={2}>
                                        {images.map((img, idx) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                                                <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                    <Box
                                                        sx={{
                                                            height: 180,
                                                            bgcolor: 'grey.100',
                                                            borderRadius: 1,
                                                            overflow: 'hidden',
                                                            mb: 1,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {img.imageUrl ? (
                                                            <img
                                                                src={img.imageUrl}
                                                                alt={img.title}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onClick={() => window.open(img.imageUrl, '_blank')}
                                                            />
                                                        ) : (
                                                            <ImageIcon sx={{ color: 'grey.300', fontSize: 40 }} />
                                                        )}
                                                    </Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{img.title}</Typography>
                                                    {!img.imageUrl && (
                                                        <Typography variant="caption" color="error">Missing Image</Typography>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}

                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
