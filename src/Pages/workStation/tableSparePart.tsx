import React, { useState } from "react";
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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Part = {
  id: string;
  partNo: string;
  partName: string;
  qty: number;
  unit: string;
  location: string;
};

// const mockData: Part[] = [
//   { id: "9s41rp", partNo: "BRG-001", partName: "Bearing 6202", qty: 12, unit: "pcs", location: "A-01" },
//   { id: "08m6rx", partNo: "BLT-010", partName: "Bolt M10x30", qty: 150, unit: "pcs", location: "B-02" },
//   { id: "5ymtrc", partNo: "OIL-002", partName: "Hydraulic Oil", qty: 6, unit: "can", location: "C-01" },
//   { id: "ek5b97", partNo: "FLT-004", partName: "Air Filter", qty: 22, unit: "pcs", location: "A-03" },
// ];

const uid = () => Math.random().toString(36).slice(2, 8);

export default function TableSparePart() {
  //const [parts, setParts] = useState<Part[]>(mockData);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Part, "id">>({
    partNo: "",
    partName: "",
    qty: 0,
    unit: "",
    location: "",
  });

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm({ partNo: "", partName: "", qty: 0, unit: "", location: "" });
    setOpen(true);
  };

  const openEdit = (p: Part) => {
    setMode("edit");
    setEditingId(p.id);
    setForm({
      partNo: p.partNo,
      partName: p.partName,
      qty: p.qty,
      unit: p.unit,
      location: p.location,
    });
    setOpen(true);
  };

  const remove = (id: string) => {
    // if (!confirm("ต้องการลบรายการนี้หรือไม่?")) return;
    // setParts((prev) => prev.filter((p) => p.id !== id));
  };

  // const submit = () => {
  //   if (!form.partNo.trim() || !form.partName.trim()) {
  //     alert("กรอก Part No และ Part Name ให้ครบ");
  //     return;
  //   }

  //   if (mode === "add") {
  //     setParts((prev) => [{ id: uid(), ...form, qty: Number(form.qty) }, ...prev]);
  //   } else {
  //     if (!editingId) return;
  //     setParts((prev) =>
  //       prev.map((p) => (p.id === editingId ? { id: editingId, ...form, qty: Number(form.qty) } : p))
  //     );
  //   }

  //   setOpen(false);
  // };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f0f10", color: "white", p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Parts Inventory
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Mock data (UI only)
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAdd}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Add Part
          </Button>
        </Stack>

        {/* Cards with CSS Grid (ไม่ใช้ MUI Grid) */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {parts.map((p) => (
            <Card
              key={p.id}
              sx={{
                bgcolor: "#141416",
                color: "white",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Typography fontWeight={800}>{p.partName}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {p.partNo} • ID: {p.id}
                  </Typography>

                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="body2">
                      Qty: <b>{p.qty}</b> {p.unit}
                    </Typography>
                    <Typography variant="body2">
                      Loc: <b>{p.location}</b>
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>

                    <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: "white" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>


                    <IconButton size="small" onClick={() => remove(p.id)} sx={{ color: "#ff4d4f" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                          
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{mode === "add" ? "Add Part" : "Edit Part"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Part No"
              value={form.partNo}
              onChange={(e) => setForm((p) => ({ ...p, partNo: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Part Name"
              value={form.partName}
              onChange={(e) => setForm((p) => ({ ...p, partName: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Qty"
                type="number"
                value={form.qty}
                onChange={(e) => setForm((p) => ({ ...p, qty: Number(e.target.value) }))}
                fullWidth
              />
              <TextField
                label="Unit"
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="Location"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
