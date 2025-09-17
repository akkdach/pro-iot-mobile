import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import InvenHeader from "./Header";
import QRScanner from "../../Component/QRScanner";
import { useLocation } from "react-router-dom";
import callApi from "../../Services/callApi";
import Modal from "@mui/material/Modal";
import Swal from "sweetalert2";
// import ClearIcon from "@mui/icons-material/Clear";

const NewInventoryCount: React.FC = () => {
  const location = useLocation();
  const { countNo } = (location.state as { countNo: string }) || {};
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [openScanner, setOpenScanner] = useState(false);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!countNo) return;
    const fetchData = async () => {
      try {
        const res = await callApi.get(`/Inventory/Get_counting/${countNo}`);
        const result = res?.data?.dataResult?.result;
        if (result) {
          setProducts(
            result.line.map((p: any) => {
              const stock = Number(p.stock_qty);
              const actual = p.actual_qty;  // ค่านี้มาจาก DB
              return {
                id: String(p.material),
                name: p.description,
                stock_qty: stock,
                actual_qty: actual,
                countedQty: actual,
                countedQtyInput: String(actual),
                unit: p.unit,
                seq: p.seq,
              };
            })
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [countNo]);

  //Save จาก Modal
  const handleSaveModal = async () => {
    if (!selectedProduct) return;

    try {
      const finalQty = parseInt(selectedProduct.countedQtyInput || "0", 10);

      // line payload สำหรับสินค้านี้
      const linePayload = [{
        count_no: Number(countNo),
        seq: selectedProduct.seq || 1,
        material: selectedProduct.id,
        description: selectedProduct.name,
        stock_qty: selectedProduct.stock_qty,
        actual_qty: finalQty,
        unit: selectedProduct.unit,
        create_at: new Date().toISOString(),
        create_by: "system",   // ใส่ user จริง
        update_at: new Date().toISOString(),
        update_by: "system",   // ใส่ user จริง
      }];

      // header payload
      const hdPayload = {
        count_no: Number(countNo),
        wk_ctr: "default",
        count_movement: true,
        count_status: "InProgress",
        count_total: finalQty,
        create_at: new Date().toISOString(),
        posting_date: new Date().toISOString(),
        posting_by: "system", // หรือ user login
      };

      // เรียก API
      const res = await callApi.post(
        `/Inventory/Update_counting/${countNo}`,
        { hd: hdPayload, line: linePayload }
      );

      if (res.data?.isSuccess) {
        // อัปเดต state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id
              ? { ...p, countedQty: finalQty, countedQtyInput: String(finalQty) }
              : p
          )
        );

        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          text: res.data?.message || `แก้ไขจำนวนของ ${selectedProduct.id} เรียบร้อย`,
        });

        setModalOpen(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "บันทึกไม่สำเร็จ",
          text: res.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
    }
  };


  // ปุ่ม Save ใหม่ (รวมทั้งหมด)
  const handleSaveAll = async () => {
    try {
      // เลือกเฉพาะรายการที่แก้ไข
      const linePayload = products
        .filter((p) => p.countedQtyInput !== String(p.countedQty))
        .map((p, idx) => ({
          count_no: Number(countNo),
          seq: p.seq || idx + 1,
          material: p.id,
          description: p.name,
          stock_qty: p.stock_qty,
          actual_qty: parseInt(p.countedQtyInput || "0", 10),
          unit: p.unit,
          create_at: new Date().toISOString(),
          create_by: "system",
          update_at: new Date().toISOString(),
          update_by: "system",
        }));

      if (linePayload.length === 0) {
        Swal.fire({
          icon: "info",
          title: "ไม่มีการเปลี่ยนแปลง",
          text: "คุณยังไม่ได้แก้ไขจำนวน On Hand",
        });
        return;
      }

      // header object
      const hdPayload = {
        count_no: Number(countNo),
        wk_ctr: "default",       // คุณต้องใส่ค่าจริง
        count_movement: true,
        count_status: "InProgress",
        count_total: linePayload.reduce((sum, l) => sum + l.actual_qty, 0),
        create_at: new Date().toISOString(),
        posting_date: new Date().toISOString(),
        posting_by: "system",    // หรือ user login
      };

      // เรียก API
      const res = await callApi.post(
        `/Inventory/Update_counting/${countNo}`,
        { hd: hdPayload, line: linePayload }
      );

      if (res.data?.isSuccess) {
        setProducts((prev) =>
          prev.map((p) =>
            p.countedQtyInput !== String(p.countedQty)
              ? { ...p, countedQty: parseInt(p.countedQtyInput || "0") }
              : p
          )
        );

        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          text: res.data?.message || "อัปเดตจำนวน On Hand เรียบร้อยแล้ว",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "บันทึกไม่สำเร็จ",
          text: res.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
    }
  };


  const handleSearch = () => {
    const found = products.find(
      (p) =>
        p.id.toLowerCase() === search.toLowerCase()
      // || p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (found) {
      setSelectedProduct(found);
      setModalOpen(true);
    } else {
      Swal.fire({
        icon: "error",
        title: "ไม่พบอะไหล่",
        text: `ไม่พบข้อมูลสำหรับ "${search}"`,
      });
    }
  };



  const filtered = products.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase())
    // p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <InvenHeader title="New Inventory Counting" />
      <Box sx={{ p: 2, mt: 7, mb: 16, backgroundColor: "#f8f8f8ff" }}>
        {/* Search */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search or Scan Barcode..."
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              // endAdornment: searchTerm && (
              //   <InputAdornment position="end">
              //     <IconButton
              //       aria-label="clear search"
              //       onClick={() => setSearchTerm("")}
              //       edge="end"
              //     >
              //       <ClearIcon />
              //     </IconButton>
              //   </InputAdornment>
              // ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setOpenScanner(true)}>
                    <QrCode2Icon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {openScanner && (
          <QRScanner
            open={openScanner}
            onClose={() => setOpenScanner(false)}
            onScan={(value) => console.log("Scanned:", value)}
          />
        )}

        {/* Product List */}
        {filtered.length > 0 ? (
          filtered.map((item, index) => {
            return (
              <Box
                key={item.id + index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <Box sx={{ maxWidth: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                    Material: {item.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                    Stock: {item.stock_qty} {item.unit}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <TextField
                    type="number"
                    size="small"
                    label="On Hand"
                    value={item.countedQtyInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === item.id ? { ...p, countedQtyInput: val } : p
                        )
                      );
                    }}
                    sx={{ width: 80 }}
                  />

                </Box>
              </Box>
            );
          })
        ) : (
          <Box sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}>
            No product found.
          </Box>
        )}
        <Box
          sx={{
            position: "fixed",
            bottom: 65,
            left: 0,
            right: 0,
            p: 2,
            // height: 45,
            backgroundColor: "#fff",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
            zIndex: 100,
          }}
        >
          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ borderRadius: 14, py: 1.5, fontSize: 16, height: 40 }}
            onClick={handleSaveAll}
          >
            บันทึกทั้งหมด
          </Button>
        </Box>
      </Box>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            p: 3,
            backgroundColor: "#fff",
            borderRadius: 2,
            // maxWidth: 250,
            mx: "auto",
            mt: "40%",
            ml: '5%',
            mr: '5%',
            boxShadow: 24,
          }}
        >
          {selectedProduct && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedProduct.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Material: {selectedProduct.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Stock: {selectedProduct.stock_qty} {selectedProduct.unit}
              </Typography>

              <TextField
                type="number"
                size="small"
                label="On Hand"
                value={selectedProduct.countedQtyInput}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    countedQtyInput: e.target.value,
                  })
                }
                sx={{ mt: 2, width: "100%" }}
              />

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" onClick={handleSaveModal} color="success" sx={{ borderRadius: 14, }}>
                  ยืนยัน
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default NewInventoryCount;
