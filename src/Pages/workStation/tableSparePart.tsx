
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
  Fade,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AppHearder from "../../Component/AppHeader";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useWork } from "../../Context/WorkStationContext";
import callApi from "../../Services/callApi";
import HideImageIcon from "@mui/icons-material/HideImage";
import SafeImage from "./SafeImage";
import Swal from "sweetalert2";

const uid = () => Math.random().toString(36).slice(2, 8);

type SparePartApi = {
  imageUrl?: string;
  material: string;
  materialDescription?: string;
  onWithdraw?: number;
  quotaStock?: number;
  znew?: number;
};

type CartItem = {
  item: SparePartApi;
  qty: number;
};

export default function TableSparePart() {
  const { work, item_component } = useWork();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | number>();
  const [dataSparePart, setDataSparePart] = useState<SparePartApi[]>([]);
  const [selectedSparePart, setSelectedSparePart] =
    useState<SparePartApi | null>(null);
  const [selectedQty, setSelectedQty] = useState<string>("1");
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  useEffect(() => {
    onLoad();
  }, []);

  const onLoad = async () => {
    //console.log("mn_wk_ctr : ", work?.mN_WK_CTR);
    console.log("orderid : ", work?.orderid);
    let res = await callApi.get("/Mobile/RemainingSparepart");
    const dataSparePartList = res.data.dataResult.sparepartList;
    console.log("on load get spare part : ", dataSparePartList);
    setDataSparePart(dataSparePartList);
  };

  // const [form, setForm] = useState<Omit<Part, "worK_ORDER_COMPONENT_ID">>({
  //   reserV_NO: "",
  //   reS_ITEM: "",
  //   actuaL_QUANTITY: 0,
  //   actuaL_QUANTITY_UNIT: "",
  //   matL_DESC: "",
  // });

  const openAdd = () => {
    setMode("add");
    //setEditingId(null);
    // setForm({ reserV_NO: "", reS_ITEM: "", actuaL_QUANTITY: 0, actuaL_QUANTITY_UNIT: "", matL_DESC: "" });
    setOpen(true);
  };

  // const openEdit = (p: Part) => {
  //   setMode("edit");
  //   setEditingId(p.worK_ORDER_COMPONENT_ID);
  //   setForm({
  //     reserV_NO: p.reserV_NO,
  //     reS_ITEM: p.reS_ITEM,
  //     actuaL_QUANTITY: p.actuaL_QUANTITY,
  //     actuaL_QUANTITY_UNIT: p.actuaL_QUANTITY_UNIT,
  //     matL_DESC: p.matL_DESC,
  //   });
  //   setOpen(true);
  // };

  const remove = (componentId: string) => {
    // if (!confirm("ต้องการลบรายการนี้หรือไม่?")) return;
    // setParts((prev) => prev.filter((p) => p.id !== id));
  };

  // const submit = () => {
  //   if (mode === "add") {
  //     setParts((prev) => [
  //       { worK_ORDER_COMPONENT_ID: uid(), ...form },
  //       ...prev,
  //     ]);
  //   } else {
  //     if (!editingId) return;
  //     setParts((prev) =>
  //       prev.map((p) =>
  //         p.worK_ORDER_COMPONENT_ID === editingId
  //           ? { worK_ORDER_COMPONENT_ID: uid(), ...form }
  //           : p
  //       )
  //     );
  //   }

  //   setOpen(false);
  // };

  // const addOne = (sp: SparePartApi) => {
  //   setCart((prev) => {
  //     const key = sp.material;
  //     const currentQty = prev[key]?.qty ?? 0;
  //     const max = sp.quotaStock ?? Infinity;
  //     const nextQty = Math.min(currentQty + 1, max);

  //     return {
  //       ...prev,
  //       [key]: { item: sp, qty: nextQty },
  //     };
  //   });
  // };

  const addOne = (sp: any) => {
    setCart((prev) => {
      const key = sp.material;
      const currentQty = prev[key]?.qty ?? 0;
      return { ...prev, [key]: { item: sp, qty: currentQty + 1 } };
    });
  };

  const removeOne = (material: string) => {
    setCart((prev) => {
      const current = prev[material];
      if (!current) return prev;

      const nextQty = current.qty - 1;
      if (nextQty <= 0) {
        const { [material]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [material]: { ...current, qty: nextQty } };
    });
  };

  const setQty = (sp: SparePartApi, qty: number) => {
    setCart((prev) => {
      const key = sp.material;
      const max = sp.quotaStock ?? Infinity;
      const nextQty = Math.max(0, Math.min(qty, max));

      if (nextQty === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: { item: sp, qty: nextQty },
      };
    });
  };

  const removeItem = (material: string) => {
    setCart((prev) => {
      const { [material]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSave = async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก",
      text: "คุณต้องการบันทึกข้อมูลหรือไม่?",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      // const selectedItems = Object.values(cart).map(
      //   ({ item, qty }) => ({
      //     material: item.material,
      //     materialDescription: item.materialDescription,
      //     qty,
      //     unit: item.znew,
      //   })
      // );

      // console.log("selectedItems:", selectedItems);

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "บันทึกข้อมูลเรียบร้อย",
        confirmButtonText: "ตกลง",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonText: "ปิด",
      });
    }
  };

  const cartCount = Object.values(cart).reduce((sum, x) => sum + x.qty, 0);
  const cartKinds = Object.keys(cart).length;

  return (
    <div>
      <AppHearder title="Spare Parts Inventory" icon={<InventoryIcon />} />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F4F8FB",
          color: "#0F172A",
          p: { xs: 2, sm: 4 },
          marginTop: 7,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
            mb={4}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ letterSpacing: -0.5, color: "#1D3557" }}
              >
                อะไหล่ในคลัง
              </Typography>
              <Typography variant="body1" sx={{ color: "#5C6F7C", mt: 0.5 }}>
                เลือกและจัดการอะไหล่ที่ต้องการใช้งานได้อย่างสะดวก
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAdd}
              sx={{
                fontWeight: 900,
                borderRadius: 3,
                textTransform: "none",
                bgcolor: "#1976D2",
                px: 3,
                py: 1.2,
                fontSize: 18,
                boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.08)",
                '&:hover': { bgcolor: "#1565C0" },
              }}
            >
              เพิ่มอะไหล่
            </Button>
          </Stack>

          {/* Cards (CSS grid) */}
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {(item_component ?? []).length === 0 ? (
              <Fade in={true}>
                <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 8 }}>
                  <InventoryIcon sx={{ fontSize: 60, color: '#B0BEC5', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#90A4AE' }}>
                    ไม่พบรายการอะไหล่ในคลัง
                  </Typography>
                </Box>
              </Fade>
            ) : (
              (item_component ?? []).map((p) => (
                <Card
                  key={p.worK_ORDER_COMPONENT_ID}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 4,
                    border: "1px solid #E3EAF2",
                    boxShadow: "0 2px 12px 0 rgba(25, 118, 210, 0.06)",
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.13)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={900} sx={{ lineHeight: 1.25, color: '#1976D2' }} noWrap>
                            {p.reS_ITEM}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#789" }} noWrap>
                            {p.reserV_NO}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>

                          <IconButton size="small" sx={{ color: "#1976D2", bgcolor: "#E3F2FD", border: "1px solid #BBDEFB", '&:hover': { bgcolor: "#BBDEFB" } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>

                          <IconButton size="small" sx={{ color: "#D32F2F", bgcolor: "#FFEBEE", border: "1px solid #FFCDD2", '&:hover': { bgcolor: "#FFCDD2" } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          
                        </Stack>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={`Qty: ${p.actuaL_QUANTITY} ${p.actuaL_QUANTITY_UNIT}`}
                          size="small"
                          sx={{
                            bgcolor: "#E3F2FD",
                            color: "#1976D2",
                            border: "1px solid #BBDEFB",
                            fontWeight: 700,
                          }}
                        />
                        <Typography variant="body2" sx={{ color: "#374151" }}>
                          <b>{p.matL_DESC}</b>
                        </Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                        <span>ID: {p.work_ORDER_COMPONENT_ID}</span>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Box>

        {/* Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ fontWeight: 800 }}>เลือกอะไหล่จากคลัง</DialogTitle>

          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                placeholder="ค้นหา Material / Description..."
                size="small"
                fullWidth
                // value={search}
                // onChange={(e) => setSearch(e.target.value)}
              />

              {/* Cart */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {/* Summary */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ color: "#1D4ED8", fontWeight: 800 }}>
                    เลือกแล้ว: {cartKinds} รายการ • รวม {cartCount} ชิ้น
                  </Typography>

                  <Button
                    variant="text"
                    onClick={() => setCart({})}
                    sx={{ textTransform: "none" }}
                  >
                    ล้างทั้งหมด
                  </Button>
                </Stack>

                {/* Details */}
                {Object.values(cart).length > 0 && (
                  <Box
                    sx={{
                      mt: 0.5,
                      display: "grid",
                      gap: 0.75,
                    }}
                  >
                    {Object.values(cart).map(({ item, qty }) => (
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
                        {/* left */}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>
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

                        {/* right */}
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={800}>x {qty}</Typography>

                          <Button
                            size="small"
                            variant="text"
                            onClick={() => removeItem(item.material)}
                            sx={{
                              textTransform: "none",
                              color: "#EF4444",
                              fontWeight: 700,
                            }}
                          >
                            ลบ
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Empty */}
                {Object.values(cart).length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", textAlign: "center", py: 1 }}
                  >
                    ยังไม่ได้เลือกอะไหล่
                  </Typography>
                )}
              </Box>

              {/* List */}
              <Box
                sx={{
                  display: "grid",
                  gap: 1.25,
                }}
              >
                {(dataSparePart ?? []).map((sp: any) => {
                  const selected = cart[sp.material];
                  const qty = selected?.qty ?? 0;
                  const max = sp.znew ?? 999999;
                  const outOfStock = (sp.znew ?? 0) <= 0;
                  return (
                    <Box
                      key={sp.material}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid #E2E8F0",
                        bgcolor: "white",
                      }}
                    >
                      {/* image */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          border: "1px solid #E2E8F0",
                          overflow: "hidden",
                          bgcolor: "#F8FAFC",
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {sp.imageUrl ? (
                          <SafeImage
                            src={sp.imageUrl}
                            alt={sp.material}
                            className="w-32 h-32 object-cover rounded"
                          />
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{ color: "#94A3B8" }}
                          >
                            ไม่มีรูปภาพ
                          </Typography>
                        )}
                      </Box>

                      {/* info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={800} noWrap>
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
                              fontWeight: 700,
                            }}
                          />

                          <Chip
                            size="small"
                            label={`ค้างเบิก : ${sp.onWithdraw ? "Yes" : "No"}`}
                            sx={{
                              bgcolor: sp.onWithdraw ? "#FEF9C3" : "#F1F5F9",
                              color: "#334155",
                              border: "1px solid #E2E8F0",
                              fontWeight: 700,
                            }}
                          />

                          <Chip
                            size="small"
                            label={`คงเหลือ : ${sp.znew ?? "-"}`}
                            sx={{
                              bgcolor: "#F1F5F9",
                              color: "#334155",
                              border: "1px solid #E2E8F0",
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </Box>

                      {/* action */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        {qty === 0 ? (
                          <Button
                            variant="contained"
                            disabled={outOfStock}
                            onClick={() => addOne(sp)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 800,
                              bgcolor: "#2563EB",
                              "&:hover": { bgcolor: "#1D4ED8" },
                              boxShadow: "none",
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
                                textTransform: "none",
                              }}
                            >
                              -
                            </Button>

                            {/* ✅ input กรอกจำนวนของรายการนี้ */}
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
                                if (!Number.isFinite(n) || n < 1) setQty(sp, 1);
                              }}
                              size="small"
                              inputProps={{ inputMode: "numeric", min: 1, max }}
                              sx={{ width: 90 }}
                            />

                            <Button
                              variant="outlined"
                              onClick={() => addOne(sp)}
                              disabled={qty >= max}
                              sx={{
                                minWidth: 40,
                                px: 0,
                                textTransform: "none",
                              }}
                            >
                              +
                            </Button>

                            <Button
                              variant="text"
                              onClick={() => removeItem(sp.material)}
                              sx={{ textTransform: "none", color: "#EF4444" }}
                            >
                              ลบ
                            </Button>
                          </>
                        )}
                      </Stack>

                      {/* หน้า modal สำหรับกรอก QTY  */}
                      {selectedSparePart?.material === sp.material && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            borderRadius: 2,
                            bgcolor: "#F8FAFC",
                            border: "1px solid #DBEAFE",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <TextField
                              label="จำนวนที่ต้องการ"
                              type="number"
                              size="small"
                              value={selectedQty}
                              onChange={(e) => {
                                const v = e.target.value;

                                if (v === "") {
                                  setSelectedQty("");
                                  return;
                                }

                                const n = Number(v);
                                if (Number.isNaN(n)) return;

                                if (n < 0) return;

                                if (sp.znew != null && n > sp.znew) {
                                  setSelectedQty(String(sp.znew));
                                  return;
                                }

                                setSelectedQty(v);
                              }}
                              onBlur={() => {
                                if (
                                  selectedQty === "" ||
                                  Number(selectedQty) < 1
                                ) {
                                  setSelectedQty("1");
                                }
                              }}
                              sx={{ width: 160 }}
                            />

                            <Typography
                              variant="body2"
                              sx={{ color: "#64748B" }}
                            >
                              คงเหลือ {sp.znew ?? "-"}
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* empty state */}
              {(dataSparePart ?? []).length === 0 && (
                <Box sx={{ p: 3, textAlign: "center", color: "#64748B" }}>
                  ไม่พบรายการอะไหล่
                </Box>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpen(false)}
              sx={{ textTransform: "none" }}
            >
              ปิด
            </Button>
            <Button
              variant="contained"
              disabled={Object.keys(cart).length === 0}
              onClick={() => {
                // const selectedItems = Object.values(cart).map(
                //   ({ item, qty }) => ({
                //     material: item.material,
                //     materialDescription: item.materialDescription,
                //     qty,
                //     unit: item.znew,
                //   })
                // );

                // console.log("selectedItems:", selectedItems);

                handleSave();

                setOpen(false);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#2563EB",
                "&:hover": { bgcolor: "#1D4ED8" },
                boxShadow: "none",
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}