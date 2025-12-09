import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React, { useState, useMemo, useEffect } from "react";
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
  Tab,
  Tabs,
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
import { useParams, useLocation, useFetcher } from "react-router-dom";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SparePart from "./SparePart";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CameraCaptureFile from "../../Component/CameraCaptureToFile";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import UploadPicture from "./UploadPicture";
import QRScanner from "../../Component/QRScanner";
import { useWork } from "../../Context/WorkStationContext";
import callApi from "../../Services/callApi";
import { formatDate, formatTime } from "../../Utility/DatetimeService";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// const rows = [
//   {
//     id: 1,
//     lastName: "Snow",
//     firstName: "Jon",
//     age: 35,
//     item: "1",
//     itemNo: "M01011",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 2,
//     lastName: "Lannister",
//     firstName: "Cersei",
//     age: 42,
//     item: "2",
//     itemNo: "M01012",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 3,
//     lastName: "Lannister",
//     firstName: "Jaime",
//     age: 45,
//     item: "3",
//     itemNo: "M01013",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 4,
//     lastName: "Stark",
//     firstName: "Arya",
//     age: 16,
//     item: "4",
//     itemNo: "M01014",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 5,
//     lastName: "Targaryen",
//     firstName: "Daenerys",
//     age: null,
//     item: "5",
//     itemNo: "M01015",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 6,
//     lastName: "Melisandre",
//     firstName: null,
//     age: 150,
//     item: "6",
//     itemNo: "M01016",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 7,
//     lastName: "Clifford",
//     firstName: "Ferrara",
//     age: 44,
//     item: "7",
//     itemNo: "M01017",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 8,
//     lastName: "Frances",
//     firstName: "Rossini",
//     age: 36,
//     item: "8",
//     itemNo: "M01018",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
//   {
//     id: 9,
//     lastName: "Roxie",
//     firstName: "Harvey",
//     age: 65,
//     item: "9",
//     itemNo: "M01019",
//     itemDes: "คอยน์เย็น",
//     qtv: "11",
//     qtvShip: "11",
//   },
// ];

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

