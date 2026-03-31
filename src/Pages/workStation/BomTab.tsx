import React, { useState, useCallback } from "react";
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
  Autocomplete,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InventoryIcon from "@mui/icons-material/Inventory";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useWork } from "../../Context/WorkStationContext";
import { useParams } from "react-router-dom";
import callApi from "../../Services/callApi";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

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
  const { orderId } = useParams();
  const [selectedRepairType, setSelectedRepairType] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Add Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addNo, setAddNo] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addQty, setAddQty] = useState("1");
  const [addUnit, setAddUnit] = useState("PCE");

  // Material Master
  const [materialMaster, setMaterialMaster] = useState<any[]>([]);
  const [materialLoading, setMaterialLoading] = useState(false);

  const fetchMaterialMaster = useCallback(async () => {
    if (materialMaster.length > 0) return; // already loaded
    setMaterialLoading(true);
    try {
      const res = await callApi.get("/Mobile/GetMaterialMaster");
      const list: any[] = res.data?.dataResult || res.data?.data || [];
      console.log("✅ Material Master:", list.length, "items");
      setMaterialMaster(list);
    } catch (err) {
      console.error("Material Master Error:", err);
    } finally {
      setMaterialLoading(false);
    }
  }, [materialMaster.length]);

  const handleFetchBom = () => {
    if (!selectedRepairType) { alert("กรุณาเลือกประเภทการซ่อมก่อน"); return; }
    const hdr = workOrderDetail?.header ?? {};
    const orderType = work?.ordeR_TYPE ?? hdr?.orderType ?? "";
    const objectType = hdr?.objectType ?? work?.objecttype ?? "";
    if (!orderType) { alert("ไม่พบข้อมูล Order Type"); return; }
    setSaved(false);
    fetchBom(orderType, objectType, selectedRepairType);
    fetchMaterialMaster(); // โหลด master เพื่อ map ชื่อ
  };

  // สร้าง lookup map จาก materialMaster
  const materialNameMap: Record<string, string> = React.useMemo(() => {
    const map: Record<string, string> = {};
    materialMaster.forEach((m: any) => {
      if (m.material) map[m.material] = m.description || "";
    });
    return map;
  }, [materialMaster]);

  /* ── Inline Edit Qty ── */
  const updateQty = (idx: number, val: string) => {
    if (!Array.isArray(bomData)) return;
    const updated = [...bomData];
    updated[idx] = { ...updated[idx], quantity: val === "" ? "" : Math.max(0, Number(val) || 0) };
    setBomData(updated);
    setSaved(false);
  };

  /* ── Delete ── */
  const handleDelete = (idx: number) => {
    if (!Array.isArray(bomData)) return;
    setBomData(bomData.filter((_: any, i: number) => i !== idx));
    setSaved(false);
  };

  /* ── Add ── */
  const handleAdd = () => {
    const newItem = { id: Date.now(), no: addNo, description: addDesc, quantity: Math.max(0, Number(addQty) || 0), unitOfMeasureCode: addUnit };
    setBomData([...(Array.isArray(bomData) ? bomData : []), newItem]);
    setAddNo(""); setAddDesc(""); setAddQty("1"); setAddUnit("PCE");
    setAddOpen(false);
    setSaved(false);
  };

  /* ── Save BOM → SetWorkOrderSparePart ── */
  const handleSaveBom = async () => {
    const currentOrderId = work?.orderid ?? orderId;
    if (!currentOrderId) {
      Swal.fire({ icon: "warning", title: "ไม่พบ Order ID", text: "ไม่สามารถบันทึกได้" });
      return;
    }
    if (lines.length === 0) {
      Swal.fire({ icon: "warning", title: "ไม่มีรายการอะไหล่", text: "กรุณาเพิ่มรายการก่อนบันทึก" });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก",
      html: `บันทึกอะไหล่จาก BOM <b>${lines.length} รายการ</b> ลงใน Work Order?`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563EB",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const payload = lines.map((item: any) => ({
        workOrderComponentId: item.workOrderComponentId ?? 0,
        workOrder: currentOrderId,
        material: item.no ?? "",
        matlDesc: item.description ?? "",
        requirementQuantity: Number(item.quantity) || 0,
        requirementQuantityUnit: item.unitOfMeasureCode || "EA",
        moveType: true,
      }));

      console.log("📦 BOM Save Payload:", payload);

      const res = await callApi.post(
        `/Mobile/SetWorkOrderSparePart?OrderId=${currentOrderId}`,
        payload
      );

      if (res.data.isSuccess === true) {
        // === สร้าง Transfer Order ===
        const toItems = lines
          .filter((item: any) => (Number(item.quantity) || 0) > 0)
          .map((item: any) => ({
            material: item.no ?? "",
            quantity: Number(item.quantity) || 0,
            description: item.description ?? "",
          }));

        if (toItems.length > 0) {
          const deltaHtml = toItems
            .map((d: any) => `<div style="text-align:left;font-size:13px;">• ${d.material}: ${d.quantity} ${d.description}</div>`)
            .join("");

          const confirmTO = await Swal.fire({
            icon: "info",
            title: "สร้าง Transfer Order?",
            html: `<b>รายการอะไหล่:</b><br/><br/>${deltaHtml}`,
            showCancelButton: true,
            confirmButtonText: "สร้าง TO",
            cancelButtonText: "ข้าม",
            confirmButtonColor: "#2563EB",
          });

          if (confirmTO.isConfirmed) {
            try {
              const toPayload = {
                order_id: currentOrderId,
                stge_loc: work?.mN_WK_CTR || "1FL1",
                material_type: "",
                items: toItems,
              };

              console.log("📦 TO Payload:", JSON.stringify(toPayload, null, 2));

              const toRes = await callApi.post("/Mobile/ReservationRequest_create", toPayload);

              if (toRes.data.isSuccess) {
                // Log full response เพื่อดูโครงสร้าง
                console.log("✅ TO Create Full Response:", JSON.stringify(toRes.data, null, 2));

                // ดึง resId จาก response — ลองหลาย path
                const dr = toRes.data.dataResult;
                const resId = dr?.reS_ID ?? dr?.resId ?? dr?.res_id ?? dr?.id
                  ?? (Array.isArray(dr) && dr.length > 0 ? (dr[0]?.reS_ID ?? dr[0]?.resId ?? dr[0]?.res_id ?? dr[0]?.id) : null)
                  ?? toRes.data.reS_ID ?? toRes.data.resId ?? toRes.data.res_id ?? toRes.data.id;
                console.log("✅ TO Created, resId:", resId);

                if (resId) {
                  try {
                    const approveRes = await callApi.post(`/Mobile/ReservationRequest_approve/${resId}`);
                    console.log("✅ TO Approved:", approveRes.data);

                    if (approveRes.data.isSuccess) {
                      await Swal.fire({
                        icon: "success",
                        title: "สร้างและอนุมัติ TO สำเร็จ",
                        text: `TO #${resId} สร้างและอนุมัติเรียบร้อย (${toItems.length} รายการ)`,
                        timer: 2000,
                        showConfirmButton: false,
                      });
                    } else {
                      await Swal.fire({
                        icon: "warning",
                        title: "สร้าง TO สำเร็จ แต่อนุมัติไม่สำเร็จ",
                        text: approveRes.data.message || "กรุณาไปอนุมัติที่หน้า TO History",
                      });
                    }
                  } catch (approveErr: any) {
                    console.error("TO Approve Error:", approveErr);
                    await Swal.fire({
                      icon: "warning",
                      title: "สร้าง TO สำเร็จ แต่อนุมัติไม่สำเร็จ",
                      text: approveErr?.response?.data?.message || "กรุณาไปอนุมัติที่หน้า TO History",
                    });
                  }
                } else {
                  await Swal.fire({
                    icon: "success",
                    title: "สร้าง TO สำเร็จ",
                    text: `สร้าง Transfer Order เรียบร้อย (${toItems.length} รายการ)`,
                    timer: 2000,
                    showConfirmButton: false,
                  });
                }
              } else {
                await Swal.fire({
                  icon: "error",
                  title: "สร้าง TO ไม่สำเร็จ",
                  text: toRes.data.message || "เกิดข้อผิดพลาด",
                });
              }
            } catch (toErr: any) {
              console.error("TO Create Error:", toErr);
              await Swal.fire({
                icon: "error",
                title: "สร้าง TO ไม่สำเร็จ",
                text: toErr?.response?.data?.message || toErr?.message || "เกิดข้อผิดพลาด",
              });
            }
          }
        }

        setSaved(true);
        await Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: `บันทึกอะไหล่ ${lines.length} รายการเรียบร้อย`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "ผิดพลาด",
          text: res.data.dataResult?.message || res.data.message || "ไม่สามารถบันทึกข้อมูลได้",
        });
      }
    } catch (err: any) {
      console.error("BOM Save Error:", err);
      await Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาดในการบันทึก",
      });
    } finally {
      setSaving(false);
    }
  };

  const lines: any[] = Array.isArray(bomData) ? bomData : [];
  const headerSource = lines.length > 0 ? lines[0] : null;

  return (
    <Box sx={{ pb: 4 }}>
      {/* ─── Dropdown + Fetch ─── */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 3 }}
      >
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
      </MotionBox>

      {/* ─── Empty ─── */}
      <AnimatePresence>
        {!bomData && !bomLoading && (
          <MotionBox
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            sx={{ p: 5, textAlign: "center", color: "text.secondary" }}
          >
            <InventoryIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="body2">เลือกประเภทการซ่อมแล้วกดดึงข้อมูล BOM</Typography>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* ─── Content ─── */}
      <AnimatePresence>
        {bomData && !bomLoading && (
          <MotionBox
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >

            {/* ── Header ── */}
            {headerSource && (
              <MotionPaper
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                elevation={0}
                sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}
              >
                <Box sx={{ px: 2.5, py: 1.5, background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", color: "#fff" }}>
                  <Typography variant="subtitle2" fontWeight={800} letterSpacing={0.5}>📋 ข้อมูล BOM</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  {Object.entries(headerLabels).map(([key, label], i) => (
                    <MotionBox
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                      sx={{ display: "flex", justifyContent: "space-between", py: 0.8, borderBottom: "1px solid #f1f5f9" }}
                    >
                      <Typography variant="body2" color="text.secondary" fontWeight={600} fontSize={13}>{label}</Typography>
                      <Typography variant="body2" fontWeight={600} color="#0f172a" fontSize={13} sx={{ textAlign: "right" }}>
                        {headerSource[key] ?? "-"}
                      </Typography>
                    </MotionBox>
                  ))}
                </Box>
              </MotionPaper>
            )}

            {/* ── Line Items ── */}
            <MotionPaper
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              elevation={0}
              sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}
            >
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
                  <AnimatePresence>
                    {lines.map((item: any, idx: number) => (
                      <MotionBox
                        key={item.id ?? `bom-${idx}`}
                        layout
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
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
                          <Typography variant="body2" fontWeight={700} color="#0f172a" fontSize={13} noWrap>
                            {materialNameMap[item.no] || item.description || item.no || "-"}
                          </Typography>
                          {(materialNameMap[item.no] || item.description) && (
                            <Typography variant="caption" color="text.secondary" fontSize={11} noWrap>
                              {item.no ?? "-"}
                            </Typography>
                          )}
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
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                </Box>
              )}
            </MotionPaper>

            {/* ── Save Button ── */}
            {lines.length > 0 && (
              <MotionBox
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  disabled={saving || lines.length === 0}
                  onClick={handleSaveBom}
                  startIcon={
                    saving ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : saved ? (
                      <CheckCircleRoundedIcon />
                    ) : (
                      <SaveRoundedIcon />
                    )
                  }
                  sx={{
                    height: 56,
                    borderRadius: "14px",
                    fontSize: 17,
                    fontWeight: 800,
                    textTransform: "none",
                    background: saved
                      ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                      : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    boxShadow: saved
                      ? "0 4px 14px rgba(22,163,74,0.35)"
                      : "0 4px 14px rgba(245,158,11,0.35)",
                    "&:hover": {
                      background: saved
                        ? "linear-gradient(135deg, #15803d 0%, #166534 100%)"
                        : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                    },
                    "&:active": { transform: "scale(0.97)" },
                    "&:disabled": {
                      background: "#94a3b8",
                      color: "#fff",
                    },
                    transition: "background 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {saving
                    ? "กำลังบันทึก..."
                    : saved
                      ? "บันทึกสำเร็จ ✓"
                      : `บันทึกอะไหล่ (${lines.length} รายการ)`}
                </Button>
              </MotionBox>
            )}

          </MotionBox>
        )}
      </AnimatePresence>

      {/* ═══ Add Item Dialog ═══ */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullWidth
        maxWidth="xs"
        TransitionProps={{
          onEnter: () => fetchMaterialMaster(),
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>เพิ่มอะไหล่</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Autocomplete
              options={materialMaster}
              loading={materialLoading}
              getOptionLabel={(opt: any) =>
                opt.material && opt.description
                  ? `${opt.material} — ${opt.description}`
                  : opt.material || opt.description || ""
              }
              filterOptions={(options, { inputValue }) => {
                const term = inputValue.toLowerCase();
                return options.filter((o: any) =>
                  (o.material || "").toLowerCase().includes(term) ||
                  (o.description || "").toLowerCase().includes(term)
                ).slice(0, 50);
              }}
              onChange={(_, value: any) => {
                if (value) {
                  setAddNo(value.material || "");
                  setAddDesc(value.description || "");
                  setAddUnit(value.baseUom || value.unit || "PCE");
                }
              }}
              renderOption={(props, opt: any) => (
                <li {...props} key={opt.material}>
                  <Box>
                    <Typography fontSize={13} fontWeight={700} color="#1E293B">
                      {opt.material}
                    </Typography>
                    <Typography fontSize={11} color="text.secondary" noWrap>
                      {opt.description || "-"}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="ค้นหาอะไหล่"
                  size="small"
                  placeholder="พิมพ์รหัสหรือชื่ออะไหล่..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {materialLoading ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText="ไม่พบอะไหล่"
              loadingText="กำลังโหลด..."
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField label="รหัส" size="small" value={addNo} onChange={(e) => setAddNo(e.target.value)} sx={{ flex: 1 }} />
              <TextField label="ชื่อ" size="small" value={addDesc} onChange={(e) => setAddDesc(e.target.value)} sx={{ flex: 2 }} />
            </Stack>
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
