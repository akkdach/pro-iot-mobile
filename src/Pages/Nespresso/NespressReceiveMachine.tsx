import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
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
  const [formData, setFormData] = useState<NpsData>(emptyForm);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);

  const handleScan = (value: string) => {
    try {
      const cleaned = value.replace(/[\r\n]+/g, '').trim();
      const parsed: NpsData = JSON.parse(cleaned);
      console.log(parsed)
      setFormData(parsed);
      setScanned(true);
    } catch (err) {
      console.error('QR Parse Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'QR Code ไม่ถูกต้อง',
        text: 'ไม่สามารถอ่านข้อมูลจาก QR Code ได้ กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  const handleReset = () => {
    setFormData(emptyForm);
    setScanned(false);
    setShowScanner(false);
  };

  const handleSave = async () => {
    if (!formData.ID) {
      Swal.fire({ icon: 'warning', title: 'ไม่มีข้อมูล', text: 'กรุณาสแกน QR Code ก่อนบันทึก' });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'ยืนยันการบันทึก',
      text: 'คุณต้องการบันทึกข้อมูลนี้หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#003264',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await callApi.post('/OneLake/Nps_Data', formData);
      if(res.data.isSuccess){
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 2000, showConfirmButton: false });
        handleReset();
      }else{
        Swal.fire({ icon: 'error', title: res.data.message, timer: 2000, showConfirmButton: false });
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
        {/* Scan Button */}
        {!scanned && (
          <Card
            sx={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,50,100,0.1)',
              mb: 3,
              textAlign: 'center',
              py: 3,
            }}
          >
            <CardContent>
              <QrCode2 sx={{ fontSize: 64, color: '#003264', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#003264', mb: 1 }}>
                สแกน QR Code
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                กดปุ่มด้านล่างเพื่อสแกน QR Code รับเครื่อง
              </Typography>
              <Button
                variant="contained"
                startIcon={<QrCode2 />}
                onClick={() => setShowScanner(true)}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.2,
                  backgroundColor: '#003264',
                  fontWeight: 600,
                  fontSize: 16,
                  '&:hover': { backgroundColor: '#00254d' },
                }}
              >
                เปิดกล้องสแกน
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scanned Data Display */}
        {scanned && (
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {/* Header Card */}
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,50,100,0.1)',
                mb: 2,
                background: 'linear-gradient(135deg, #003264 0%, #005baa 100%)',
                color: '#fff',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      ID
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formData.ID || '-'}
                    </Typography>
                  </Box>
                  <Chip
                    label={formData.TradeName || 'N/A'}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  />
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1.5 }} />
                <Grid container spacing={1}>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Model
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formData.Model || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Ticket
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formData.Ticket || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Model Description */}
            {formData.ModelDescription && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  mb: 2,
                  px: 2,
                  py: 1.5,
                  backgroundColor: '#f0f6ff',
                  border: '1px solid #d0e3ff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#003264', fontWeight: 600 }}>
                  Model Description
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
                  {formData.ModelDescription}
                </Typography>
              </Card>
            )}

            {/* Customer Info */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', mb: 2 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#003264', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  ข้อมูลลูกค้า
                </Typography>
                <InfoRow icon={<Person fontSize="small" />} label="Customer" value={formData.Customer} />
                <InfoRow icon={<ConfirmationNumber fontSize="small" />} label="Customer Code" value={formData.CustomerCode} />
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid size={6}>
                    <InfoRow icon={<LocationOn fontSize="small" />} label="BKK" value={formData.BKK} />
                  </Grid>
                  <Grid size={6}>
                    <InfoRow icon={<LocationOn fontSize="small" />} label="Post Code" value={formData.PostCode} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Remove Info */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', mb: 2 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#003264', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  ข้อมูลการถอด
                </Typography>
                <InfoRow icon={<CalendarMonth fontSize="small" />} label="Remove Date" value={formatDate(formData.RemoveDate)} />
                <InfoRow icon={<Build fontSize="small" />} label="Remove Technician" value={formData.RemoveTechnician} />
              </CardContent>
            </Card>

            {/* Service Order Info */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', mb: 2 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#003264', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Service Order
                </Typography>
                <InfoRow
                  icon={<CalendarMonth fontSize="small" />}
                  label="Created Date"
                  value={formatDate(formData.CreateServiceOrderDate)}
                />
                <InfoRow icon={<Person fontSize="small" />} label="Created By" value={formData.CreateServiceOrderBy} />
              </CardContent>
            </Card>

            {/* Trade Info */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', mb: 2 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#003264', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Trade
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={6}>
                    <InfoRow icon={<Store fontSize="small" />} label="Trade Code" value={formData.TradeCode} />
                  </Grid>
                  <Grid size={6}>
                    <InfoRow icon={<Store fontSize="small" />} label="Trade Name" value={formData.TradeName} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Service Object */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#aaa' }}>
                Service Object: {formData.ServiceObject || '-'}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
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
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </Box>

            {/* Re-scan Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="text"
                startIcon={<RestartAlt />}
                onClick={() => setShowScanner(true)}
                sx={{ color: '#003264', fontWeight: 500 }}
              >
                สแกนใหม่
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
