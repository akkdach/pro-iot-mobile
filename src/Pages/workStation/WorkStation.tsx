import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React, { useState, useMemo, useEffect, use } from "react";
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
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
import callUploadImage from "../../Services/callUploadImage";
import { formatDate, formatTime } from "../../Utility/DatetimeService";
import ImageUploadCard from "./ImageUploadCard";
import { replaceImageBaseUrl } from "../../Services/imageUrl";

import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import CountTime from "../../Utility/countTime";
import SimpleElapsedTimer from "../../Utility/SimpleElapsedTimer";
import { SlaTimer } from "../../Utility/SlaTimer";
import { RemarkField } from "../../Utility/RemarkField";
import EmployeeMultiSelectModal, { Employee } from "../../Utility/EmployeeSelect";
import WorkerRows from "../../Utility/WorkerRows";
import { CloseWorkMaster } from "../../Utility/CloseWorkMaster";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  keepMounted?: boolean;
}

type FileState = {
  file: File | null;
  isEditable: boolean;
};

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
    returnWork,
    completed,
    checkListWork,
  } = useWork();
  const location = useLocation();
  const row = location.state;
  console.log("row naaaaaa : ", row);
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
  const [itemEach, setItemEach] = useState();
  const [deleteId, setDeleteId] = useState<any>(null);
  const [masterImages, setMasterImages] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, FileState>>({});
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const [openRemark, setOpenRemark] = useState(false);
  const [remark, setRemark] = useState("");

  const [openEmpModal, setOpenEmpModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  const [getWorker, setGetWorker] = useState<any>([]);

  const { orderId, operationId } = useParams();

  console.log("orderid from useParams : ", orderId);
  console.log("operationid from useParams : ", operationId);

  // useRef to persist state across renders (workaround for double invocation)
  const selectedFilesRef = React.useRef<Record<string, FileState>>({});


  const navigate = useNavigate();

  // Edit QTY State
  const [openEditQty, setOpenEditQty] = useState(false);
  const [editItem, setEditItem] = useState<{
    material: string;
    materialDescription: string;
    qty: string;
    max?: number;
    workOrderComponentId?: number;
  } | null>(null);
  const [editQty, setEditQty] = useState<string>("1");

  const handleEditQty = async () => {
    try {
      if (!editItem) return;

      const newQty = Math.max(1, Number(editQty || 1));

      // 1. Create a bulk payload from all existing items
      // We map over item_component to include everyone
      const payload = (item_component || []).map((item: any) => {
        // If this is the item we are editing, use the new quantity
        if (item.worK_ORDER_COMPONENT_ID === editItem.workOrderComponentId) {
          return {
            workOrderComponentId: item.worK_ORDER_COMPONENT_ID,
            workOrder: work?.orderid,
            material: item.reS_ITEM || item.material,
            matL_DESC: item.matL_DESC,
            requirementQuantity: newQty,
            requirementQuantityUnit: item.actuaL_QUANTITY_UNIT,
            moveType: true,
          };
        }
        // Otherwise use existing quantity
        return {
          workOrderComponentId: item.worK_ORDER_COMPONENT_ID,
          workOrder: work?.orderid,
          material: item.reS_ITEM || item.material,
          matL_DESC: item.matL_DESC,
          requirementQuantity: item.actuaL_QUANTITY,
          requirementQuantityUnit: item.actuaL_QUANTITY_UNIT,
          moveType: true,
        };
      });

      // Special check: If for some reason the editItem wasn't found in item_component (rare but possible if fresh add),
      // we might need to append it. But typically in this View, we only edit existing.
      // So we assume it's covered by the map.

      Swal.fire({
        title: "กำลังบันทึก...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await callApi.post(
        `/Mobile/SetWorkOrderSparePart?OrderId=${work?.orderid}`,
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
        // Reload data
        await onLoad();
      } else {
        await Swal.fire({
          icon: "error",
          title: "ผิดพลาด",
          text: res.data.dataResult.message || "ไม่สามารถบันทึกข้อมูลได้",
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

  useEffect(() => {
    onLoad();
    onLoad2();
    onLoad3();
    onLoad4();
  }, []);

  const onLoad = async () => {
    let res = await callApi.get(
      `/WorkOrderList/items_component/${orderId}`
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
          reS_ITEM: item?.reS_ITEM || item?.material,
          matL_DESC: item?.matL_DESC || item?.MATL_DESC || item?.MatlDesc || item?.materialDescription,
          actuaL_QUANTITY: item?.actuaL_QUANTITY,
          actuaL_QUANTITY_UNIT: item?.actuaL_QUANTITY_UNIT,
          material: item?.material,
        };
      });
      setItem_Component(newData);
    }
  };

  const onLoad2 = async () => {
    console.log(`/WorkOrderList/workOrder/${orderId}/${operationId}`);
    console.log("row operation id : ", operationId);
    let res = await callApi.get(
      `/WorkOrderList/workOrder/${orderId}/${operationId}`
    );
    const data = res.data.dataResult;
    console.log("Each order in frontend in workStation workOrder/{orderId}/{operationId} : ", data);
    if (!data) {
      console.log("No data found");
      return;
    }
    const item = Array.isArray(data) ? data[0] : data;

    setWork(() => ({
      orderid: item.orderid ?? item.ORDERID,
      ordeR_TYPE: item.ordeR_TYPE ?? item.ORDER_TYPE,
      shorT_TEXT: item.shorT_TEXT ?? item.SHORT_TEXT,
      equipment: item.equipment ?? item.EQUIPMENT,
      weB_STATUS: item.weB_STATUS ?? item.WEB_STATUS,
      slA_FINISH_TIME: item.slA_FINISH_TIME ?? item.SLA_FINISH_TIME,
      actuaL_FINISH_DATE: item.actuaL_FINISH_DATE ?? item.ACTUAL_FINISH_DATE,
      servicE_TIME: item.servicE_TIME ?? item.SERVICE_TIME,
      actuaL_START_TIME: item.actuaL_START_TIME ?? item.ACTUAL_START_TIME,
      actuaL_FINISH_TIME: item.actuaL_FINISH_TIME ?? item.ACTUAL_FINISH_TIME,
      actuaL_START_DATE: item.actuaL_START_DATE ?? item.ACTUAL_START_DATE,
      current_operation: item.current_operation ?? item.CURRENT_OPERATION,
      worK_ACTUAL: item.worK_ACTUAL ?? item.WORK_ACTUAL,
      acT_START_DATE: item.acT_START_DATE ?? item.ACT_START_DATE,
      acT_START_TIME: item.acT_START_TIME ?? item.ACT_START_TIME,
      acT_END_DATE: item.acT_END_DATE ?? item.ACT_END_DATE,
      acT_END_TIME: item.acT_END_TIME ?? item.ACT_END_TIME,
      worK_ORDER_OPERATION_ID:
        item.worK_ORDER_OPERATION_ID ?? item.WORK_ORDER_OPERATION_ID,
      mN_WK_CTR: item.mN_WK_CTR ?? item.MN_WK_CTR,
      worK_ORDER_COMPONENT_ID:
        item.worK_ORDER_COMPONENT_ID ?? item.WORK_ORDER_COMPONENT_ID,
      slA_FINISH_DATE: item.slA_FINISH_DATE ?? item.SLA_FINISH_DATE,
      slA_START_DATE: item.slA_START_DATE ?? item.SLA_START_DATE,
      slA_START_TIME: item.slA_START_TIME ?? item.SLA_START_TIME,
    }));
  };

  const onLoad3 = async () => {
    try {
      // Fetch both Master Templates and Current Image Data in parallel
      console.log("row.orderid", orderId);
      const [resMaster, resBox] = await Promise.all([
        callApi.get(`/Mobile/GetMasterWorkorderImage?order_id=${orderId}`),
        callApi.get(`/WorkOrderList/ImgBox/${orderId}`)
      ]);

      const masterData = resMaster.data.dataResult || [];
      const boxData = resBox.data.dataResult || {};

      console.log("Master Data:", masterData);
      console.log("Box Data (Current Images):", boxData);

      // DEBUG: Print all keys to compare
      if (masterData.length > 0) {
        console.log("--- KEY CHECK ---");
        console.log("Master Keys:", masterData.map((m: any) => m.key));
        console.log("Box Keys:", Object.keys(boxData));
        console.log("-----------------");
      }

      if (masterData.length > 0) {

        // Convert boxData keys to lowercase for case-insensitive matching
        const boxDataLower: any = {};
        Object.keys(boxData).forEach(k => {
          if (k) boxDataLower[k.toLowerCase()] = boxData[k];
        });

        const mergedImages = masterData.map((img: any) => {
          // Check key with case-insensitive
          let targetKey = img.key?.toLowerCase();

          // Manual Mapping for known mismatches
          if (targetKey === 'image_pull_condensor_evap') {
            targetKey = 'image_speed_condensor_evap';
          }

          const serverUrl = boxDataLower[targetKey];
          const fixedUrl = replaceImageBaseUrl(serverUrl);

          if (serverUrl) {
            // Found existing image, use it
            return { ...img, imageUrl: fixedUrl };
          }
          // No image yet, keep original
          return img;
        });

        console.log("Merged Images:", mergedImages);
        setMasterImages(mergedImages);
      } else {
        setMasterImages([]);
      }

    } catch (e) {
      console.error("Error loading images (Master + Box):", e);
    }
  }

  const onLoad4 = async () => {
    const res = await callApi.get(`/WorkOrderList/GetEmployee/${orderId}/${row?.current_operation}`);
    const data = res.data;
    console.log("data refurbish employees : ", data);
    setGetWorker(data);
  }

  const handleConfirmEmployeesAndStart = async (emps: Employee[]) => {
    setOpenEmpModal(false);

    try {
      setIsWorking(true);
      setSelectedEmployees(emps);

      const payload = emps.map((e) => ({
        ORDERID: work?.orderid,
        current_operation: work?.current_operation,
        PERSONNEL_NUMBER: e.personnelNumber,
        NAME: e.personnelName,
      }));

      await callApi.post(`/WorkOrderList/Employee/${work?.orderid}/${work?.current_operation}`, payload);

      await startWork();
    } catch (err) {
      console.log(err);
      setIsWorking(false);
    }
  };

  function CustomToolbar() {
    const navigate = useNavigate();

    return (
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid #E5E7EB",
          backgroundColor: "#F8FAFC",
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/sparepart/add")}
          sx={{
            bgcolor: "#2563EB",
            textTransform: "none",
            fontWeight: 700,
            "&:hover": { bgcolor: "#1D4ED8" },
          }}
        >
          Add Part
        </Button>
      </Box>
    );
  }


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
              sx={{ backgroundColor: "#1976D2" }} // Blue for edit
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Prepare edit item
                setEditItem({
                  material: params.row.reS_ITEM ?? "", // Use displayed item no or material
                  materialDescription: params.row.matL_DESC ?? "",
                  qty: String(params.row.actuaL_QUANTITY ?? 0),
                  workOrderComponentId: params.row.worK_ORDER_COMPONENT_ID
                });
                setEditQty(String(params.row.actuaL_QUANTITY ?? 0));
                setOpenEditQty(true);
              }}
            >
              <EditIcon />
            </Button>
            <Button
              sx={{ backgroundColor: "red" }}
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                //setDeleteId(params.row.worK_ORDER_COMPONENT_ID);
                handleConfirmDelete(params.row.worK_ORDER_COMPONENT_ID);
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

  const handleConfirmDelete = async (itemId: any) => {
    deletePart(itemId);
    await onLoad();
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, keepMounted, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {keepMounted ? (
          <Box sx={{ p: 3, display: value === index ? 'block' : 'none' }}>{children}</Box>
        ) : (
          value === index && <Box sx={{ p: 3 }}>{children}</Box>
        )}
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

  const handleFileSelect = (key: string, seq: number, file: File | null) => {
    const uniqueKey = `${key}-${seq}`;

    // กดกากบาทล้างรูป
    if (!file) {
      setSelectedFiles(prev => {
        const next = { ...prev };
        delete next[uniqueKey];
        return next;
      });
      // ลบเฉพาะ key นี้พอ (อย่าล้างทั้ง ref)
      // const nextRef = { ...selectedFilesRef.current };
      // delete nextRef[uniqueKey];
      // selectedFilesRef.current = nextRef;
      return;
    }

    const prev = selectedFilesRef.current[uniqueKey];

    // Find master image to check if DB has image
    const masterImg = masterImages.find(img => img.key === key && img.seq === seq);
    const hasDbImage = !!masterImg?.imageUrl;

    const isEditable = !!prev || hasDbImage; // ถ้ามีของเดิมอยู่แล้ว หรือ มีใน DB แล้วเลือกใหม่ แปลว่าแก้ไข

    const nextState: FileState = {
      file,
      isEditable,
    };

    // อัปเดต ref ก่อน เพื่อให้ครั้งถัดไปอ่านค่าถูก
    selectedFilesRef.current = {
      ...selectedFilesRef.current,
      [uniqueKey]: nextState,
    };

    setSelectedFiles(prevState => ({
      ...prevState,
      [uniqueKey]: nextState,
    }));
  };




  const handleUploadAll = async () => {
    const filesToUpload = masterImages.filter(img => selectedFiles[`${img.key}-${img.seq}`]?.file);

    if (filesToUpload.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่พบรูปภาพ',
        text: 'กรุณาเลือกรูปภาพอย่างน้อย 1 รูป',
      });
      return;
    }

    Swal.fire({
      title: 'กำลังอัพโหลด...',
      html: `กรุณารอสักครู่... (0/${filesToUpload.length})`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
      const img = filesToUpload[i];
      const file = selectedFiles[`${img.key}-${img.seq}`]?.file;

      if (file) {
        try {
          Swal.update({ html: `กำลังอัพโหลด... (${i + 1}/${filesToUpload.length})<br/>${img.title}` });

          await callUploadImage({
            orderId: String(orderId),
            image: file,
            imageKey: img.key,
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to upload ${img.title}:`, error);
          failCount++;
        }
      }
    }

    Swal.fire({
      icon: failCount === 0 ? 'success' : 'warning',
      title: 'ดำเนินการเสร็จสิ้น',
      text: `อัพโหลดสำเร็จ ${successCount} รูป${failCount > 0 ? `, ล้มเหลว ${failCount} รูป` : ''}`,
      confirmButtonText: 'ตกลง',
    });

    // Optional: Clear selection after successful upload
    // if (failCount === 0) {
    //    setSelectedFiles({});
    // }
  };

  const normalizedOp = work?.current_operation?.toString().padStart(4, "0");
  const hasStarted = !!work?.actuaL_START_DATE;
  const hasFinished = !!work?.actuaL_FINISH_DATE;

  //console.log("Item component : ", item_component);

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
              label="Employee"
              {...a11yProps(1)}
              sx={{
                fontSize: "1.1rem",
                padding: "12px 24px",
                minHeight: 60,
              }}
            />
            <Tab
              label="Work Order List"
              {...a11yProps(2)}
              sx={{
                fontSize: "1.1rem",
                padding: "12px 24px",
                minHeight: 60,
              }}
            />
            <Tab
              label="Upload Image"
              {...a11yProps(3)}
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
                flexDirection: "column",
              }}
            >
              {/* NEW TIMER DISPLAY */}
              <Paper
                elevation={6}
                sx={{
                  mb: 2,
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                  borderRadius: 4,
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative background circle */}
                <Box
                  sx={{
                    position: "absolute",
                    right: -20,
                    top: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "rgba(37, 99, 235, 0.05)",
                  }}
                />

                <Stack direction="column" alignItems="center" spacing={0}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748B", mb: 0.5 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: 1.2 }}>
                      TIME ELAPSED
                    </Typography>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: isWorking
                        ? "linear-gradient(to right, #2563EB, #4F46E5)"
                        : "linear-gradient(to right, #64748B, #94A3B8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      letterSpacing: -1,
                      filter: "drop-shadow(0px 2px 4px rgba(37, 99, 235, 0.2))"
                    }}
                  >
                    <SimpleElapsedTimer startAt={work?.acT_START_DATE ?? "00:00:00"} running={isWorking} />
                  </Typography>
                </Stack>
              </Paper>

              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <List sx={{ flex: 1 }}>
                  <ListItem
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primary="SLA Time" />
                    <Typography>
                      {/* {formatTime(Number(work?.slA_FINISH_DATE))} */}
                      <SlaTimer
                        slaFinishDate={String(work?.slA_FINISH_DATE)}
                        slaFinishTime={String(work?.slA_FINISH_TIME)}
                        slaStartDate={String(work?.slA_START_DATE)}
                        slaStartTime={String(work?.slA_START_TIME)}
                      // slaFinishDate={String("2026-01-29T00:00:00")}
                      // slaFinishTime={String("080000")}
                      // slaStartDate={String("2025-12-08T00:00:00")}
                      // slaStartTime={String("080000")}
                      />
                    </Typography>
                  </ListItem>
                  <Divider component="li" />

                  <ListItem
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primary="Start Date" />
                    <Typography>{formatDate(work?.acT_START_DATE)}</Typography>
                  </ListItem>
                  <Divider component="li" />

                  <ListItem
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primary="Finish Date" />
                    <Typography>{formatDate(work?.acT_END_DATE)}</Typography>
                  </ListItem>
                </List>

                {/* RIGHT LIST */}
                <List sx={{ flex: 1 }}>


                  <ListItem
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primary="Start Time" />
                    <Typography>{formatTime(work?.acT_START_TIME)}</Typography>
                  </ListItem>
                  <Divider component="li" />

                  <ListItem
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primary="Finish Time" />
                    <Typography>{formatTime(work?.acT_END_TIME)}</Typography>
                  </ListItem>
                </List>
              </Box>
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
                  onClick: () => {
                    // setIsWorking(true);
                    // startWork();
                    setOpenEmpModal(true);
                  },
                },
                //{ label: "Hold", from: "#f1c40f", to: "#f39c12" },
                {
                  label: "Finish",
                  from: "#3498db",
                  to: "#2980b9",
                  onClick: () => {
                    setIsWorking(false);
                    finishWork();
                  },
                },
                {
                  label: "Check List",
                  from: "#9b59b6",
                  to: "#8e44ad",
                  onClick: checkListWork,
                },
                {
                  label: "Completed",
                  from: "#2980b9",
                  to: "#2471a3",
                  onClick: completed,
                  hide: normalizedOp !== "0080",
                },
                {
                  label: "Return",
                  from: "#e74c3c",
                  to: "#c0392b",
                  onClick: returnWork,
                },
                {
                  label: "Remark",
                  from: "purple",
                  to: "blue",
                  onClick: () => setOpenRemark(true),
                },
              ]
                .filter((btn) => !btn.hide)
                .map((btn, index) => (
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
          <WorkerRows dataResult={getWorker.dataResult} />

        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <Paper sx={{ height: 740, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 1.5,
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/TableSparePart", { state: { item_component } });
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#2563EB",
                  "&:hover": { bgcolor: "#1D4ED8" },
                }}
              >
                แก้ไขรายการอะไหล่
              </Button>
            </Box>
            <DataGrid
              rows={item_component ?? []}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 30 } },
              }}
              pageSizeOptions={[30]}
              checkboxSelection={false}
              sx={{ border: 0 }}
              getRowId={(row) => row.worK_ORDER_COMPONENT_ID}
            />
          </Paper>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={3} keepMounted>
          <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 900, color: '#2d3a4b' }}>
              Upload Work Order Images
            </Typography>

            {masterImages.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: '#64748B', mt: 4 }}>
                ไม่พบรายการรูปภาพที่ต้องอัพโหลด
              </Typography>
            ) : (

              masterImages.map((img: any, index: number) => {
                const k = `${img.key}-${img.seq}`;
                const state = selectedFiles[k];

                // console.log("[render card]", k, "pickCount =", state?.pickCount);
                return (
                  <ImageUploadCard
                    key={k}
                    title={img.title}
                    imageKey={img.key}
                    orderid={String(orderId)}
                    seq={img.seq}
                    imageUrl={img.imageUrl || img.url}
                    file={state?.file || null}
                    status={state?.isEditable ? "modified" : "new"}
                    onFileSelect={(file) => handleFileSelect(img.key, img.seq, file)}
                  />
                );
              })
            )}

            <Box sx={{
              mt: 5,
              pt: 3,
              pb: 2,
              borderTop: '2px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'center',
              position: 'sticky',
              bottom: 0,
              bgcolor: 'white',
              zIndex: 10
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleUploadAll}
                startIcon={<DriveFolderUploadIcon />}
                disabled={Object.values(selectedFiles).filter(Boolean).length === 0}
                sx={{
                  bgcolor: '#2563EB',
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px -2px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    bgcolor: '#1D4ED8',
                    boxShadow: '0 6px 16px -2px rgba(37, 99, 235, 0.4)'
                  },
                  '&:disabled': { bgcolor: '#94A3B8' }
                }}
              >
                บันทึกรูปภาพทั้งหมด ({Object.values(selectedFiles).filter(Boolean).length})
              </Button>
            </Box>
          </Box>
        </CustomTabPanel>

      </Box>

      <AppHeader title="Work Order" icon={<BusinessCenterIcon />} />

      <div>


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
                <Typography variant="body2" color="text.secondary">
                  {editItem.materialDescription}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Button
                    variant="outlined"
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: 2,
                      borderColor: "#E0E0E0",
                      color: "#1976D2",
                    }}
                    onClick={() => {
                      const current = Number(editQty);
                      if (current > 1) setEditQty(String(current - 1));
                    }}
                  >
                    -
                  </Button>

                  <TextField
                    fullWidth
                    label="จำนวนที่ต้องการ"
                    type="number"
                    size="small"
                    value={editQty}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") { setEditQty(""); return; }
                      const n = Number(v);
                      if (!Number.isNaN(n) && n >= 0) setEditQty(v);
                    }}
                    sx={{ width: 160 }}
                  />
                  <Button
                    variant="outlined"
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: 2,
                      borderColor: "#E0E0E0",
                      color: "#1976D2",
                    }}
                    onClick={() => {
                      const current = Number(editQty) || 0;
                      setEditQty(String(current + 1));
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


        <RemarkField
          open={openRemark}
          onClose={() => setOpenRemark(false)}
          title="Add Remark"
          dropdownLabel="Reason"
          dropdownOptions={[
            { value: "delay", label: "Delay" },
            { value: "waiting_part", label: "Waiting Part" },
            { value: "rework", label: "Rework" },
          ]}
          dropdownDefaultValue="delay"
          onSave={async (dropdown) => {
            console.log("save:", dropdown);
            setOpenRemark(false);
            try {
              const result = await Swal.fire({
                title: "ยืนยันการบันทึก?",
                text: `Remark: ${dropdown}`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "บันทึก",
                cancelButtonText: "ยกเลิก",
              });

              if (!result.isConfirmed) return;

              Swal.fire({
                title: "กำลังบันทึก...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
              });

              const res = await callApi.post("/WorkOrderList/RemarkStop", {
                WORK_ORDER_OPERATION_ID: work?.worK_ORDER_OPERATION_ID,
                stop_remark: dropdown,
              });

              console.log("res:", res.data);

              await Swal.fire({
                title: "บันทึกสำเร็จ",
                text: res.data?.message ?? "Saved",
                icon: "success",
                timer: 1400,
                showConfirmButton: false,
              });

              setOpenRemark(false);
            } catch (err: any) {
              console.log(err);

              await Swal.fire({
                title: "บันทึกไม่สำเร็จ",
                text:
                  err?.response?.data?.message ??
                  err?.message ??
                  "เกิดข้อผิดพลาด กรุณาลองใหม่",
                icon: "error",
              });
            }
          }}
        />


        <EmployeeMultiSelectModal
          open={openEmpModal}
          onClose={() => setOpenEmpModal(false)}
          initialSelected={selectedEmployees}
          onConfirm={handleConfirmEmployeesAndStart}
        />

      </div>
    </div>
  );
}
