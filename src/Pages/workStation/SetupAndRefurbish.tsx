import {
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogContentText,
  Stack
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import React, { useState } from "react";
import "./Setup.css";
import workorder from "./PNG/workorder.png";
import stock from "./PNG/stock.png";
import inspector from "./PNG/inspector.png";
import remove from "./PNG/remove.png";
import clean from "./PNG/clean.png";
import color from "./PNG/color.png";
import fix from "./PNG/fix.png";
import assembly from "./PNG/assembly.png";
import test from "./PNG/test.png";
import qc from "./PNG/qc.png";
import DashboardRefurbish from "./DashboardRefurbish";
import { Link, useNavigate} from "react-router-dom";
import Modal from '@mui/material/Modal';
import AppHeader from "../../Component/AppHeader"
import HomeWorkIcon from '@mui/icons-material/HomeWork';


const steps = [
  { id: 0, title: "Work Order List", icon: workorder },
  { id: 0.1, title: "Stock Report", icon: stock },
  { id: 1, title: "Inspector", icon: inspector, station: "0010" },
  { id: 2, title: "Remove Part", icon: remove, station: "0020" },
  { id: 3, title: "Clean", icon: clean, station: "0030" },
  { id: 4, title: "Color", icon: color, station: "0040" },
  { id: 5, title: "Fix Cooling", icon: fix, station: "0050" },
  { id: 6, title: "Assembly Part", icon: assembly, station: "0060" },
  { id: 7, title: "Test", icon: test, station: "0070" },
  { id: 8, title: "QC", icon: qc, station: "0080" },
];

export default function SetupAndRefurbish() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [work, setWork] = React.useState("");
  const [current, setCurrent] = useState<any[]>([]);

  // แยก steps เป็น 2 แถว
  const topRow = steps.filter((_, i) => i % 2 === 0);
  const bottomRow = steps.filter((_, i) => i % 2 === 1);

  const Hex = ({ step, index }: any) => (
    
    <Box
      display="flex"
      flexWrap="wrap"
      flexDirection="column"
      alignItems="center"
      mx={5}
      onClick={() => navigate("/DashboardRefurbish", {state:step})}
    >
      
      <Box
        className="clip-hex"
        sx={{
          width: "8rem",
          height: "8rem",
          background: "linear-gradient(135deg, #ddeaffff, #b8c9ffff)",
          border: "1px solid transparent",
          overflow: "hidden", // ทำให้รูปไม่หลุดออกนอก hex
          position: "relative",
          display: "flex",
          alignItems: "center", // จัดกึ่งกลางแนวตั้ง
          justifyContent: "center",
        }}
      >
        {/* รูปภาพ */}
        <Box
          component="img"
          src={step.icon}
          alt={step.title}
          sx={{
            width: "60%", // <<< ลดจาก 100% → 80% 
            height: "60%",
            objectFit: "cover",
            margin: "auto",
            padding: "10px", // <<< กันรูปติดขอบเกินไป
            transition: "transform 0.3s ease",
            // clipPath: "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        />

        {/* เลขมุมบน */}
        {/* <Box
          component="span"
          sx={{
            position: "absolute",
            top: "6px",
            left: "8px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            color: "#fff",
            textShadow: "0px 0px 4px rgba(0,0,0,0.7)",
          }}
        >
          {Math.floor(step.id)}
        </Box> */}
      </Box>

      <Box mt={1} textAlign="center" width="8rem" fontSize="0.875rem">
        {step.title} 
      </Box>
    </Box>
    
  );

  const handleClickOpen = () => {
    setOpen(true);
    handleClick();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    console.log("Hex clicked");
    navigate('/DashboardRefurbish');
  };

  const handleChange = (event: SelectChangeEvent) => {
    setWork(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
  };

  return (
    <>
    <AppHeader title={"SETUP / REFURBISH"} icon={<HomeWorkIcon />}/>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "#f9f9ff",
          minHeight: "100vh",
          marginLeft: "63px",
          transition: "margin-left 0.3s ease",
          paddingTop: 10,
        }}
      >
        <Paper
          sx={{
            padding: 3,
            marginBottom: 2,
            alignItems: "right",
            mx: "auto",
            maxWidth: 1200,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" p={1}>
            <Box textAlign="center" mb={2}>
              <h1 className="text-3xl font-bold text-blue-600 mb-1">
                SETUP / REFURBISH
              </h1>
              <h2 className="text-xl font-semibold text-blue-500">System</h2>
            </Box>

            {/* Top Row */}
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              ml={-10}
            >
              {topRow.map((step, index) => (
                <Hex key={index} step={step} index={index} />
              ))}
            </Box>

            {/* Bottom Row (เลื่อนครึ่งช่อง) */}
            <Box display="flex" justifyContent="center" mt={-6} ml={18} >
              {bottomRow.map((step, index) => (
                <Hex key={index} step={step} index={index} />
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>เข้าสู่ระบบ</DialogTitle>

        <DialogContent>
         
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            
            <TextField
              autoFocus
              required
              margin="dense"
              id="code"
              name="code"
              label="ใส่รหัสพนักงาน"
              type="text"
              variant="standard"
              fullWidth
              sx={{ flex: 1 }} 
              inputProps={{ maxLength: 10 }}
            />

          
            <FormControl variant="standard" sx={{ minWidth: 120 }}>
              <InputLabel id="work-label">Work</InputLabel>
              <Select
                labelId="work-label"
                id="work"
                value={work}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={20}>Hello</MenuItem>
                <MenuItem value={21}>World</MenuItem>
                <MenuItem value={22}>Margin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>ยกเลิก</Button>
          <Button type="submit" form="subscription-form" >
            เข้าสู่ระบบ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
