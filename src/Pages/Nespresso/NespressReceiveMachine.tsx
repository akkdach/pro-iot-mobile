import React, { useState } from 'react';
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
  ID: string | null;
  ServiceObject: string | null;
  Model: string | null;
  ModelDescription: string | null;
  CustomerCode: string | null;
  Customer: string | null;
  Ticket: string | null;
  BKK: string | null;
  PostCode: string | null;
  RemoveDate: string | null;
  RemoveTechnician: string | null;
  CreateServiceOrderDate: string | null;
  CreateServiceOrderBy: string | null;
  TradeCode: string | null;
  TradeName: string | null;
}

const emptyForm: NpsData = {
  ID: null,
  ServiceObject: null,
  Model: null,
  ModelDescription: null,
  CustomerCode: null,
  Customer: null,
  Ticket: null,
  BKK: null,
  PostCode: null,
  RemoveDate: null,
  RemoveTechnician: null,
  CreateServiceOrderDate: null,
  CreateServiceOrderBy: null,
  TradeCode: null,
  TradeName: null,
};

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

  const handleAccordion = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleScan = (value: string) => {
    try {
      const cleaned = value.replace(/[\r\n]+/g, '').trim();
      const parsed: NpsData = JSON.parse(cleaned);
      console.log(parsed);

      // ตรวจสอบซ้ำ
      const isDuplicate = items.some((item) => item.ID === parsed.ID);
      if (isDuplicate) {
        Swal.fire({ icon: 'warning', title: 'ข้อมูลซ้ำ', text: `ID: ${parsed.ID} ถูกสแกนไปแล้ว` });
        return;
      }

      setItems((prev) => [...prev, parsed]);
      setExpanded(`panel-${parsed.ID}`);
    } catch (err) {
      console.error('QR Parse Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'QR Code ไม่ถูกต้อง',
        text: 'ไม่สามารถอ่านข้อมูลจาก QR Code ได้ กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  const handleRemoveItem = (id: string | null) => {
    setItems((prev) => prev.filter((item) => item.ID !== id));
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
            failedIds.push(item.ID || 'N/A');
            failMessages.push(`${item.ID || 'N/A'}: ${res.data.message || 'ไม่ทราบสาเหตุ'}`);
          }
        } catch (err: any) {
          failCount++;
          failedIds.push(item.ID || 'N/A');
          failMessages.push(`${item.ID || 'N/A'}: ${err?.response?.data?.message || err?.message || 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'}`);
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
        setItems((prev) => prev.filter((item) => failedIds.includes(item.ID || 'N/A')));
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
                กดปุ่ม "สแกนเพิ่ม" เพื่อสแกนบาร์โค้ดรับเครื่อง
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Scanned Items List */}
        {items.length > 0 && (
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {items.map((item, index) => (
              <Accordion
                key={item.ID || index}
                expanded={expanded === `panel-${item.ID}`}
                onChange={handleAccordion(`panel-${item.ID}`)}
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
                        label={`#${item.Ticket || '-'}`}
                        size="small"
                        sx={{
                          backgroundColor: '#003264',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      />
                      <Chip
                        label={item.TradeName || 'N/A'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: 11, borderColor: '#003264', color: '#003264' }}
                      />
                    </Box>
                    {/* ServiceObject - เด่น */}
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#003264', lineHeight: 1.3 }}>
                      {item.ServiceObject || item.ID || '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      {item.ModelDescription || item.Model || '-'}
                    </Typography>
                  </Box>
                  {/* Delete button */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.ID);
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
                  <InfoRow icon={<Person fontSize="small" />} label="Customer" value={item.Customer} />
                  <InfoRow icon={<ConfirmationNumber fontSize="small" />} label="Customer Code" value={item.CustomerCode} />
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <InfoRow icon={<LocationOn fontSize="small" />} label="BKK" value={item.BKK} />
                    </Grid>
                    <Grid size={6}>
                      <InfoRow icon={<LocationOn fontSize="small" />} label="Post Code" value={item.PostCode} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1 }} />

                  {/* Remove Info */}
                  <Typography variant="caption" sx={{ color: '#003264', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    ข้อมูลการถอด
                  </Typography>
                  <InfoRow icon={<CalendarMonth fontSize="small" />} label="Remove Date" value={formatDate(item.RemoveDate)} />
                  <InfoRow icon={<Build fontSize="small" />} label="Remove Technician" value={item.RemoveTechnician} />

                  <Divider sx={{ my: 1 }} />

                  {/* Service Order */}
                  <Typography variant="caption" sx={{ color: '#003264', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Service Order
                  </Typography>
                  <InfoRow icon={<CalendarMonth fontSize="small" />} label="Created Date" value={formatDate(item.CreateServiceOrderDate)} />
                  <InfoRow icon={<Person fontSize="small" />} label="Created By" value={item.CreateServiceOrderBy} />

                  <Divider sx={{ my: 1 }} />

                  {/* Trade */}
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <InfoRow icon={<Store fontSize="small" />} label="Trade Code" value={item.TradeCode} />
                    </Grid>
                    <Grid size={6}>
                      <InfoRow icon={<Store fontSize="small" />} label="Trade Name" value={item.TradeName} />
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
