/**
 * CountingScreen - Main Page
 * หน้าตรวจนับอะไหล่บนรถ Field Service
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Stack, Chip, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Paper, InputAdornment, TextField } from '@mui/material';

import './Counting.css';
import ActionBar from './ActionBar';
import CountingItem from './CountingItem';
import { useCounting } from '../../hooks/useCounting';
import { getCountingList, createCounting, getCountingDetail, saveCounting } from '../../Services/countingApi';
import { useUser } from '../../Context/userContext';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { alpha } from '@mui/material/styles';

interface CountingSheet {
    count_no: number;
    wk_ctr: string;
    count_movement: boolean;
    count_status: string;
    count_total: number;
    create_at: string;
    posting_date: string | null;
    posting_by: string | null;
}

const CountingScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { count_no, initialData } = location.state || {};
    const { user } = useUser();
    // Use hook (Real API management for sync/queue)
    const {
        vehicle,
        sheet, // existing active sheet
        online,
        queue,
        loading: hookLoading,
        loadVehicles,
        flushQueue,
    } = useCounting({ token: localStorage.getItem('token') || undefined });

    // Local state for list
    const [countingList, setCountingList] = useState<CountingSheet[]>([]);
    const [detailItems, setDetailItems] = useState<any[]>([]); // Adjust type as needed
    const [header, setHeader] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);

    // Detail View State
    const [filterText, setFilterText] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Load vehicles on mount
    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    // Load counting list or details
    useEffect(() => {
        const fetchData = async () => {
            setListLoading(true);
            try {
                if (count_no) {
                    setViewMode('detail');
                    if (initialData && Array.isArray(initialData)) {
                        setDetailItems(initialData);
                        setListLoading(false);
                        return;
                    }

                    const data: any = await getCountingDetail(count_no);
                    if (data?.dataResult?.line && Array.isArray(data.dataResult.line)) {
                        setDetailItems(data.dataResult.line);
                    } else {
                        setDetailItems([]);
                    }
                } else {
                    setViewMode('list');
                    const data: any = await getCountingList(user?.wk_ctr || '', '', 0);
                    if (data?.dataResult && Array.isArray(data.dataResult)) {
                        // Sort by count_no descending
                        const sortedList = data.dataResult.sort((a: CountingSheet, b: CountingSheet) => b.count_no - a.count_no);
                        setCountingList(sortedList);
                    } else if (Array.isArray(data)) {
                        const sortedList = data.sort((a: any, b: any) => (b.count_no || 0) - (a.count_no || 0));
                        setCountingList(sortedList);
                    } else if (data && Array.isArray(data.result)) {
                        const sortedList = data.result.sort((a: any, b: any) => (b.count_no || 0) - (a.count_no || 0));
                        setCountingList(sortedList);
                    } else {
                        console.warn('Unexpected API response format:', data);
                        setCountingList([]);
                    }
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                setListError('ไม่สามารถโหลดข้อมูลได้');
            } finally {
                setListLoading(false);
            }
        };

        fetchData();
        fetchData();
    }, [count_no, user?.wk_ctr]);

    // Handheld Scan Listener
    const scanBuffer = useRef('');
    const lastKeyTime = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();
            const char = e.key;

            // Reset buffer if too slow (manual typing) - 50ms threshold typical for scanners
            if (now - lastKeyTime.current > 100) {
                scanBuffer.current = '';
            }
            lastKeyTime.current = now;

            if (char === 'Enter') {
                if (scanBuffer.current.length > 0) {
                    // Scan detected! Clear old, set new.
                    setFilterText(scanBuffer.current);
                    scanBuffer.current = '';
                    // Prevent default to avoid form submission or double handling
                    e.preventDefault();
                }
            } else if (char.length === 1) {
                // Determine if this is a printable character we want to buffer
                scanBuffer.current += char;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter Logic
    const filteredItems = useMemo(() => {
        if (!filterText) return detailItems;
        return detailItems.filter(item =>
            (item.material || '').toLowerCase().includes(filterText.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(filterText.toLowerCase())
        );
    }, [detailItems, filterText]);

    // Summary Stats
    const stats = useMemo(() => {
        const total = detailItems.length;
        const counted = detailItems.filter(i => i.actual_qty !== undefined && i.actual_qty !== null).length;
        const mismatch = detailItems.filter(i => {
            // Assume mismatch if actual_qty exists and !== stock_qty
            return i.actual_qty !== undefined && i.actual_qty !== null && i.actual_qty !== i.stock_qty;
        }).length;
        return { total, counted, mismatch };
    }, [detailItems]);

    const handleCreateSheet = async () => {
        try {
            if (!user?.wk_ctr) {
                console.warn("Work Center not found for user");
            }
            const res: any = await createCounting(user?.wk_ctr || '', false);
            const newCountNo = res.dataResult?.hd?.count_no;

            if (newCountNo) {
                navigate('/Counting', {
                    state: {
                        count_no: newCountNo
                    }
                });
            } else {
                console.warn("Could not find count_no in response", res);
            }
        } catch (error) {
            console.error('Failed to start counting:', error);
        }
    };

    const handleUpdateItem = (index: number, newQty: number) => {
        const newItems = [...detailItems];
        // Ensure index matches the filtered item's real index in detailItems
        // But since we render filteredItems, passing index from filteredItems directly might be wrong if we use index.
        // Better to find by unique ID or ensure we pass the correct object.
        // Simplification: We will map `filteredItems` but update `detailItems`.
        // Let's rely on item identification.

        // Actually, the `CountingItem` inside map calls `onIncrement` etc.
        // We'll update the logic below to pass identifiers or handle it better.
        // For MVP, if we assume filteredItems are references to objects in detailItems (shallow copy of array, same objects), we can mutate? 
        // No, React state needs new references.
        // We will find the item in detailItems using seq or material.

        // Let's implement handles inline in the render loop or create a robust one.
    };

    const handleSave = async () => {
        try {
            if (!header) return;

            const payload = {
                ...header,
                line: detailItems
            };

            await saveCounting(payload);
            alert('บันทึกสำเร็จ');
            // Optionally refresh or navigate back
            // navigate('/Counting', { state: {} });
        } catch (error) {
            console.error('Save failed:', error);
            alert('บันทึกไม่สำเร็จ');
        }
    };

    return (
        <Box className="counting-screen" sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 10 }}>
            {/* Action Bar (Only in List Mode) */}
            {viewMode === 'list' && (
                <ActionBar
                    vehicle={vehicle}
                    sheetCode={sheet?.code}
                    online={online}
                    queueCount={queue.length}
                    loading={hookLoading || listLoading}
                    onCreateSheet={handleCreateSheet}
                    onSync={flushQueue}
                />
            )}

            {/* Content */}
            <Box className="counting-content" sx={{ p: viewMode === 'list' ? 2 : 0 }}>
                {/* Header Title / Navigation */}
                {viewMode === 'list' && (
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1A2027', display: 'flex', alignItems: 'center', gap: 1 }}>
                        Counting Sheets
                    </Typography>
                )}

                {listLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#003264' }} />
                    </Box>
                ) : listError ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'error.main' }}>
                        {listError}
                    </Box>
                ) : viewMode === 'detail' ? (
                    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#fff' }}>

                        {/* Sticky Header Summary */}
                        <Paper
                            elevation={3}
                            sx={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 1100,
                                borderRadius: 0,
                                bgcolor: '#003264',
                                color: '#fff',
                                p: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                        onClick={() => {
                                            setViewMode('list');
                                            navigate('/Counting', { state: {} });
                                        }}
                                        sx={{ color: '#fff', p: 0.5, mr: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                                            #{count_no}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                            {user?.wk_ctr}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    sx={{
                                        fontWeight: 700,
                                        borderRadius: '20px',
                                        boxShadow: 'none',
                                        textTransform: 'none'
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>

                            {/* Summary Cards */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 1, textAlign: 'center' }}>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5 }}>Total</Typography>
                                    <Typography variant="h6" fontWeight="700">{stats.total}</Typography>
                                </Box>
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 1, textAlign: 'center' }}>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5 }}>Counted</Typography>
                                    <Typography variant="h6" fontWeight="700">{stats.counted}</Typography>
                                </Box>
                                <Box sx={{ bgcolor: stats.mismatch > 0 ? 'rgba(255, 87, 87, 0.2)' : 'rgba(255,255,255,0.1)', borderRadius: 2, p: 1, textAlign: 'center', border: stats.mismatch > 0 ? '1px solid #FF5757' : 'none' }}>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5, color: stats.mismatch > 0 ? '#FF8A8A' : 'inherit' }}>Mismatch</Typography>
                                    <Typography variant="h6" fontWeight="700" sx={{ color: stats.mismatch > 0 ? '#FF8A8A' : 'inherit' }}>{stats.mismatch}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Search & Scan */}
                        <Box sx={{ p: 2, bgcolor: '#F5F7FA' }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Scan QR or Search Item..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => {
                                                    // Simulate Scan Action - Focus or Open Camera Logic here
                                                    // For MVP: clear text or focus
                                                    setFilterText('');
                                                }}
                                                edge="end"
                                                color="primary"
                                            >
                                                <QrCodeScannerIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { bgcolor: '#fff', borderRadius: 3 }
                                }}
                            />
                        </Box>

                        {/* Filtered List */}
                        <Stack spacing={1.5} sx={{ p: 2 }}>
                            {filteredItems.map((item, index) => (
                                <CountingItem
                                    key={index}
                                    line={{
                                        id: item.seq ? `${item.count_no}-${item.seq}` : `line-${index}`,
                                        sheetId: item.count_no ? `${item.count_no}` : '',
                                        itemId: item.material || '',
                                        systemQty: item.stock_qty || 0,
                                        countedQty: item.actual_qty,
                                        status: 'pending'
                                    }}
                                    item={{
                                        id: item.material || '',
                                        sku: item.material || '',
                                        name: item.description || 'Unknown Item',
                                        systemQty: item.stock_qty || 0,
                                        uom: item.unit || ''
                                    }}
                                    onCountChange={() => { }}
                                    onIncrement={() => {
                                        const newItems = detailItems.map(d => {
                                            if (d.seq === item.seq && d.material === item.material) {
                                                const current = d.actual_qty || 0;
                                                return { ...d, actual_qty: current + 1 };
                                            }
                                            return d;
                                        });
                                        setDetailItems(newItems);
                                    }}
                                    onDecrement={() => {
                                        const newItems = detailItems.map(d => {
                                            if (d.seq === item.seq && d.material === item.material) {
                                                const current = d.actual_qty || 0;
                                                return { ...d, actual_qty: Math.max(0, current - 1) };
                                            }
                                            return d;
                                        });
                                        setDetailItems(newItems);
                                    }}
                                />
                            ))}
                            {filteredItems.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                    <Typography variant="body2">No items found matching "{filterText}"</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                ) : countingList.length === 0 ? (
                    <Box className="counting-empty" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#999', py: 8 }}>
                        <InventoryIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
                        <Typography variant="body1">
                            No counting sheets found.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {countingList.map((item) => (
                            <Card
                                key={item.count_no}
                                sx={{
                                    borderRadius: 4,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'rgba(0,0,0,0.03)',
                                    transition: 'all 0.2s ease-in-out',
                                    bgcolor: '#fff',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 28px rgba(0,50,100,0.1)',
                                        borderColor: '#003264'
                                    }
                                }}
                            >
                                <CardContent
                                    onClick={() => navigate('/Counting', { state: { count_no: item.count_no } })}
                                    sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, cursor: 'pointer' }}
                                >
                                    {/* Header Row */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 3,
                                                bgcolor: alpha('#003264', 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#003264'
                                            }}>
                                                <ListAltIcon />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight="800" color="#003264" sx={{ lineHeight: 1.2 }}>
                                                    #{item.count_no}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ letterSpacing: 0.5 }}>
                                                    {item.wk_ctr}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={item.count_status}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                borderRadius: '8px',
                                                px: 0.5,
                                                bgcolor: item.count_status === 'APPROVED' ? alpha('#2e7d32', 0.1) : alpha('#ed6c02', 0.1),
                                                color: item.count_status === 'APPROVED' ? '#1b5e20' : '#e65100',
                                                border: '1px solid',
                                                borderColor: item.count_status === 'APPROVED' ? alpha('#2e7d32', 0.2) : alpha('#ed6c02', 0.2),
                                            }}
                                        />
                                    </Box>

                                    {/* Info Grid */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, bgcolor: '#F8FAFC', p: 1.5, borderRadius: 3 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                <ListAltIcon sx={{ fontSize: 14 }} /> Items
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700" color="#334155">
                                                {item.count_total}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 14 }} /> Date
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700" color="#334155">
                                                {new Date(item.create_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                <SwapHorizIcon sx={{ fontSize: 14 }} /> Move
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700" color={item.count_movement ? '#003264' : '#64748B'}>
                                                {item.count_movement ? 'Yes' : 'No'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )
                }
            </Box >
        </Box >
    );
};

export default CountingScreen;
