import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import "./Setup.css";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Swal from "sweetalert2";
import AppHeader from "../../Component/AppHeader";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AddTaskIcon from "@mui/icons-material/AddTask";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useParams, useLocation  } from "react-router-dom";

const rows = [
  {
    id: 1,
    lastName: "Snow",
    firstName: "Jon",
    age: 35,
    item: "1",
    itemNo: "M01011",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 2,
    lastName: "Lannister",
    firstName: "Cersei",
    age: 42,
    item: "2",
    itemNo: "M01012",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 3,
    lastName: "Lannister",
    firstName: "Jaime",
    age: 45,
    item: "3",
    itemNo: "M01013",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 4,
    lastName: "Stark",
    firstName: "Arya",
    age: 16,
    item: "4",
    itemNo: "M01014",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 5,
    lastName: "Targaryen",
    firstName: "Daenerys",
    age: null,
    item: "5",
    itemNo: "M01015",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 6,
    lastName: "Melisandre",
    firstName: null,
    age: 150,
    item: "6",
    itemNo: "M01016",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 7,
    lastName: "Clifford",
    firstName: "Ferrara",
    age: 44,
    item: "7",
    itemNo: "M01017",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 8,
    lastName: "Frances",
    firstName: "Rossini",
    age: 36,
    item: "8",
    itemNo: "M01018",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
  {
    id: 9,
    lastName: "Roxie",
    firstName: "Harvey",
    age: 65,
    item: "9",
    itemNo: "M01019",
    itemDes: "คอยน์เย็น",
    qtv: "11",
    qtvShip: "11",
  },
];

const paginationModel = { page: 0, pageSize: 5 };

const listCheck = [
  "Inspector",
  "Remove Part",
  "Clean",
  "Color",
  "Fix Cooling",
  "Assembly Part",
  "Test",
  "Qc",
];

const style = {
  py: 0,
  width: "100%",
  maxWidth: 360,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
};

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function WorkStation() {
  const location = useLocation();
  const row = location.state;
  console.log(row.id);
  const [part, setPart] = useState("");
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => {
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
  };
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [count, setCount] = useState(0);

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <Button
              sx={{ backgroundColor: "green" }}
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAdd();
              }}
            >
              <AddTaskIcon />
            </Button>
            <Button
              sx={{ backgroundColor: "red" }}
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDelete();
              }}
            >
              <DeleteForeverIcon />
            </Button>
          </div>
        );
      },
    },
    { field: "item", headerName: "No", width: 130 },
    { field: "itemNo", headerName: "Item No", width: 130 },
    { field: "itemDes", headerName: "Item Des", width: 300 },
    { field: "qtv", headerName: "QTY", width: 130 },
    { field: "qtvShip", headerName: "QTV SHIP", width: 130 },
  ];

  const handleChange = (event: SelectChangeEvent) => {
    setPart(event.target.value as string);
  };

  const handleSubmit = () => {
    setOpenAdd(false);
    Swal.fire({
      title: "Successfully",
      text: `Submit Already ${count} part`,
      icon: "success",
    });
  };

  const handleConfirmDelete = () => {
    console.log("ลบอะไหล่แล้ว");
    setOpenDelete(false);
    Swal.fire({
      title: "Successfully",
      text: `Part is Already Delete`,
      icon: "success",
    });
  };

  return (
    <div className="scrollable-div bigBox">
      <AppHeader title="Work Order" icon={<BusinessCenterIcon />} />
      <div className="boxInside">
        <div>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              flexWrap: "wrap",
              gap: 2,
              padding: 3,
              borderRadius: 5,
            }}
          >
            <Box sx={{ minWidth: 250, maxWidth: 600, flexShrink: 0 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="demo-simple-select-label">Part</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={part}
                  label="Part"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                padding: 3,
              }}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      size="small"
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": {
                          color: "#0d47a1",
                        },
                      }}
                    />
                  }
                  label={listCheck[index]}
                  sx={{
                    m: 0,
                    p: 1,
                    px: 2,
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#fafafa",

                    transition: "0.2s",
                    "&:hover": {
                      backgroundColor: "#f0f7ff",
                      borderColor: "#90caf9",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </div>
        <div>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
            }}
          >
            {/* LEFT LIST */}
            <List sx={{ flex: 1 }}>
              <ListItem
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText primary="SLA Time" />
                <Typography>30 min</Typography>
              </ListItem>
              <Divider component="li" />

              <ListItem
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText primary="Start Date" />
                <Typography>03.04.2025</Typography>
              </ListItem>
              <Divider component="li" />

              <ListItem
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText primary="Finish Date" />
                <Typography>05.04.2025</Typography>
              </ListItem>
            </List>

            {/* RIGHT LIST */}
            <List sx={{ flex: 1 }}>
              <ListItem
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText primary="Use Time" />
                <Typography>30 min</Typography>
              </ListItem>
              <Divider component="li" />

              <ListItem
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText primary="Start Time" />
                <Typography>30 Min</Typography>
              </ListItem>
              <Divider component="li" />

              <ListItem
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemText primary="Finish Time" />
                <Typography>30 Min</Typography>
              </ListItem>
            </List>
          </Box>
        </div>

        <div>
          <Stack
            spacing={3}
            direction="row"
            sx={{
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {[
              { label: "Start", color: "#2ecc71" },
              { label: "Pause", color: "#f1c40f" },
              { label: "Finish", color: "#3498db" },
              { label: "Check List", color: "#9b59b6" },
              { label: "Completed", color: "#2980b9" },
              { label: "Return", color: "#e74c3c" },
            ].map((btn, index) => (
              <Button
                key={index}
                variant="contained"
                sx={{
                  backgroundColor: btn.color,
                  borderRadius: "50%",
                  width: 120,
                  height: 120,
                  minWidth: 0,
                  padding: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#fff",
                  textTransform: "none",

                  boxShadow: "0 6px 15px rgba(0,0,0,0.25)",

                  transition: "0.2s",
                  "&:hover": {
                    backgroundColor: btn.color,
                    transform: "scale(1.08)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                  },
                }}
              >
                {btn.label}
              </Button>
            ))}
          </Stack>
        </div>
      </div>

      <div className="boxInside">
        <Paper sx={{ height: 740, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            checkboxSelection={false}
            sx={{ border: 0 }}
          />
        </Paper>
      </div>

      <div>
        <Dialog
          open={openAdd}
          onClose={handleCloseAdd}
          fullWidth
          maxWidth="xs" // ทำให้ dialog ไม่ใหญ่เกินไป
        >
          <DialogTitle>เพิ่มรายการอะไหล่</DialogTitle>

          <DialogContent>
            <Typography sx={{ mb: 2 }}>จำนวนอะไหล่ที่ต้องการเพิ่ม</Typography>

            <TextField
              type="number"
              label="Quantity"
              fullWidth
              variant="outlined"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseAdd} color="inherit">
              ยกเลิก
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              ยืนยันการเพิ่มอะไหล่
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDelete}
          onClose={handleCloseDelete}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>ยืนยันการลบอะไหล่</DialogTitle>

          <DialogContent>
            <DialogContentText>ลบอะไหล่ออก</DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDelete} color="inherit">
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              ยืนยันลบ
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
