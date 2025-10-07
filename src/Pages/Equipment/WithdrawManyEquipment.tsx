import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, Button, InputAdornment, IconButton, List, ListItem, ListItemText, } from "@mui/material";
import { QrCode2, Delete } from "@mui/icons-material";
import QRScanner from "../../Component/QRScanner";
import AppHearder from "../../Component/AppHeader";
import Swal from "sweetalert2";
import callApiProd from "../../Services/callApiProd";

export interface Withdraw {
  equipmentSerialNo?: string;
  orderID?: string;
  activity?: string;
  status?: string;
  remarks?: string;
}

export default function WithdrawManyEquipment() {
  const [formData, setFormData] = useState<Withdraw>({ equipmentSerialNo: "", orderID: "" });
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanField, setScanField] = useState<"equipmentSerialNo" | null>(null);
  const equipmentRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<Withdraw[]>(() => {
    const saved = localStorage.getItem("withdrawOrders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    equipmentRef.current?.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("withdrawOrders", JSON.stringify(orders));
  }, [orders]);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (data: Withdraw) => {
      if (!data.equipmentSerialNo) return;
  
      const newItem: Withdraw = {
        equipmentSerialNo: data.equipmentSerialNo.trim(), // กันกรณีมีช่องว่าง
        orderID: "",       // fix เป็นค่าว่าง
        status: data.status || "",
        remarks: data.remarks || "",
        activity: data.activity || "",
      };
  
      setOrders((prev) => {
        // เช็คว่ามี serialNo ซ้ำหรือยัง
        const exists = prev.some(o => o.equipmentSerialNo === newItem.equipmentSerialNo);
        if (exists) {
          Swal.fire('มีรายการนี้แล้ว', `Equipment ${newItem.equipmentSerialNo} ถูกเพิ่มไว้แล้ว`, 'warning');
          return prev; // ไม่เพิ่มซ้ำ
        }
        return [...prev, newItem];
      });
  
      setFormData({ equipmentSerialNo: "", orderID: "" });
      equipmentRef.current?.focus();
    };

  const handleRemove = (index: number) => {
    setOrders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setFormData({ equipmentSerialNo: "" });
    setOrders([]);
    setShowScanner(false);
    equipmentRef.current?.focus();
    localStorage.removeItem("withdrawOrders"); // ล้าง localStorage
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // map orders -> payload ที่ API ต้องการ
      const payload = orders.map(o => ({
        equipmentSerialNo: o.equipmentSerialNo || "",
        orderID: "",      // orderID ต้องว่าง
        isSendSap: false   // fix เป็น false
      }));

      const res = await callApiProd.post('/EquipmentTransaction/Withdraw_multi', payload);

      if (res.data?.isSuccess) {
        Swal.fire('จ่ายเครื่องสำเร็จ', '', 'success');
        setFormData({ equipmentSerialNo: '', orderID: '' });
        setOrders([]);
        equipmentRef.current?.focus();
        localStorage.removeItem("withdrawOrders");
      } else {
        Swal.fire('จ่ายเครื่องไม่สำเร็จ', res.data?.message || '', 'error');
      }
    } catch (error: any) {
      console.error('Error Withdraw:', error);
      Swal.fire('เกิดข้อผิดพลาด', error?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHearder title="จ่ายหลายเครื่อง" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginTop: "20%",
          marginBottom: 5,
          p: 2,
        }}
      >

        {/* ช่องกรอก Equipment */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TextField
            name="equipmentSerialNo"
            onChange={handleInputChange}
            inputRef={equipmentRef}
            variant="outlined"
            value={formData.equipmentSerialNo}
            placeholder="Enter Equipment"
            sx={{
              height: 50,
              fontWeight: 500,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              width: 300,
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                '& fieldset': {
                  borderColor: '#ddd',
                },
              },
              '& input': {
                padding: '12px 14px',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => { setScanField("equipmentSerialNo"); setShowScanner(true); }}>
                    <QrCode2 />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAdd(formData);
              }
            }}
          />
        </Box>

        {/* รายการที่เพิ่มมา */}
        <List>
          {orders.map((o, i) => (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ListItem
                sx={{
                  fontWeight: 500,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  width: 350,
                  display: 'flex',
                  justifyContent: 'center'
                }}
                key={i}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemove(i)}>
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`Equipment: ${o.equipmentSerialNo || "-"}`}
                />
              </ListItem>
            </Box>
          ))}
        </List>


        {/* ปุ่ม Action */}
        <Box mt={1} display="flex" justifyContent="center" gap={1}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ borderRadius: 4 }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ borderRadius: 4, backgroundColor: "#328a4b" }}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
          </Button>
        </Box>

        {/* QR Scanner */}
        {showScanner && (
          <Box mt={4}>
            <QRScanner
              open={showScanner}
              onClose={() => setShowScanner(false)}
              onScan={(value) => {
                const cleaned = value.replace(/[\r\n]+/g, '').trim();

                if (scanField) {
                  const newData = { ...formData, [scanField]: cleaned };

                  if (newData.equipmentSerialNo) {
                    handleAdd(newData);
                  } else {
                    setFormData(newData);
                  }
                }
                setShowScanner(false);
                setScanField(null);
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
}
