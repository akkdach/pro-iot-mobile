import React, { useEffect, useMemo, useState } from "react";
import AppHearder from "../../Component/AppHeader";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Swal from "sweetalert2";


import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  MenuItem,
} from "@mui/material";

import callApi from "../../Services/callApi";
import { on } from "events";

type SparePart = {
  material: string;
  materialDescription?: string | null;
  znew?: number | null; // stock
  onWithdraw?: boolean | null;
  imageUrl?: string | null;
};

type CartMap = Record<string, { item: SparePart; qty: number }>;

const AddSpareFromStock: React.FC = () => {
  // ===== page =====
  const [open, setOpen] = useState(false);

  // ===== dialog states =====
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [dataSparePart, setDataSparePart] = useState<SparePart[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartMap>({});
  const [selectButton, setSelectButton] = useState("");
  const [workCenters, setWorkCenters] = useState<string[]>([
    "3FL1",
    "NRTT222",
    "NRTW152",
    "Test123"
  ]);
  const [selectedWC, setSelectedWC] = useState<string>("");

  const cartKinds = Object.keys(cart).length;
  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, x) => sum + (x.qty || 0), 0),
    [cart]
  );

  const filteredSpareParts = useMemo(() => {
    const k = search.trim().toLowerCase();
    if (!k) return dataSparePart ?? [];
    return (dataSparePart ?? []).filter((sp) =>
      `${sp.material} ${sp.materialDescription ?? ""}`.toLowerCase().includes(k)
    );
  }, [search, dataSparePart]);

  // ===== axios when open =====
  useEffect(() => {
    onLoad();
    if (!open) return;
  }, []);

  useEffect(() => {
    onLoad2();
  }, [selectedWC]);

  const onLoad = async () => {
    const res = await callApi.get(`/Mobile/TranferRequestTo_ddl`);
    const data = res.data?.dataResult ?? res?.data ?? [];
    console.log("data get from TranferRequestTo_ddl : ", data);
    setWorkCenters(data);
  };

  const onLoad2 = async () => {
    if (!selectedWC) return;
    setLoading(true);
    setError("");
    try {
      const res = await callApi.get(`/Mobile/TranferRequestSparepartList`, {
        params: {
          stge_loc: selectedWC,
          material_type: ""
        }
      });
      const data = res.data.dataResult || [];
      console.log("data get from TranferRequestSparepartList : ", data);

      const arr: SparePart[] = data.map((x: any) => ({
        ...x,
        znew: x.quantity // map quantity to znew
      }));
      setDataSparePart(arr);
    } catch (e) {
      setDataSparePart([]);
      setError("โหลดรายการอะไหล่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ===== cart helpers =====
  const addOne = (sp: SparePart) => {
    setCart((prev) => {
      const existing = prev[sp.material];
      const max = sp.znew ?? 999999;
      const nextQty = Math.min((existing?.qty ?? 0) + 1, max);

      return { ...prev, [sp.material]: { item: sp, qty: nextQty } };
    });
  };

  const removeOne = (material: string) => {
    setCart((prev) => {
      const existing = prev[material];
      if (!existing) return prev;

      const nextQty = (existing.qty ?? 0) - 1;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[material];
        return copy;
      }
      return { ...prev, [material]: { ...existing, qty: nextQty } };
    });
  };

  const setQty = (sp: SparePart, qty: number) => {
    const max = sp.znew ?? 999999;
    const n = Math.max(1, Math.min(Math.floor(qty), max));
    setCart((prev) => ({ ...prev, [sp.material]: { item: sp, qty: n } }));
  };

  const removeItem = (material: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[material];
      return copy;
    });
  };

  const clearAll = () => setCart({});

  // ===== save (POST) =====
  const handleSave = async () => {
    if (cartKinds === 0) return;
    setOpen(false);

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก?",
      html: `คุณเลือก <b>${cartKinds}</b> รายการ<br/>รวม <b>${cartCount}</b> ชิ้น`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563EB",
      cancelButtonColor: "#94A3B8",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);
    setError("");

    Swal.fire({
      title: "กำลังบันทึก...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const payload = {
        stge_loc: selectedWC,
        material_type: "",
        items: Object.values(cart).map(({ item, qty }) => ({
          material: item.material,
          quantity: qty,
          description: item.materialDescription,

        })),
      };

      console.log("payload : ", payload);

      await callApi.post(`/Mobile/ReservationRequest`, payload);

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "ทำรายการขอเบิกอะไหล่เรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#2563EB",
      });

      clearAll();
      setOpen(false);
    } catch (e) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: "เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล",
        confirmButtonText: "ปิด",
        confirmButtonColor: "#EF4444",
      });

      setError("บันทึกไม่สำเร็จ (POST error)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, background: "#f5f6fa", minHeight: "100vh" }}>
      <AppHearder title="Add Spare Part From Stock" icon={<SettingsIcon />} />

      {/* Page Card */}
      <Paper
        sx={{
          mt: 7,
          p: 2,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h5" fontWeight={900} color="#2d3a4b">
              เพิ่มอะไหล่จากสต็อก
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              px: 3,
            }}
          >
            เลือกอะไหล่
          </Button>
        </Stack>
      </Paper>

      {/* ===== Dialog ===== */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>เลือกอะไหล่จากสต็อก</DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box
            sx={{ height: "70vh", display: "flex", flexDirection: "column" }}
          >
            {/* Search */}
            <Box sx={{ p: 2, pb: 1 }}>
              <TextField
                placeholder="ค้นหา Material / Description..."
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <TextField
                select
                size="small"
                label="Work Center"
                value={selectedWC}
                onChange={(e) => setSelectedWC(e.target.value)}
                sx={{ minWidth: 220, pt: 3 }}
              >
                <MenuItem value="">
                  <em>ทั้งหมด</em>
                </MenuItem>

                {workCenters.map((wc) => (
                  <MenuItem key={wc} value={wc}>
                    {wc}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Cart summary */}
            <Box sx={{ px: 2, pb: 1 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ color: "#1D4ED8", fontWeight: 900 }}>
                    เลือกแล้ว: {cartKinds} รายการ • รวม {cartCount} ชิ้น
                  </Typography>
                  <Button
                    variant="text"
                    onClick={clearAll}
                    disabled={cartKinds === 0}
                    sx={{ textTransform: "none", fontWeight: 900 }}
                  >
                    ล้างทั้งหมด
                  </Button>
                </Stack>

                {cartKinds === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mt: 0.75, textAlign: "center" }}
                  >
                    ยังไม่ได้เลือกอะไหล่
                  </Typography>
                ) : (
                  <Box sx={{ mt: 1, display: "grid", gap: 0.75 }}>
                    {Object.values(cart)
                      .slice(0, 3)
                      .map(({ item, qty }) => (
                        <Box
                          key={item.material}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            border: "1px solid #DBEAFE",
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={900} noWrap>
                              {item.material}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748B" }}
                              noWrap
                            >
                              {item.materialDescription || "-"}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Chip size="small" label={`x ${qty}`} />
                            <IconButton
                              size="small"
                              onClick={() => removeItem(item.material)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Box>
                      ))}
                    {cartKinds > 3 && (
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        และอีก {cartKinds - 3} รายการ…
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            <Divider />

            {/* List scroll */}
            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : null}

              {loading ? (
                <Stack spacing={1}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Paper key={i} sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography fontWeight={800}>Loading...</Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Stack spacing={1.25}>
                  {filteredSpareParts.map((sp) => {
                    const selected = cart[sp.material];
                    const qty = selected?.qty ?? 0;
                    const max = sp.znew ?? 999999;
                    const outOfStock = (sp.znew ?? 0) <= 0;

                    return (
                      <Paper
                        key={sp.material}
                        variant="outlined"
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          borderColor: qty > 0 ? "#93C5FD" : "rgba(0,0,0,0.12)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography fontWeight={900} noWrap>
                              {sp.material}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748B" }}
                              noWrap
                            >
                              {sp.materialDescription || "-"}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={1}
                              mt={0.75}
                              flexWrap="wrap"
                            >
                              <Chip
                                size="small"
                                label={`Stock: ${sp.znew ?? "-"}`}
                                sx={{
                                  bgcolor: "#EFF6FF",
                                  color: "#1D4ED8",
                                  border: "1px solid #DBEAFE",
                                  fontWeight: 900,
                                }}
                              />
                              <Chip
                                size="small"
                                label={`ค้างเบิก: ${sp.onWithdraw ? "Yes" : "No"
                                  }`}
                                sx={{
                                  bgcolor: sp.onWithdraw
                                    ? "#FEF9C3"
                                    : "#F1F5F9",
                                  border: "1px solid #E2E8F0",
                                  fontWeight: 900,
                                }}
                              />
                            </Stack>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {qty === 0 ? (
                              <Button
                                variant="contained"
                                disabled={outOfStock}
                                onClick={() => addOne(sp)}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 900,
                                  borderRadius: 2,
                                  px: 2.5,
                                  bgcolor: "#2563EB",
                                  "&:hover": { bgcolor: "#1D4ED8" },
                                  boxShadow: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                เลือก
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outlined"
                                  onClick={() => removeOne(sp.material)}
                                  sx={{
                                    minWidth: 40,
                                    px: 0,
                                    borderRadius: 2,
                                    fontWeight: 900,
                                  }}
                                >
                                  -
                                </Button>

                                <TextField
                                  value={String(qty)}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === "") return;
                                    const n = Number(v);
                                    if (Number.isNaN(n)) return;
                                    setQty(sp, n);
                                  }}
                                  onBlur={(e) => {
                                    const n = Number(e.target.value);
                                    if (!Number.isFinite(n) || n < 1)
                                      setQty(sp, 1);
                                    if (sp.znew != null && n > sp.znew)
                                      setQty(sp, sp.znew);
                                  }}
                                  size="small"
                                  inputProps={{
                                    inputMode: "numeric",
                                    min: 1,
                                    max,
                                  }}
                                  sx={{ width: 86 }}
                                />

                                <Button
                                  variant="outlined"
                                  onClick={() => addOne(sp)}
                                  disabled={qty >= max}
                                  sx={{
                                    minWidth: 40,
                                    px: 0,
                                    borderRadius: 2,
                                    fontWeight: 900,
                                  }}
                                >
                                  +
                                </Button>

                                <Button
                                  variant="text"
                                  onClick={() => removeItem(sp.material)}
                                  sx={{
                                    textTransform: "none",
                                    color: "#EF4444",
                                    fontWeight: 900,
                                  }}
                                >
                                  ลบ
                                </Button>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}

                  {filteredSpareParts.length === 0 && (
                    <Box sx={{ p: 3, textAlign: "center", color: "#64748B" }}>
                      ไม่พบรายการอะไหล่
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
            ปิด
          </Button>
          <Button
            variant="contained"
            disabled={cartKinds === 0 || saving}
            onClick={handleSave}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              bgcolor: "#2563EB",
              "&:hover": { bgcolor: "#1D4ED8" },
              boxShadow: "none",
              borderRadius: 2,
              px: 3,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddSpareFromStock;
