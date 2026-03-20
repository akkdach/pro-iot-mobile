import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
  TextField,
} from '@mui/material';
import {
  QrCode2,
  RestartAlt,
  Save,
  Cancel,
  Person,
  ConfirmationNumber,
  LocationOn,
  CalendarMonth,
  Build,
  Store,
  ExpandMore,
  Delete,
  Add,
  Search,
  CloudDownload,
  CropFree,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import QRScanner from '../../Component/QRScanner';
import AppHearder from '../../Component/AppHeader';
import Swal from 'sweetalert2';
import callApi from '../../Services/callApi';
import { callApiOneleke } from '../../Services/callApiOneleke';

// ===== Types =====
export interface NpsData {
  id: string | null;
  serviceObject: string | null;
  model: string | null;
  modelDescription: string | null;
  customerCode: string | null;
  customer: string | null;
  ticket: string | null;
  bkk: string | null;
  postCode: string | null;
  province: string | null;
  removeDate: string | null;
  removeTechnician: string | null;
  createServiceOrderStatus: string | null;
  createServiceOrderDate: string | null;
  createServiceOrderBy: string | null;
  bpc_maintenanceactivitytypecode: string | null;
  bpc_notifdate: string | null;
  bpc_notiftime: string | null;
  bpc_serviceordertypecode: string | null;
  custaccount: string | null;
  stageid: string | null;
  bpc_serviceobjectgroup: string | null;
  start_schedule: string | null;
  finish_schedule: string | null;
  receive: string | null;
}

interface ApiItem {
  _uid: string; // unique key for selection (ID may not be unique)
  ID: string;
  Ticket: string;
  ModelDescription: string;
  Customer: string;
  RemoveTechnician: string;
  BKK: string;
  RemoveDate: string;
  ServiceObject: string;
  [key: string]: any;
}

// ===== Helpers =====
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 0.8 }}>
      <Box sx={{ color: '#003264', mr: 1.5, mt: 0.2, minWidth: 24 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#888', fontWeight: 500, lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', wordBreak: 'break-word' }}>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );
}

// Map API item → NpsData for saving (lowercase all keys to match NpsData fields)
function apiItemToNpsData(item: ApiItem): NpsData {
  // Lowercase all keys from API response (API returns PascalCase)
  const lowered: any = {};
  Object.keys(item).forEach((key) => {
    if (key === '_uid') return; // skip internal key
    lowered[key.toLowerCase()] = item[key];
  });

  return {
    id: lowered.id ?? null,
    serviceObject: lowered.serviceobject ?? null,
    model: lowered.model ?? null,
    modelDescription: lowered.modeldescription ?? null,
    customerCode: lowered.customercode ?? null,
    customer: lowered.customer ?? null,
    ticket: lowered.ticket ?? null,
    bkk: lowered.bkk ?? null,
    postCode: lowered.postcode ?? null,
    province: lowered.province ?? null,
    removeDate: lowered.removedate ?? null,
    removeTechnician: lowered.removetechnician ?? null,
    createServiceOrderStatus: lowered.createserviceorderstatus ?? null,
    createServiceOrderDate: lowered.createserviceorderdate ?? null,
    createServiceOrderBy: lowered.createserviceorderby ?? null,
    bpc_maintenanceactivitytypecode: lowered.bpc_maintenanceactivitytypecode ?? null,
    bpc_notifdate: lowered.bpc_notifdate ?? null,
    bpc_notiftime: lowered.bpc_notiftime ?? null,
    bpc_serviceordertypecode: lowered.bpc_serviceordertypecode ?? null,
    custaccount: lowered.custaccount ?? null,
    stageid: lowered.stageid ?? null,
    bpc_serviceobjectgroup: lowered.bpc_serviceobjectgroup ?? null,
    start_schedule: lowered.start_schedule ?? null,
    finish_schedule: lowered.finish_schedule ?? null,
    receive: lowered.receive ?? null,
  };
}

// ===== Styles (shared) =====
const cardSx = {
  borderRadius: '16px',
  boxShadow: '0 2px 16px rgba(0, 50, 100, 0.07)',
  border: '1px solid rgba(0, 50, 100, 0.06)',
  overflow: 'hidden',
};

const tabBtnSx = (active: boolean) => ({
  flex: 1,
  py: 1.2,
  borderRadius: '11px',
  fontWeight: 600,
  fontSize: 14,
  textTransform: 'none' as const,
  background: active ? '#ffffff' : 'transparent',
  color: active ? '#003264' : 'rgba(255,255,255,0.6)',
  boxShadow: active ? '0 2px 8px rgba(0,50,100,0.2)' : 'none',
  '&:hover': {
    background: active ? '#ffffff' : 'rgba(255,255,255,0.08)',
    color: active ? '#003264' : 'rgba(255,255,255,0.85)',
  },
});

// ===== Component =====
export default function NespressReceiveMachine() {
  // Mode: 'api' or 'qr'
  const [mode, setMode] = useState<'api' | 'qr'>('api');

  // ===== API Fetch State =====
  const BATCH_SIZE = 20;
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(3, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [apiItems, setApiItems] = useState<ApiItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const listEndRef = useRef<HTMLDivElement>(null);

  // ===== QR Scan State (original) =====
  const [items, setItems] = useState<NpsData[]>([]);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string | false>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ===== API Fetch (load all at once) =====
  const handleFetchApi = async () => {
    setApiLoading(true);
    setApiItems([]);
    setSelectedIds({});
    setVisibleCount(BATCH_SIZE);
    try {
      const res = await callApiOneleke('GET', 'bn09-internal-work', {
        params: {
          limit: 100000,
          StartDate: startDate.format('YYYY-MM-DDT00:00:00.000') + 'Z',
          EndDate: endDate.format('YYYY-MM-DDT23:59:59.000') + 'Z',
        },
      });
      const raw: any[] = res.data?.data || res.data?.dataResult || [];
      const list: ApiItem[] = raw.map((item, idx) => ({
        ...item,
        _uid: `${item.ID || idx}_${idx}`,
      }));
      setApiItems(list);
    } catch (err) {
      console.error('Error fetching bn09-internal-work:', err);
      Swal.fire({ icon: 'error', title: 'โหลดข้อมูลไม่ได้', text: 'ไม่สามารถเชื่อมต่อ API ได้' });
    } finally {
      setApiLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (mode === 'api') {
      handleFetchApi();
    }
  }, []);

  // ===== Client-side multi-search filter =====
  const filteredApiItems = React.useMemo(() => {
    const trimmed = searchText.trim();
    if (!trimmed) return apiItems;
    const terms = trimmed.split('|').map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (terms.length === 0) return apiItems;
    return apiItems.filter((item) => {
      const ticket = (item.Ticket || '').toLowerCase();
      const serviceObj = (item.ServiceObject || '').toLowerCase();
      return terms.some((term) => ticket.includes(term) || serviceObj.includes(term));
    });
  }, [apiItems, searchText]);

  // Items to render (lazy render batch)
  const visibleItems = React.useMemo(
    () => filteredApiItems.slice(0, visibleCount),
    [filteredApiItems, visibleCount]
  );
  const hasMore = visibleCount < filteredApiItems.length;

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchText]);

  // ===== Infinite Scroll Observer =====
  useEffect(() => {
    if (mode !== 'api' || !hasMore || apiLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { threshold: 0.1 }
    );
    const el = listEndRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [mode, hasMore, apiLoading, visibleCount]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    const allSelected = filteredApiItems.length > 0 && filteredApiItems.every((i) => selectedIds[i._uid]);
    const next: Record<string, boolean> = {};
    filteredApiItems.forEach((i) => (next[i._uid] = !allSelected));
    setSelectedIds(next);
  };

  const selectedCount = filteredApiItems.filter((i) => selectedIds[i._uid]).length;

  const handleSaveApiItems = async () => {
    const selectedItems = apiItems.filter((i) => selectedIds[i._uid]);
    if (selectedItems.length === 0) {
      Swal.fire({ icon: 'warning', title: 'ไม่มีรายการ', text: 'กรุณาเลือกรายการที่ต้องการรับ' });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'ยืนยันการรับเครื่อง',
      text: `คุณต้องการบันทึกรับเครื่องทั้งหมด ${selectedItems.length} รายการหรือไม่?`,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#003264',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    const failMessages: string[] = [];

    try {
      for (const item of selectedItems) {
        try {
          const npsData = apiItemToNpsData(item);
          const res = await callApi.post('/OneLake/Nps_Data', npsData);
          if (res.data.isSuccess) {
            successCount++;
          } else {
            failCount++;
            failMessages.push(`${item.ID}: ${res.data.message || 'ไม่ทราบสาเหตุ'}`);
          }
        } catch (err: any) {
          failCount++;
          failMessages.push(`${item.ID}: ${err?.response?.data?.message || err?.message || 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'}`);
        }
      }

      if (failCount === 0) {
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', text: `รับเครื่องทั้งหมด ${successCount} รายการ`, timer: 2500, showConfirmButton: false });
        setSelectedIds({});
        handleFetchApi(); // Refresh
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'บันทึกบางส่วน',
          html: `สำเร็จ ${successCount} รายการ<br/>ไม่สำเร็จ ${failCount} รายการ<br/><br/>${failMessages.map((m) => `<div style="text-align:left;font-size:13px;margin-bottom:4px;">• ${m}</div>`).join('')}`,
        });
      }
    } catch (error: any) {
      console.error('Error Save NPS:', error);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error?.response?.data?.message || error?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== QR Scan Handlers (original logic preserved) =====
  const handleAccordion = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleScan = useCallback((value: string) => {
    try {
      const cleaned = value.replace(/[\r\n]+/g, '').trim();
      let rawParsed: any;
      try {
        rawParsed = JSON.parse(cleaned);
      } catch (err) {
        throw new Error('Invalid JSON format');
      }

      const lowercaseKeys = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(lowercaseKeys);
        return Object.keys(obj).reduce((acc, key) => {
          acc[key.toLowerCase()] = obj[key];
          return acc;
        }, {} as any);
      };

      const parsed: NpsData = lowercaseKeys(rawParsed);
      if (!parsed.id && rawParsed.ID) {
        parsed.id = rawParsed.ID;
      }

      const isDuplicate = items.some((item) => item.id === parsed.id);
      if (isDuplicate) {
        Swal.fire({ icon: 'warning', title: 'ข้อมูลซ้ำ', text: `ID: ${parsed.id} ถูกสแกนไปแล้ว` });
        return;
      }

      setItems((prev) => [...prev, parsed]);
      setExpanded(`panel-${parsed.id}`);
      setTimeout(() => { inputRef.current?.focus(); }, 100);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'QR Code ไม่ถูกต้อง',
        text: 'ไม่สามารถอ่านข้อมูลจาก QR Code ได้ หรือไม่ได้เป็นรูปแบบที่รองรับ',
      }).then(() => { inputRef.current?.focus(); });
    }
  }, [items]);

  const handleRemoveItem = (id: string | null) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setItems([]);
    setShowScanner(false);
    setExpanded(false);
  };

  const handleSaveQr = async () => {
    if (items.length === 0) {
      Swal.fire({ icon: 'warning', title: 'ไม่มีข้อมูล', text: 'กรุณาสแกน QR Code ก่อนบันทึก' });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'ยืนยันการบันทึก',
      text: `คุณต้องการบันทึกข้อมูลทั้งหมด ${items.length} รายการหรือไม่?`,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#003264',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    const failedIds: string[] = [];
    const failMessages: string[] = [];

    try {
      for (const item of items) {
        try {
          const res = await callApi.post('/OneLake/Nps_Data', item);
          if (res.data.isSuccess) {
            successCount++;
          } else {
            failCount++;
            failedIds.push(item.id || 'N/A');
            failMessages.push(`${item.id || 'N/A'}: ${res.data.message || 'ไม่ทราบสาเหตุ'}`);
          }
        } catch (err: any) {
          failCount++;
          failedIds.push(item.id || 'N/A');
          failMessages.push(`${item.id || 'N/A'}: ${err?.response?.data?.message || err?.message || 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'}`);
        }
      }

      if (failCount === 0) {
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', text: `บันทึกทั้งหมด ${successCount} รายการ`, timer: 2500, showConfirmButton: false });
        handleReset();
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'บันทึกบางส่วน',
          html: `สำเร็จ ${successCount} รายการ<br/>ไม่สำเร็จ ${failCount} รายการ<br/><br/>${failMessages.map((m) => `<div style="text-align:left;font-size:13px;margin-bottom:4px;">• ${m}</div>`).join('')}`,
        });
        setItems((prev) => prev.filter((item) => failedIds.includes(item.id || 'N/A')));
      }
    } catch (error: any) {
      console.error('Error Save NPS:', error);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error?.response?.data?.message || error?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppHearder title="Nespresso Receive Machine" />

      <Box sx={{
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%)',
        minHeight: '100vh',
        pt: '72px',
        pb: 10,
      }}>
        {/* ===== Mode Toggle ===== */}
        <Box sx={{
          background: 'linear-gradient(135deg, #003264 0%, #004a93 100%)',
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Box sx={{
            display: 'flex',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '14px',
            p: '4px',
            gap: '4px',
            width: '100%',
            maxWidth: 420,
          }}>
            <Button onClick={() => setMode('api')} sx={tabBtnSx(mode === 'api')}>
              <CloudDownload sx={{ mr: 1, fontSize: 18 }} />
              ดึงข้อมูล
            </Button>
            <Button onClick={() => setMode('qr')} sx={tabBtnSx(mode === 'qr')}>
              <CropFree sx={{ mr: 1, fontSize: 18 }} />
              สแกน QR
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* ========================================== */}
          {/* ===== MODE: API FETCH ===== */}
          {/* ========================================== */}
          {mode === 'api' && (
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              {/* Date Filters */}
              <Card sx={{ ...cardSx, mb: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    color: '#8896a6',
                    mb: 1.5,
                    display: 'block',
                  }}>
                    ค้นหาตามวันที่
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <DatePicker
                      label="วันเริ่มต้น"
                      value={startDate}
                      onChange={(v) => v && setStartDate(v)}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: '#fff',
                            },
                          },
                        },
                      }}
                    />
                    <DatePicker
                      label="วันสิ้นสุด"
                      value={endDate}
                      onChange={(v) => v && setEndDate(v)}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: '#fff',
                            },
                          },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={apiLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Search />}
                    onClick={() => handleFetchApi()}
                    disabled={apiLoading}
                    sx={{
                      borderRadius: '12px',
                      py: 1.2,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #003264 0%, #004a93 100%)',
                      boxShadow: '0 4px 16px rgba(0,50,100,0.2)',
                      '&:hover': { background: 'linear-gradient(135deg, #002244 0%, #003a73 100%)' },
                    }}
                  >
                    {apiLoading ? 'กำลังโหลด...' : 'ค้นหา'}
                  </Button>
                </CardContent>
              </Card>

              {/* Search Box */}
              <Card sx={{ ...cardSx, mb: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    color: '#8896a6',
                    mb: 1,
                    display: 'block',
                  }}>
                    ค้นหา Ticket / Service Object
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder='พิมพ์ค้นหา เช่น TK001 | TK002'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ color: '#8896a6', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                      },
                    }}
                  />
                  {searchText.trim() && (
                    <Typography variant="caption" sx={{ color: '#8896a6', mt: 0.5, display: 'block' }}>
                      พบ {filteredApiItems.length} จาก {apiItems.length} รายการ
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Results Summary */}
              {!apiLoading && filteredApiItems.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={`${filteredApiItems.length} รายการ • เลือก ${selectedCount}`}
                    sx={{
                      fontWeight: 600,
                      fontSize: 13,
                      py: 2.2,
                      backgroundColor: '#e8f0fe',
                      color: '#003264',
                    }}
                  />
                  <Button
                    size="small"
                    onClick={toggleSelectAll}
                    sx={{ fontWeight: 600, textTransform: 'none', color: '#003264' }}
                  >
                    {filteredApiItems.every((i) => selectedIds[i._uid]) ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                  </Button>
                </Box>
              )}

              {/* Loading */}
              {apiLoading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1.5 }}>
                  <CircularProgress size={44} sx={{ color: '#1cc4c4' }} />
                  <Typography variant="body2" sx={{ color: '#8896a6', fontWeight: 500 }}>
                    กำลังโหลดข้อมูล...
                  </Typography>
                </Box>
              )}

              {/* Empty */}
              {!apiLoading && apiItems.length === 0 && !searchText.trim() && (
                <Card sx={{ ...cardSx, textAlign: 'center', py: 4 }}>
                  <CardContent>
                    <CloudDownload sx={{ fontSize: 56, color: '#ccc', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#999', mb: 0.5 }}>
                      ไม่พบรายการ
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                      ลองเปลี่ยนช่วงวันที่แล้วกด "ค้นหา" อีกครั้ง
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* API Item Cards */}
              {/* No search results */}
              {!apiLoading && filteredApiItems.length === 0 && searchText.trim() && (
                <Card sx={{ ...cardSx, textAlign: 'center', py: 3 }}>
                  <CardContent>
                    <Search sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#999', mb: 0.5 }}>
                      ไม่พบรายการที่ค้นหา
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                      ลองเปลี่ยนคำค้นหา หรือใช้ | คั่นเพื่อค้นหาหลายคำ
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {!apiLoading && visibleItems.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  {visibleItems.map((item) => {
                    const isSelected = !!selectedIds[item._uid];
                    return (
                      <Card
                        key={item._uid}
                        onClick={() => toggleSelect(item._uid)}
                        sx={{
                          ...cardSx,
                          cursor: 'pointer',
                          position: 'relative',
                          borderColor: isSelected ? '#1cc4c4' : 'rgba(0, 50, 100, 0.06)',
                          borderWidth: isSelected ? 2 : 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 24px rgba(0, 50, 100, 0.12)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            background: isSelected
                              ? 'linear-gradient(180deg, #1cc4c4, #003264)'
                              : 'linear-gradient(180deg, #cbd5e1, #94a3b8)',
                            borderRadius: '4px 0 0 4px',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, pl: 3, '&:last-child': { pb: 2 } }}>
                          {/* Header row */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <Checkbox
                                checked={isSelected}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleSelect(item._uid)}
                                sx={{
                                  p: 0,
                                  color: '#cbd5e1',
                                  '&.Mui-checked': { color: '#1cc4c4' },
                                }}
                              />
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <Chip
                                    label={`#${item.Ticket || '-'}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#003264',
                                      color: '#fff',
                                      fontWeight: 700,
                                      fontSize: 12,
                                      height: 24,
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a2b3c', mt: 0.3 }}>
                                  {item.ServiceObject || item.ID || '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* Info Grid */}
                          <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 0.5,
                            ml: 4.5,
                          }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#8896a6', fontSize: 10, fontWeight: 500 }}>
                                Model
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2d3d4f', fontSize: 12, lineHeight: 1.3 }}>
                                {item.ModelDescription || '-'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#8896a6', fontSize: 10, fontWeight: 500 }}>
                                Customer
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2d3d4f', fontSize: 12, lineHeight: 1.3 }}>
                                {item.Customer || '-'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#8896a6', fontSize: 10, fontWeight: 500 }}>
                                Technician
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2d3d4f', fontSize: 12, lineHeight: 1.3 }}>
                                {item.RemoveTechnician || '-'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#8896a6', fontSize: 10, fontWeight: 500 }}>
                                Region
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2d3d4f', fontSize: 12, lineHeight: 1.3 }}>
                                {item.BKK || '-'}
                              </Typography>
                            </Box>
                            <Box sx={{ gridColumn: '1 / -1' }}>
                              <Typography variant="caption" sx={{ color: '#8896a6', fontSize: 10, fontWeight: 500 }}>
                                Remove Date
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2d3d4f', fontSize: 12 }}>
                                {formatShortDate(item.RemoveDate)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Sentinel for infinite scroll */}
                  <div ref={listEndRef} style={{ height: 1 }} />

                  {/* End of list */}
                  {!hasMore && filteredApiItems.length > 0 && (
                    <Typography
                      variant="caption"
                      sx={{ textAlign: 'center', display: 'block', color: '#aaa', py: 1 }}
                    >
                      — แสดงครบทุกรายการแล้ว —
                    </Typography>
                  )}
                </Box>
              )}

              {/* Save Button (API mode) */}
              {!apiLoading && selectedCount > 0 && (
                <Box sx={{
                  position: 'sticky',
                  bottom: 70,
                  zIndex: 50,
                  display: 'flex',
                  justifyContent: 'center',
                  pb: 2,
                }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Save />}
                    onClick={handleSaveApiItems}
                    disabled={loading}
                    sx={{
                      borderRadius: '14px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: 16,
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      boxShadow: '0 6px 24px rgba(16, 185, 129, 0.35)',
                      '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #0d9488 100%)' },
                      '&:disabled': { opacity: 0.6 },
                    }}
                  >
                    {loading ? 'กำลังบันทึก...' : `บันทึกรับเครื่อง (${selectedCount})`}
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* ========================================== */}
          {/* ===== MODE: QR SCAN (original) ===== */}
          {/* ========================================== */}
          {mode === 'qr' && (
            <Box sx={{ width: '100%', maxWidth: 420 }}>
              {/* Summary & Scan Button */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Badge badgeContent={items.length} color="primary" showZero>
                  <Chip
                    icon={<QrCode2 />}
                    label={items.length === 0 ? 'ยังไม่มีรายการ' : `${items.length} รายการ`}
                    sx={{ fontWeight: 600, fontSize: 14, py: 2.5, backgroundColor: '#e8f0fe', color: '#003264' }}
                  />
                </Badge>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowScanner(true)}
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #003264 0%, #004a93 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #002244 0%, #003a73 100%)' },
                  }}
                >
                  สแกนเพิ่ม
                </Button>
              </Box>

              {/* Handheld Scanner Input */}
              <TextField
                inputRef={inputRef}
                fullWidth
                autoFocus
                variant="outlined"
                placeholder="แตะที่นี่แล้วสแกนด้วย Handheld"
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData('text');
                  if (pastedText && inputRef.current) {
                    inputRef.current.value = pastedText;
                    try {
                      const cleaned = pastedText.replace(/[\r\n]+/g, '').trim();
                      if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
                        JSON.parse(cleaned);
                        handleScan(cleaned);
                        inputRef.current.value = '';
                      }
                    } catch (err) {
                      console.error("Paste Parse Error", err);
                    }
                  }
                }}
                onChange={(e) => {
                  if ((window as any).scanTimeout) clearTimeout((window as any).scanTimeout);
                  (window as any).scanTimeout = setTimeout(() => {
                    const finalVal = inputRef.current?.value || '';
                    if (finalVal.trim().length > 10) {
                      try {
                        const cleaned = finalVal.replace(/[\r\n]+/g, '').trim();
                        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
                          JSON.parse(cleaned);
                          handleScan(cleaned);
                          if (inputRef.current) inputRef.current.value = '';
                        }
                      } catch (err) { /* still typing */ }
                    }
                  }, 300);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    if ((window as any).scanTimeout) clearTimeout((window as any).scanTimeout);
                    const val = inputRef.current?.value || '';
                    if (val.trim()) {
                      try {
                        const cleaned = val.replace(/[\r\n]+/g, '').trim();
                        JSON.parse(cleaned);
                        handleScan(cleaned);
                        if (inputRef.current) inputRef.current.value = '';
                      } catch (err) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Scanner วาง JSON ผิดรูปแบบ',
                          html: `<div style="text-align:left; font-size:12px; max-height: 200px; overflow-y: auto;">
                                   <b>Raw:</b><br/>${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                                 </div>`,
                        });
                        if (inputRef.current) inputRef.current.value = '';
                      }
                    }
                  }
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 12px rgba(0,50,100,0.06)',
                  },
                  '& input': { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#003264' },
                }}
              />

              {/* Empty State */}
              {items.length === 0 && (
                <Card sx={{ ...cardSx, textAlign: 'center', py: 4, mb: 3 }}>
                  <CardContent>
                    <QrCode2 sx={{ fontSize: 64, color: '#ccc', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#999', mb: 1 }}>
                      เริ่มสแกน QR Code
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                      ใช้เครื่องสแกนบาร์โค้ด (Handheld Scanner) ยิงได้ทันที หรือกดปุ่ม "สแกนเพิ่ม" เพื่อใช้กล้อง
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Scanned Items (Accordion) */}
              {items.length > 0 && (
                <>
                  {items.map((item, index) => (
                    <Accordion
                      key={item.id || index}
                      expanded={expanded === `panel-${item.id}`}
                      onChange={handleAccordion(`panel-${item.id}`)}
                      sx={{
                        mb: 1.5,
                        borderRadius: '14px !important',
                        boxShadow: '0 2px 12px rgba(0,50,100,0.06)',
                        '&:before': { display: 'none' },
                        overflow: 'hidden',
                        border: '1px solid rgba(0,50,100,0.06)',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{ px: 2, '& .MuiAccordionSummary-content': { my: 1.5, alignItems: 'center' } }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip
                              label={`#${item.ticket || '-'}`}
                              size="small"
                              sx={{ backgroundColor: '#003264', color: '#fff', fontWeight: 700, fontSize: 13 }}
                            />
                            <Chip
                              label={item.createServiceOrderStatus || 'N/A'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: 11, borderColor: '#003264', color: '#003264' }}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#003264', lineHeight: 1.3 }}>
                            {item.serviceObject || item.id || '-'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#888' }}>
                            {item.modelDescription || item.model || '-'}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                          sx={{ color: '#e53935', ml: 1 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </AccordionSummary>

                      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant="caption" sx={{ color: '#003264', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          ข้อมูลลูกค้า
                        </Typography>
                        <InfoRow icon={<Person fontSize="small" />} label="Customer" value={item.customer} />
                        <InfoRow icon={<ConfirmationNumber fontSize="small" />} label="Customer Code" value={item.customerCode} />
                        <Grid container spacing={1}>
                          <Grid size={6}>
                            <InfoRow icon={<LocationOn fontSize="small" />} label="BKK" value={item.bkk} />
                          </Grid>
                          <Grid size={6}>
                            <InfoRow icon={<LocationOn fontSize="small" />} label="Post Code" value={item.postCode} />
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" sx={{ color: '#003264', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          ข้อมูลการถอด
                        </Typography>
                        <InfoRow icon={<CalendarMonth fontSize="small" />} label="Remove Date" value={formatDate(item.removeDate)} />
                        <InfoRow icon={<Build fontSize="small" />} label="Remove Technician" value={item.removeTechnician} />

                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" sx={{ color: '#003264', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Service Order
                        </Typography>
                        <InfoRow icon={<CalendarMonth fontSize="small" />} label="Created Date" value={formatDate(item.createServiceOrderDate)} />
                        <InfoRow icon={<Person fontSize="small" />} label="Created By" value={item.createServiceOrderBy} />

                        <Divider sx={{ my: 1 }} />
                        <Grid container spacing={1}>
                          <Grid size={6}>
                            <InfoRow icon={<Store fontSize="small" />} label="Activity" value={item.bpc_maintenanceactivitytypecode} />
                          </Grid>
                          <Grid size={6}>
                            <InfoRow icon={<Store fontSize="small" />} label="Status" value={item.createServiceOrderStatus} />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {/* QR Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleReset}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        py: 1,
                        color: '#999',
                        borderColor: '#ccc',
                        fontWeight: 600,
                        '&:hover': { borderColor: '#999', backgroundColor: '#f5f5f5' },
                      }}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Save />}
                      onClick={handleSaveQr}
                      disabled={loading}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #0d9488 100%)' },
                        '&:disabled': { opacity: 0.6 },
                      }}
                    >
                      {loading ? 'กำลังบันทึก...' : `บันทึก (${items.length})`}
                    </Button>
                  </Box>
                </>
              )}

              {/* QR Scanner Dialog */}
              <QRScanner
                open={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={(value) => {
                  handleScan(value);
                  setShowScanner(false);
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
