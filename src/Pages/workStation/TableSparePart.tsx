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
import { useLocation, useParams } from "react-router-dom";
import { on } from "events";

const uid = () => Math.random().toString(36).slice(2, 8);

type SparePartApi = {
  workOrderComponentId: number;
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
  unit?: string;
  //orderid: string | number | null;
};

// type EditItem = {
//   //   id: string | number | null;
//   material: string;
//   qty: number;
//   max?: number;
//   //   imageUrl?: string;
//   //   materialDescription?: string;
//   //   onWithdraw?: boolean;
//   //   znew?: number | string | boolean;
// } | null;

export default function TableSparePart() {
  const { work, item_component, setItem_Component, deletePart } = useWork();
  const { orderId } = useParams();

  const location = useLocation();
  const row = location.state;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [dataSparePart, setDataSparePart] = useState<SparePartApi[]>([]);
  const [selectedSparePart, setSelectedSparePart] =
    useState<SparePartApi | null>(null);
  const [selectedQty, setSelectedQty] = useState<string>("1");
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  // Edit QTY
  const [openEditQty, setOpenEditQty] = useState(false);
  const [editItem, setEditItem] = useState<{
    material: string;
    materialDescription: string;
    qty: string;
    max?: number;
  } | null>(null);

  const [editQty, setEditQty] = useState<string>("1");

  // Delete QTY
  type DeleteState = {
    material: string | number | null;
    materialDescription: string;
  } | null;

  useEffect(() => console.log("cart:", cart), [cart]);

  useEffect(() => {
    if (orderId) onInit();
  }, [orderId]);

  const onInit = async () => {
    const spareList = await onLoad();
    if (spareList) {
      await onLoadOldPart(spareList);
    }
  };

  const onLoad = async () => {
    console.log("orderId from URL: ", orderId);
    let res = await callApi.get("/Mobile/RemainingSparepart");
    const dataSparePartList = res.data.dataResult.sparepartList;
    console.log("on load get spare part : ", dataSparePartList);
    setDataSparePart(dataSparePartList);
    return dataSparePartList;
  };

  const onLoadOldPart = async (spareList: SparePartApi[] = []) => {
    if (!orderId) return;

    const res = await callApi.get(
      `/WorkOrderList/items_component/${orderId}`
    );
    const dataOldPart = res.data.dataResult;
    console.log("load old part : ", dataOldPart);

    if (Array.isArray(dataOldPart)) {
      const cartFromOldPart: Record<string, CartItem> = {};
      console.log("spareList length:", spareList.length);

      dataOldPart.forEach((item: any, idx: number) => {
        console.log(`[${idx}] Processing item:`, {
          material: item.material,
          reS_ITEM: item.reS_ITEM,
          actuaL_QUANTITY: item.actuaL_QUANTITY,
          matL_DESC: item.matL_DESC
        });

        let matKey = item.material;

        // Fallback: If material is missing, try to recover it from master list using identifiers or description
        if (!matKey && spareList.length > 0) {
          // Try matching by Description
          const descToMatch = item.matL_DESC || item.MATL_DESC || item.MatlDesc || item.materialDescription;
          console.log(`[${idx}] No material, trying desc match:`, descToMatch);
          if (descToMatch) {
            const found = spareList.find(s =>
              s.materialDescription === descToMatch ||
              s.materialDescription?.toLowerCase() === descToMatch.toLowerCase()
            );
            if (found) {
              matKey = found.material;
              console.log(`[${idx}] Found via desc:`, matKey);
            }
          }
        }

        // Final fallback
        if (!matKey) {
          matKey = item.reS_ITEM || item.RES_ITEM;
          console.log(`[${idx}] Using reS_ITEM fallback:`, matKey);
        }

        console.log(`[${idx}] Final matKey:`, matKey, "qty:", item.actuaL_QUANTITY);

        if (matKey && item.actuaL_QUANTITY > 0) {

          // Lookup description if missing
          let desc = item.matL_DESC ?? item.MATL_DESC ?? item.MatlDesc ?? item.materialDescription;
          if (!desc) {
            const master = spareList.find((s: any) => s.material === matKey);
            desc = master?.materialDescription;
          }

          cartFromOldPart[matKey] = {
            item: {
              workOrderComponentId: item.worK_ORDER_COMPONENT_ID,
              material: matKey,
              materialDescription: desc || "",
            },
            qty: item.actuaL_QUANTITY,
            unit: item.actuaL_QUANTITY_UNIT,
          };
          console.log(`[${idx}] Added to cart:`, matKey);
        } else {
          console.log(`[${idx}] SKIPPED - matKey:`, matKey, "qty:", item.actuaL_QUANTITY);
        }
      });

      console.log("Final cartFromOldPart:", cartFromOldPart);
      setCart(cartFromOldPart);
      // Update item_component for the card list display
      const mappedComponents = dataOldPart.map((item: any) => {
        let desc = item.matL_DESC || item.MATL_DESC || item.MatlDesc || item.materialDescription;
        if (!desc) {
          const master = spareList.find((s: any) => s.material === item.material);
          desc = master?.materialDescription;
        }

        return {
          worK_ORDER_COMPONENT_ID: item?.worK_ORDER_COMPONENT_ID,
          orderid: item?.orderid,
          reserV_NO: item?.reserV_NO,
          reS_ITEM: item?.reS_ITEM || item?.material,
          matL_DESC: desc,
          actuaL_QUANTITY: item?.actuaL_QUANTITY,
          actuaL_QUANTITY_UNIT: item?.actuaL_QUANTITY_UNIT,
          material: item?.material,
        };
      });
      setItem_Component(mappedComponents);
    }
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
    const payload = Object.values(cart).map(({ item, qty }) => ({
      workOrderComponentId: item.workOrderComponentId,
      workOrder: orderId,
      material: item.material,
      matlDesc: item.materialDescription,
      requirementQuantity: qty,
      requirementQuantityUnit: row?.actuaL_QUANTITY_UNIT || "EA",
      moveType: true,
    }));

    if (payload.length === 0) return;

    try {
      Swal.fire({
        title: "กำลังบันทึก...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      console.log("payload : ", payload);

      const res = await callApi.post(
        `/Mobile/SetWorkOrderSparePart?OrderId=${orderId}`,
        payload
      );

      console.log("save result:", res.data);

      if (res.data.isSuccess === true) {
        await Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "บันทึกข้อมูลเรียบร้อย",
          confirmButtonText: "ตกลง",
        });

        // Reload data to update cards
        const spareList = await onLoad();
        if (spareList) {
          await onLoadOldPart(spareList);
        }
      } else {
        await Swal.fire({
          icon: "error",
          title: "ผิดพลาด",
          text: res.data.dataResult.message || "ไม่สามารถบันทึกข้อมูลได้",
          confirmButtonText: "ปิด",
        });
      }

      setCart({});
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        confirmButtonText: "ปิด",
      });
    }
  };

  const handleEditQty = async () => {
    try {
      if (!editItem) return;

      const newQty = Math.max(1, Number(editQty || 1));

      // Build payload from item_component (same approach as WorkStation)
      const payload = (item_component || []).map((item: any) => {
        const matCode = item.material || item.reS_ITEM || "";
        // If this is the item we are editing, use the new quantity
        if (matCode === editItem.material) {
          return {
            workOrderComponentId: item.worK_ORDER_COMPONENT_ID,
            workOrder: orderId,
            material: item.reS_ITEM || item.material,
            matL_DESC: item.matL_DESC,
            requirementQuantity: newQty,
            requirementQuantityUnit: item.actuaL_QUANTITY_UNIT || "EA",
            moveType: true,
          };
        }
        // Otherwise use existing quantity
        return {
          workOrderComponentId: item.worK_ORDER_COMPONENT_ID,
          workOrder: orderId,
          material: item.reS_ITEM || item.material,
          matL_DESC: item.matL_DESC,
          requirementQuantity: item.actuaL_QUANTITY,
          requirementQuantityUnit: item.actuaL_QUANTITY_UNIT || "EA",
          moveType: true,
        };
      });

      Swal.fire({
        title: "กำลังบันทึก...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await callApi.post(
        `/Mobile/SetWorkOrderSparePart?OrderId=${orderId}`,
        payload
      );

      if (res.data.isSuccess === true) {
        await Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "บันทึกข้อมูลเรียบร้อย",
          timer: 1500,
          showConfirmButton: false,
        });

        setOpenEditQty(false);
        // Reload data from server
        await onInit();
      } else {
        await Swal.fire({
          icon: "error",
          title: "ผิดพลาด",
          text: res.data.dataResult?.message || "ไม่สามารถบันทึกข้อมูลได้",
          confirmButtonText: "ปิด",
        });
      }

    } catch (error) {
      console.error("Edit Qty Error: ", error);
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        confirmButtonText: "ปิด",
      });
    }
  };

  const handleDeleteItem = async (itemId: any) => {
    await deletePart(itemId);
    const spareList = await onLoad();
    if (spareList) {
      await onLoadOldPart(spareList);
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
                "&:hover": { bgcolor: "#1565C0" },
              }}
            >
              เพิ่มอะไหล่
            </Button>
          </Stack>

          {/* ── Spare Part List ── */}
          {(item_component ?? []).length === 0 ? (
            <Fade in={true}>
              <Box sx={{ textAlign: "center", py: 10 }}>
                <InventoryIcon sx={{ fontSize: 56, color: "#CBD5E1", mb: 1.5 }} />
                <Typography variant="h6" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                  ไม่พบรายการอะไหล่
                </Typography>
                <Typography variant="body2" sx={{ color: "#B0BEC5", mt: 0.5 }}>
                  กดปุ่ม "เพิ่มอะไหล่" เพื่อเริ่มเพิ่มรายการ
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Stack spacing={0}>
              {/* Table Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "#F8FAFC",
                  borderRadius: "12px 12px 0 0",
                  border: "1px solid #E2E8F0",
                  borderBottom: "2px solid #E2E8F0",
                }}
              >
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  รายการอะไหล่
                </Typography>
                <Typography variant="caption" sx={{ width: 100, textAlign: "center", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  จำนวน
                </Typography>
                <Typography variant="caption" sx={{ width: 100, textAlign: "center", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  จัดการ
                </Typography>
              </Box>

              {/* Rows */}
              {(item_component ?? []).map((p, idx) => {
                const matCode = p.material || p.reS_ITEM || "";
                const qty = cart[matCode]?.qty ?? p.actuaL_QUANTITY ?? 0;
                const unit = p.actuaL_QUANTITY_UNIT || cart[matCode]?.unit || "";

                return (
                  <Box
                    key={p.worK_ORDER_COMPONENT_ID}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 2.5,
                      py: 2,
                      bgcolor: idx % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                      borderLeft: "1px solid #E2E8F0",
                      borderRight: "1px solid #E2E8F0",
                      borderBottom: "1px solid #F1F5F9",
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "#F0F7FF" },
                      "&:last-child": {
                        borderRadius: "0 0 12px 12px",
                        borderBottom: "1px solid #E2E8F0",
                      },
                    }}
                  >
                    {/* ── Info ── */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#1E293B",
                          lineHeight: 1.3,
                        }}
                        noWrap
                      >
                        {p.matL_DESC || "-"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#94A3B8", mt: 0.25, display: "block" }}
                        noWrap
                      >
                        {matCode}
                      </Typography>
                    </Box>

                    {/* ── Qty ── */}
                    <Box sx={{ width: 100, textAlign: "center" }}>
                      <Chip
                        label={`${qty}${unit ? ` ${unit}` : ""}`}
                        size="small"
                        sx={{
                          bgcolor: "#EFF6FF",
                          color: "#2563EB",
                          border: "1px solid #DBEAFE",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          minWidth: 50,
                        }}
                      />
                    </Box>

                    {/* ── Actions ── */}
                    <Stack direction="row" spacing={0.5} sx={{ width: 100, justifyContent: "center" }}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "#3b82f6",
                          bgcolor: "#EFF6FF",
                          border: "1px solid #DBEAFE",
                          "&:hover": { bgcolor: "#DBEAFE" },
                        }}
                        onClick={() => {
                          const spare = (dataSparePart ?? []).find(
                            (s: any) => s.material === matCode
                          );
                          const max =
                            typeof spare?.znew === "number"
                              ? spare.znew
                              : typeof spare?.znew === "string"
                                ? Number(spare.znew)
                                : undefined;

                          setEditItem({
                            material: matCode,
                            materialDescription: p.matL_DESC ?? "",
                            qty: String(p.actuaL_QUANTITY ?? 0),
                            max: max,
                          });
                          setEditQty(String(p.actuaL_QUANTITY ?? 0));
                          setOpenEditQty(true);
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        sx={{
                          color: "#ef4444",
                          bgcolor: "#FEF2F2",
                          border: "1px solid #FECACA",
                          "&:hover": { bgcolor: "#FECACA" },
                        }}
                        onClick={() => {
                          handleDeleteItem(p.worK_ORDER_COMPONENT_ID!);
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
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

                            {/* input กรอกจำนวนของรายการนี้ */}
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
              onClick={async () => {
                await handleSave();
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

      {/* Edit Qty Dialog */}
      <Dialog
        open={openEditQty}
        onClose={() => setOpenEditQty(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>แก้ไขจำนวน</DialogTitle>

        <DialogContent>
          {editItem && (
            <Stack spacing={2} mt={1}>
              <Typography fontWeight={700} color="#1976D2">
                {editItem.material}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  onClick={() => {
                    const n = Number(editQty);
                    if (n > 1) setEditQty(String(n - 1));
                  }}
                  sx={{
                    minWidth: 45,
                    height: 45,
                    borderRadius: 2,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  -
                </Button>
                <TextField
                  label="จำนวน"
                  type="number"
                  value={editQty}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = e.target.value;

                    if (v === "") {
                      setEditQty("");
                      return;
                    }

                    const n = Number(v);
                    if (Number.isNaN(n)) return;
                    if (n < 0) return;

                    setEditQty(v);
                  }}
                  onBlur={() => {
                    if (editQty === "" || Number(editQty) < 1) {
                      setEditQty("1");
                    }
                  }}
                  fullWidth
                  sx={{ "& input": { textAlign: "center" } }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const n = Number(editQty) || 0;
                    setEditQty(String(n + 1));
                  }}
                  sx={{
                    minWidth: 45,
                    height: 45,
                    borderRadius: 2,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  +
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditQty(false)}>Cancel</Button>

          <Button
            variant="contained"
            sx={{
              fontWeight: 800,
              bgcolor: "#1976D2",
              "&:hover": { bgcolor: "#1565C0" },
            }}
            onClick={() => {
              handleEditQty();
              setOpenEditQty(false);
            }}
          >
            Save นะ
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
