import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InventoryIcon from "@mui/icons-material/Inventory";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useWork } from "../../Context/WorkStationContext";

const repairTypes = [
  "Major A1",
  "Major A2",
  "Major A3",
  "Minor A1",
  "Minor A2",
  "Minor A3",
];

const headerLabels: Record<string, string> = {
  serviceOrderTypeCode: "ประเภทใบสั่งงาน",
  standardServiceCode: "รหัสบริการ",
  mimj: "ประเภทการซ่อม",
  descEng: "รายละเอียด",
  modelNo: "รุ่นเครื่อง",
  serviceObjectGroup: "กลุ่มอุปกรณ์",
};

export default function BomTab() {
  const { bomData, setBomData, bomLoading, fetchBom, workOrderDetail, work } = useWork();
  const [selectedRepairType, setSelectedRepairType] = useState<string>("");

  // Add Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addNo, setAddNo] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addQty, setAddQty] = useState("1");
  const [addUnit, setAddUnit] = useState("PCE");

  const handleFetchBom = () => {
    if (!selectedRepairType) { alert("กรุณาเลือกประเภทการซ่อมก่อน"); return; }
    const hdr = workOrderDetail?.header ?? {};
    const orderType = work?.ordeR_TYPE ?? hdr?.orderType ?? "";
    const objectType = hdr?.objectType ?? work?.objecttype ?? "";
    if (!orderType) { alert("ไม่พบข้อมูล Order Type"); return; }
    fetchBom(orderType, objectType, selectedRepairType);
  };

  /* ── Inline Edit Qty ── */
  const updateQty = (idx: number, val: string) => {
    if (!Array.isArray(bomData)) return;
    const updated = [...bomData];
    updated[idx] = { ...updated[idx], quantity: val === "" ? "" : Math.max(0, Number(val) || 0) };
    setBomData(updated);
  };

  /* ── Delete ── */
  const handleDelete = (idx: number) => {
    if (!Array.isArray(bomData)) return;
    setBomData(bomData.filter((_: any, i: number) => i !== idx));
  };

  /* ── Add ── */
  const handleAdd = () => {
    const newItem = { id: Date.now(), no: addNo, description: addDesc, quantity: Math.max(0, Number(addQty) || 0), unitOfMeasureCode: addUnit };
    setBomData([...(Array.isArray(bomData) ? bomData : []), newItem]);
    setAddNo(""); setAddDesc(""); setAddQty("1"); setAddUnit("PCE");
    setAddOpen(false);
  };

  const lines: any[] = Array.isArray(bomData) ? bomData : [];
  const headerSource = lines.length > 0 ? lines[0] : null;

  return (
    <Box sx={{ pb: 4 }}>
      {/* ─── Dropdown + Fetch ─── */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ width: "100%", maxWidth: 340 }}>
          <InputLabel>ประเภทการซ่อม</InputLabel>
          <Select value={selectedRepairType} label="ประเภทการซ่อม" onChange={(e) => setSelectedRepairType(e.target.value)}>
            {repairTypes.map((rt) => (<MenuItem key={rt} value={rt}>{rt}</MenuItem>))}
          </Select>
        </FormControl>
        <Button
          fullWidth variant="contained"
          startIcon={bomLoading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
          disabled={bomLoading || !selectedRepairType}
          onClick={handleFetchBom}
          sx={{
            maxWidth: 340, background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
            borderRadius: "14px", height: 52, fontSize: 16, fontWeight: 700, textTransform: "none",
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            "&:hover": { background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)" },
            "&:active": { transform: "scale(0.97)" },
          }}
        >
          {bomLoading ? "กำลังโหลด..." : "ดึงข้อมูล BOM"}
        </Button>
      </Box>

      {/* ─── Empty ─── */}
      {!bomData && !bomLoading && (
        <Box sx={{ p: 5, textAlign: "center", color: "text.secondary" }}>
          <InventoryIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
          <Typography variant="body2">เลือกประเภทการซ่อมแล้วกดดึงข้อมูล BOM</Typography>
        </Box>
      )}

      {/* ─── Content ─── */}
      {bomData && !bomLoading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* ── Header ── */}
          {headerSource && (
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <Box sx={{ px: 2.5, py: 1.5, background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", color: "#fff" }}>
                <Typography variant="subtitle2" fontWeight={800} letterSpacing={0.5}>📋 ข้อมูล BOM</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {Object.entries(headerLabels).map(([key, label]) => (
                  <Box key={key} sx={{ display: "flex", justifyContent: "space-between", py: 0.8, borderBottom: "1px solid #f1f5f9" }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} fontSize={13}>{label}</Typography>
                    <Typography variant="body2" fontWeight={600} color="#0f172a" fontSize={13} sx={{ textAlign: "right" }}>
                      {headerSource[key] ?? "-"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* ── Line Items ── */}
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <Box sx={{ px: 2.5, py: 1.5, background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight={800} letterSpacing={0.5}>🔩 รายการอะไหล่</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label={`${lines.length} รายการ`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, fontSize: 11 }} />
                <IconButton size="small" onClick={() => setAddOpen(true)} sx={{ color: "#fff" }}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
            </Box>

            {lines.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">ไม่พบรายการอะไหล่</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 1 }}>
                {lines.map((item: any, idx: number) => (
                  <Box
                    key={item.id ?? idx}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1,
                      px: 1.5, py: 1, borderBottom: "1px solid #f1f5f9",
                      "&:last-child": { borderBottom: "none" },
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                  >
                    {/* ลำดับ */}
                    <Chip label={idx + 1} size="small" sx={{ fontWeight: 800, bgcolor: "#e0e7ff", color: "#3730a3", fontSize: 11, height: 24, minWidth: 32, flexShrink: 0 }} />

                    {/* รหัส + ชื่อ */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color="#0f172a" fontSize={13} noWrap>{item.no ?? "-"}</Typography>
                      <Typography variant="caption" color="text.secondary" fontSize={11} noWrap>{item.description ?? "-"}</Typography>
                    </Box>

                    {/* Inline Qty Input */}
                    <TextField
                      type="number"
                      size="small"
                      value={item.quantity ?? 0}
                      onChange={(e) => updateQty(idx, e.target.value)}
                      inputProps={{ style: { textAlign: "center", fontWeight: 700, fontSize: 14, padding: "4px 0" }, min: 0 }}
                      sx={{ width: 60, flexShrink: 0, "& .MuiOutlinedInput-root": { borderRadius: 2, height: 34 } }}
                    />
                    <Typography variant="caption" color="text.secondary" fontSize={10} sx={{ flexShrink: 0, minWidth: 28 }}>
                      {item.unitOfMeasureCode ?? ""}
                    </Typography>

                    <IconButton size="small" onClick={() => handleDelete(idx)} sx={{ color: "#ef4444", flexShrink: 0 }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* ═══ Add Item Dialog ═══ */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>เพิ่มอะไหล่</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="รหัสอะไหล่" size="small" fullWidth value={addNo} onChange={(e) => setAddNo(e.target.value)} />
            <TextField label="ชื่ออะไหล่" size="small" fullWidth value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
            <Stack direction="row" spacing={2}>
              <TextField label="จำนวน" type="number" size="small" value={addQty} onChange={(e) => setAddQty(e.target.value)} sx={{ flex: 1 }} />
              <TextField label="หน่วย" size="small" value={addUnit} onChange={(e) => setAddUnit(e.target.value)} sx={{ flex: 1 }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" disabled={!addNo} onClick={handleAdd} sx={{ fontWeight: 700, bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}>เพิ่ม</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
