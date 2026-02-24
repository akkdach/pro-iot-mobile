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
  Chip,
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
} from '@mui/icons-material';
import QRScanner from '../../Component/QRScanner';
import AppHearder from '../../Component/AppHeader';
import Swal from 'sweetalert2';
import callApi from '../../Services/callApi';

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

export default function NespressReceiveMachine() {
  const [items, setItems] = useState<NpsData[]>([]);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [scanBuffer, setScanBuffer] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAccordion = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleScan = useCallback((value: string) => {
    console.log('--- handleScan TRIGGERED ---');
    console.log('Raw value length:', value.length);
    console.log('Raw value (first 50 chars):', value.substring(0, 50));
    try {

      const cleaned = value.replace(/[\r\n]+/g, '').trim();
      console.log('Cleaned value length:', cleaned.length);

      // Parse to object first
      let rawParsed: any;
      try {
        rawParsed = JSON.parse(cleaned);
        console.log('JSON Parse Success! Keys:', Object.keys(rawParsed));
      } catch (err) {
        console.error('JSON Parse Failed. Cleaned string:', cleaned);
        throw new Error('Invalid JSON format');
      }

      // Helper function to lowercase all keys in an object
      const lowercaseKeys = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(lowercaseKeys);
        return Object.keys(obj).reduce((acc, key) => {
          const lowerKey = key.toLowerCase();
          acc[lowerKey] = obj[key];
          return acc;
        }, {} as any);
      };

      const parsed: NpsData = lowercaseKeys(rawParsed);
      console.log('Lowercase Parsed Payload:', parsed);

      if (!parsed.id && rawParsed.ID) {
        parsed.id = rawParsed.ID;
        console.log('Assigned id from ID:', parsed.id);
      } else if (!parsed.id) {
        console.log('WARNING: Parsed object does not have an id field!');
      }

      // ตรวจสอบซ้ำ
      const isDuplicate = items.some((item) => item.id === parsed.id);
      if (isDuplicate) {
        Swal.fire({ icon: 'warning', title: 'ข้อมูลซ้ำ', text: `ID: ${parsed.id} ถูกสแกนไปแล้ว` });
        return;
      }

      setItems((prev) => [...prev, parsed]);
      setExpanded(`panel-${parsed.id}`);

      // Refocus the input after successful scan
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('QR Parse Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'QR Code ไม่ถูกต้อง',
        text: 'ไม่สามารถอ่านข้อมูลจาก QR Code ได้ หรือไม่ได้เป็นรูปแบบที่รองรับ',
      }).then(() => {
        inputRef.current?.focus();
      });
    }
  }, [items]);

  // We no longer need the global useEffect keydown listner since we use a dedicated input fields

  const handleRemoveItem = (id: string | null) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setItems([]);
    setShowScanner(false);
    setExpanded(false);
  };

  const handleSave = async () => {
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
        // เก็บเฉพาะ item ที่ fail ไว้
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
    <>
      <AppHearder title="Nespresso Receive Machine" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 10,
          mb: 5,
          px: 2,
        }}
      >
        {/* Summary & Scan Button */}
        <Box sx={{ width: '100%', maxWidth: 420, mb: 2 }}>
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
                borderRadius: 3,
                px: 3,
                py: 1,
                backgroundColor: '#003264',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#00254d' },
              }}
            >
              สแกนเพิ่ม
            </Button>
          </Box>
        </Box>

        {/* Handheld Scanner Input */}
        <Box sx={{ width: '100%', maxWidth: 420, mb: 2 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            autoFocus
            variant="outlined"
            placeholder="แตะที่นี่แล้วสแกนด้วย Handheld"
            onPaste={(e) => {
              // Catch paste events from Android scanners like DaiShin
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              if (pastedText && inputRef.current) {
                inputRef.current.value = pastedText;
                try {
                  const cleaned = pastedText.replace(/[\r\n]+/g, '').trim();
                  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
                    JSON.parse(cleaned); // Test valid JSON
                    handleScan(cleaned);
                    inputRef.current.value = ''; // Success
                  }
                } catch (err) {
                  console.error("Paste Parse Error", err);
                }
              }
            }}
            onChange={(e) => {
              const val = e.target.value;

              // Clear previous timeouts if the scanner is still typing
              if ((window as any).scanTimeout) {
                clearTimeout((window as any).scanTimeout);
              }

              // DaiShin might type very fast or paste. Wait 300ms.
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
                  } catch (err) {
                    // Do nothing, maybe it's still typing.
                  }
                }
              }, 300);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                if ((window as any).scanTimeout) {
                  clearTimeout((window as any).scanTimeout);
                }
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
                      title: 'DaiShin Scanner วาง JSON ผิดรูปแบบ',
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
              backgroundColor: '#fff',
              borderRadius: 2,
              '& input': {
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                color: '#003264'
              }
            }}
          />
        </Box>

        {/* Empty State */}
        {items.length === 0 && (
          <Card
            sx={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,50,100,0.1)',
              mb: 3,
              textAlign: 'center',
              py: 4,
            }}
          >
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

        {/* Scanned Items List */}
        {items.length > 0 && (
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {items.map((item, index) => (
              <Accordion
                key={item.id || index}
                expanded={expanded === `panel-${item.id}`}
                onChange={handleAccordion(`panel-${item.id}`)}
                sx={{
                  mb: 1.5,
                  borderRadius: '12px !important',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    px: 2,
                    '& .MuiAccordionSummary-content': { my: 1.5, alignItems: 'center' },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    {/* Ticket - เด่น */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={`#${item.ticket || '-'}`}
                        size="small"
                        sx={{
                          backgroundColor: '#003264',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      />
                      <Chip
                        label={item.createServiceOrderStatus || 'N/A'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: 11, borderColor: '#003264', color: '#003264' }}
                      />
                    </Box>
                    {/* ServiceObject - เด่น */}
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#003264', lineHeight: 1.3 }}>
                      {item.serviceObject || item.id || '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      {item.modelDescription || item.model || '-'}
                    </Typography>
                  </Box>
                  {/* Delete button */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    sx={{ color: '#e53935', ml: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                  <Divider sx={{ mb: 1.5 }} />

                  {/* Customer Info */}
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

                  {/* Remove Info */}
                  <Typography variant="caption" sx={{ color: '#003264', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    ข้อมูลการถอด
                  </Typography>
                  <InfoRow icon={<CalendarMonth fontSize="small" />} label="Remove Date" value={formatDate(item.removeDate)} />
                  <InfoRow icon={<Build fontSize="small" />} label="Remove Technician" value={item.removeTechnician} />

                  <Divider sx={{ my: 1 }} />

                  {/* Service Order */}
                  <Typography variant="caption" sx={{ color: '#003264', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Service Order
                  </Typography>
                  <InfoRow icon={<CalendarMonth fontSize="small" />} label="Created Date" value={formatDate(item.createServiceOrderDate)} />
                  <InfoRow icon={<Person fontSize="small" />} label="Created By" value={item.createServiceOrderBy} />

                  <Divider sx={{ my: 1 }} />

                  {/* Additional Info */}
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

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleReset}
                sx={{
                  borderRadius: 3,
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
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  backgroundColor: '#328a4b',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#276e3b' },
                  '&:disabled': { backgroundColor: '#a5d6a7' },
                }}
              >
                {loading ? 'กำลังบันทึก...' : `บันทึก (${items.length})`}
              </Button>
            </Box>
          </Box>
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
    </>
  );
}