export default function WorkStation() {
  const {
    addPart,
    deletePart,
    work,
    setWork,
    item_component,
    setItem_Component,
    startWork,
    finishWork,
  } = useWork();
  const location = useLocation();
  const row = location.state;
  // console.log(row.id);
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
  const [count, setCount] = useState(0);
  const [partName, setPartName] = useState("");
  const [value, setValue] = useState(0);
  const [openCamera, setOpenCamera] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openQrScanner, setOpenQrScanner] = useState(false);
  const [countDel, setCountDel] = useState(0);
  //const [station, setStation] = useState("0010");
  const [itemEach, setItemEach] = useState();

  useEffect(() => {
    onLoad();
    onLoad2();
  }, []);

  const onLoad = async () => {
    let res = await callApi.get(
      `/WorkOrderList/items_component/${row.orderid}`
    );
    console.log("data Result No 1 : ", res.data.dataResult);
    const data = res.data.dataResult;
    // setItem_Component(res.data);
    if (data != null) {
      let newData = data.map((item: any) => {
        return {
          worK_ORDER_COMPONENT_ID: item?.worK_ORDER_COMPONENT_ID,
          orderid: item?.orderid,
          reserV_NO: item?.reserV_NO,
          reS_ITEM: item?.reS_ITEM,
          matL_DESC: item?.matL_DESC,
          actuaL_QUANTITY: item?.actuaL_QUANTITY,
          actuaL_QUANTITY_UNIT: item?.actuaL_QUANTITY_UNIT,
        };
      });
      setItem_Component(newData);
    }
  };

  const onLoad2 = async () => {
    let res = await callApi.get(`/workOrderList/workOrderList/${row.orderid}`);
    const data = res.data.dataResult;
    console.log("Each order in fontend : ", data);
    setItemEach(data)
  };

  // useEffect(() => {
  //   onLoadEachStation();
  // }, []);

  // const onLoadEachStation = async () => {
  //   let res = await callApi.get(
  //     `/WorkOrderList/workOrderListStation/${station}`
  //   );
  //   const data = res.data;
  //   console.log("Each Station : ", data);
  // };

  useEffect(() => {
    console.log("before useEffect : ", item_component);
  }, [item_component]);

  // useEffect(() => {
  //   setItem_Component({
  //     orderid: item_component?.orderid,
  //     RESERV_NO: item_component?.RESERV_NO,
  //     RES_ITEM: item_component?.RES_ITEM,
  //     MATL_DESC: item_component?.MATL_DESC,
  //     ACTUAL_QUANTITY: item_component?.ACTUAL_QUANTITY,
  //     ACTUAL_QUANTITY_UNIT: item_component?.ACTUAL_QUANTITY_UNIT,
  //   });
  // }, [item_component]);

  useEffect(() => {
    setWork({
      orderid: row.orderid,
      ordeR_TYPE: row.ordeR_TYPE,
      shorT_TEXT: row.shorT_TEXT,
      equipment: row.equipment,
      weB_STATUS: row.weB_STATUS,
      slA_FINISH_TIME: row.slA_FINISH_TIME,
      actuaL_FINISH_DATE: row.actuaL_FINISH_DATE,
      servicE_TIME: row.servicE_TIME,
      actuaL_START_TIME: row.actuaL_START_TIME,
      actuaL_FINISH_TIME: row.actuaL_FINISH_TIME,
    });
  }, [row]);

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
    { field: "reS_ITEM", headerName: "No", width: 130 },
    { field: "reserV_NO", headerName: "Item No", width: 130 },
    { field: "matL_DESC", headerName: "Item Des", width: 300 },
    { field: "actuaL_QUANTITY", headerName: "QTY", width: 130 },
    { field: "actuaL_QUANTITY_UNIT", headerName: "QTV SHIP", width: 130 },
  ];

  // const rows: GridRowsProp = useMemo(
  //   () =>
  //     work
  //       ? [
  //           {
  //             ...item_component,
  //             id: item_component?.orderid ?? 1,
  //           },
  //         ]
  //       : [],
  //   [work]
  // );

  // let rows: readonly any[] | undefined = [];

  // useEffect(() => {
  //   rows = useMemo(
  //     () =>
  //       work
  //         ? [
  //             {
  //               id: work.id ?? 1,
  //               ...work,
  //             },
  //           ]
  //         : [],
  //     [work]
  //   );
  // }, [work]);

  // console.log("work ที่หน้า WorkStation : ", work)

  const handleChange = (event: SelectChangeEvent) => {
    setPart(event.target.value as string);
  };

  const handleAddSubmit = () => {
    setOpenAdd(false);
    addPart("Something", count);
    Swal.fire({
      title: "Successfully",
      text: `Submit Already ${count} part`,
      icon: "success",
    });
    setCount(0);
  };

  const handleConfirmDelete = () => {
    console.log("ลบอะไหล่แล้ว");
    setOpenDelete(false);
    deletePart("more part", 4, 1);
    Swal.fire({
      title: "Successfully",
      text: `Part is Already ${count} Delete`,
      icon: "success",
    });
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCamera = () => {
    setOpenCamera(true);
  };

  const onCapture = (files: File[]) => {
    console.log("HHH ", files);
  };

  const handleUpload = () => {
    setOpenUpload(true);
  };

  const handleQrScanner = () => {
    setOpenQrScanner(true);
  };

  const handleCloseScanner = () => {
    setOpenQrScanner(false);
  };

  const handleScanResult = (value: string) => {
    console.log("สแกนได้ : ", value);
  };

  console.log("Item component : ", item_component);

  return (
    <div className="scrollable-div bigBox">
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleTab}
            aria-label="basic tabs example"
          >
            <Tab
              label="Work Order"
              {...a11yProps(0)}
              sx={{
                fontSize: "1.1rem",
                padding: "12px 24px",
                minHeight: 60,
              }}
            />
            <Tab
              label="Work Order List"
              {...a11yProps(1)}
              sx={{
                fontSize: "1.1rem",
                padding: "12px 24px",
                minHeight: 60,
              }}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <div>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <DriveFolderUploadIcon
                sx={{ fontSize: 40 }}
                onClick={handleUpload}
              />
              <CameraAltIcon sx={{ fontSize: 40 }} onClick={handleCamera} />
              {openUpload && (
                <UploadPicture open={openUpload} setOpen={setOpenUpload} />
              )}
            </Box>
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
                  <Typography>
                    {formatTime(Number(work?.slA_FINISH_TIME))}
                  </Typography>
                </ListItem>
                <Divider component="li" />

                <ListItem
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ListItemText primary="Start Date" />
                  <Typography>{formatDate(work?.actuaL_START_DATE)}</Typography>
                </ListItem>
                <Divider component="li" />

                <ListItem
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ListItemText primary="Finish Date" />
                  <Typography>
                    {formatDate(work?.actuaL_FINISH_DATE)}
                  </Typography>
                </ListItem>
              </List>

              {/* RIGHT LIST */}
              <List sx={{ flex: 1 }}>
                <ListItem
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ListItemText primary="Use Time" />
                  <Typography>
                    {formatTime(Number(work?.servicE_TIME))}
                  </Typography>
                </ListItem>
                <Divider component="li" />

                <ListItem
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ListItemText primary="Start Time" />
                  <Typography>
                    {formatTime(Number(work?.actuaL_START_TIME))}
                  </Typography>
                </ListItem>
                <Divider component="li" />

                <ListItem
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ListItemText primary="Finish Time" />
                  <Typography>
                    {formatTime(Number(work?.actuaL_FINISH_TIME))}
                  </Typography>
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
                padding: 2,
              }}
            >
              {[
                {
                  label: "Start",
                  from: "#2ecc71",
                  to: "#27ae60",
                  onClick: startWork,
                },
                // { label: "Pause", from: "#f1c40f", to: "#f39c12" },
                {
                  label: "Finish",
                  from: "#3498db",
                  to: "#2980b9",
                  onClick: finishWork,
                },
                { label: "Check List", from: "#9b59b6", to: "#8e44ad" },
                { label: "Completed", from: "#2980b9", to: "#2471a3" },
                { label: "Return", from: "#e74c3c", to: "#c0392b" },
              ].map((btn, index) => (
                <Button
                  key={index}
                  onClick={btn.onClick}
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${btn.from}, ${btn.to})`,
                    borderRadius: "16px",
                    width: 180,
                    height: 70,
                    padding: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    textTransform: "none",

                    boxShadow: `
            0px 4px 15px rgba(0,0,0,0.25),
            inset 0px 1px 4px rgba(255,255,255,0.25),
            inset 0px -3px 6px rgba(0,0,0,0.2)
          `,

                    transition: "0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px) scale(1.03)",
                      boxShadow: `
              0px 10px 25px rgba(0,0,0,0.35),
              inset 0px 1px 4px rgba(255,255,255,0.3),
              inset 0px -3px 6px rgba(0,0,0,0.25)
            `,
                    },

                    "&:active": {
                      transform: "scale(0.98)",
                      boxShadow: `
              0px 2px 10px rgba(0,0,0,0.25),
              inset 0px 3px 8px rgba(0,0,0,0.3)
            `,
                    },
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Stack>
          </div>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <Paper sx={{ height: 740, width: "100%" }}>
            <DataGrid
              rows={item_component ?? []}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              checkboxSelection={false}
              sx={{ border: 0 }}
              getRowId={(row) => row.worK_ORDER_COMPONENT_ID}
            />
          </Paper>
        </CustomTabPanel>
      </Box>

      <AppHeader title="Work Order" icon={<BusinessCenterIcon />} />

      <div>
        <Dialog open={openAdd} onClose={handleCloseAdd} fullWidth maxWidth="xs">
          <DialogTitle>เพิ่มรายการอะไหล่</DialogTitle>

          <DialogContent>
            <Typography sx={{ mb: 2 }}>Enter Spare Part</Typography>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 7,
              }}
            >
              <TextField
                sx={{ mb: 2 }}
                type="text"
                fullWidth
                variant="outlined"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
              />

              {/* <QrCodeScannerIcon
                sx={{ fontSize: 30 }}
                onClick={handleQrScanner}
              />
              {openQrScanner && (
                <QRScanner
                  open={openQrScanner}
                  onClose={handleCloseScanner}
                  onScan={handleScanResult}
                />
              )} */}
            </div>

            <SparePart setCount={setCount} count={count} />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseAdd} color="inherit">
              ยกเลิก
            </Button>
            <Button variant="contained" onClick={handleAddSubmit}>
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

        {/* Camera */}
        <Dialog
          open={openCamera}
          onClose={() => setOpenCamera(false)}
          fullWidth
        >
          <DialogTitle>ถ่ายภาพ</DialogTitle>
          <DialogContent>
            <CameraCaptureFile
              // onCapture={(files) => {
              //   console.log("Captured:", files);
              //   setOpenCamera(false);
              // }}
              onCapture={onCapture}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenCamera(false)}>ปิด</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
