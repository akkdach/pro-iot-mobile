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
  CircularProgress,
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
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import ReplayIcon from "@mui/icons-material/Replay";
import UndoIcon from "@mui/icons-material/Undo";
import { useNavigate } from "react-router-dom";
import CountTime from "../../Utility/countTime";
import SimpleElapsedTimer from "../../Utility/SimpleElapsedTimer";
import StandardTimeCountdown from "../../Utility/StandardTimeCountdown";
import { SlaTimer } from "../../Utility/SlaTimer";
import { RemarkField } from "../../Utility/RemarkField";
import EmployeeMultiSelectModal, { Employee } from "../../Utility/EmployeeSelect";
import WorkerRows from "../../Utility/WorkerRows";
import { CloseWorkMaster } from "../../Utility/CloseWorkMaster";
import StationChecklist from "./StationChecklist";

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

type DbItem = { code: string; isActive: boolean | null };

const paginationModel = { page: 0, pageSize: 5 };

const checkItems = [
  { code: "0010", label: "Inspector" },
  { code: "0020", label: "Remove Part" },
  { code: "0030", label: "Clean" },
  { code: "0040", label: "Color" },
  { code: "0050", label: "Fix Cooling" },
  { code: "0060", label: "Assembly Part" },
  { code: "0070", label: "Test" },
  { code: "0080", label: "Qc" },
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

// แปลง station พิเศษ → station หลัก เพื่อดึงพนักงาน
const getParentStation = (station: string): string => {
  const specialStationMap: Record<string, string> = {
    "0049": "0040",
    "0079": "0070",
    "0089": "0080",
  };
  return specialStationMap[station] ?? station;
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
    checkList,
    setCheckList,
    qcReturnWork,
    submitChecklist,
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
  const [openChecklist, setOpenChecklist] = useState(false);
  const [checklistToken, setChecklistToken] = useState<string | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const [getWorker, setGetWorker] = useState<any>([]);

  const [checkedCodes, setCheckedCodes] = React.useState<string[]>([]);

  const [dbItems, setDbItems] = useState<DbItem[]>([]);
  const [visibleItems, setVisibleItems] = useState(checkItems);

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
    console.log("checked codes:", checkedCodes);
  }, [checkedCodes]);

  useEffect(() => {
    onLoad();
    onLoad2();
    onLoad3();
    onLoad4();
  }, []);

  const normalizeStation = (s?: string) => (s ? s.toString().padStart(4, "0") : "");

  useEffect(() => {
    const st = normalizeStation(row?.current_operation);

    if (!orderId) return;
    onLoad5();
  }, [orderId, row?.current_operation]);

  const onLoad = async () => {
    // ดึงข้อมูล items_component + Master spare part list พร้อมกัน
    const [res, resMaster] = await Promise.all([
      callApi.get(`/WorkOrderList/items_component/${orderId}`),
      callApi.get("/Mobile/RemainingSparepart").catch(() => null),
    ]);

    console.log("data Result No 1 : ", res.data.dataResult);
    const data = res.data.dataResult;
    const masterList: any[] = resMaster?.data?.dataResult?.sparepartList ?? [];

    if (data != null) {
      let newData = data.map((item: any) => {
        // พยายามหาชื่ออะไหล่จาก response ก่อน
        let desc = item?.matL_DESC || item?.MATL_DESC || item?.MatlDesc || item?.materialDescription;

        // ถ้าไม่มี → fallback ไปหาจาก Master List
        if (!desc && masterList.length > 0) {
          const matKey = item?.material || item?.reS_ITEM;
          const master = masterList.find((s: any) => s.material === matKey);
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
      duratioN_NORMAL: item.duratioN_NORMAL ?? item.DURATION_NORMAL ?? 0,
    }));



    // Check if work is currently in progress
    const startDate = item.acT_START_DATE ?? item.ACT_START_DATE;
    const endDate = item.acT_END_DATE ?? item.ACT_END_DATE;

    // If we have a start date but no end date, it means work is in progress.
    if (startDate && !endDate) {
      setIsWorking(true);
    } else {
      setIsWorking(false);
    }
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
          console.log(`🖼️ [${targetKey}] DB URL: "${serverUrl}" → Fixed URL: "${fixedUrl}"`);

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
    const currentStation = String(row?.current_operation ?? "").padStart(4, "0");
    const parentStation = getParentStation(currentStation);
    console.log(`[onLoad4] currentStation: ${currentStation}, parentStation: ${parentStation}`);

    // ถ้าเป็น station พิเศษ → ดึงพนักงานจากทั้ง station หลักและ station พิเศษ
    if (currentStation !== parentStation) {
      const [res1, res2] = await Promise.all([
        callApi.get(`/WorkOrderList/GetEmployee/${orderId}/${parentStation}`),  // พนักงาน station หลัก (เช่น 0040)
        callApi.get(`/WorkOrderList/GetEmployee/${orderId}/${currentStation}`), // พนักงาน station พิเศษ (เช่น 0049)
      ]);

      // รวมข้อมูลพนักงานทั้ง 2 station
      const combined = [
        ...(res1.data?.dataResult ?? []),
        ...(res2.data?.dataResult ?? []),
      ];
      console.log("data refurbish employees (combined) : ", combined);
      setGetWorker({ dataResult: combined });
    } else {
      // station ปกติ → ดึงแค่ station เดียว
      const res = await callApi.get(`/WorkOrderList/GetEmployee/${orderId}/${currentStation}`);
      console.log("data refurbish employees : ", res.data);
      setGetWorker(res.data);
    }
  }


  const onLoad5 = async () => {
    const res = await callApi.get(`/WorkOrderList/Checked/${orderId}`);
    const data = res.data;
    console.log("data checked in onLoad5 : ", data);

    // dataResult คือ Array ของ object
    const items: { code: string; isActive: boolean | null }[] =
      data?.dataResult ?? [];

    if (items.length === 0) {
      setVisibleItems(checkItems);
      // setCheckedCodes([]);
      const station = String(row?.current_operation ?? "");
      if (station === "0010") {
        setCheckedCodes(checkItems.map(c => c.code));
      } else {
        setCheckedCodes([]);
      }

      return;
    }

    // แสดง checkbox ตามจำนวนที่ได้มา
    const itemsToShow = checkItems.filter((c) =>
      items.some((i) => i.code === c.code)
    );
    setVisibleItems(itemsToShow);
    // เพิ่มเช็ค station 0010 ตรงนี้
    const station = String(row?.current_operation ?? "");

    // if (station === "0010") {
    //   // Station 0010 → ติ๊กทั้งหมดเสมอ
    //   setCheckedCodes(checkItems.map(c => c.code));
    // } else {
    //   // Station อื่น → ติ๊กตาม Backend
    //   const codes = items
    //     .filter((i) => i.isActive === true)
    //     .map((i) => i.code);
    //   setCheckedCodes(codes);
    // }

    const codes = items
      .filter((i) => i.isActive === true)
      .map((i) => i.code);
    setCheckedCodes(codes);
  };




  const handleConfirmEmployeesAndStart = async (emps: Employee[]) => {
    setOpenEmpModal(false);

    try {
      setIsWorking(true);
      setSelectedEmployees(emps);

      // ใช้ useParams เป็น fallback กรณี work state ยังโหลดไม่เสร็จ
      const currentOrderId = work?.orderid ?? orderId;
      const currentOperation = work?.current_operation ?? row?.current_operation;

      const payload = emps.map((e) => ({
        ORDERID: currentOrderId,
        current_operation: currentOperation,
        PERSONNEL_NUMBER: e.personnelNumber,
        NAME: e.personnelName,
      }));

      console.log("payload : ", payload);

      await callApi.post(`/WorkOrderList/Employee/${currentOrderId}/${currentOperation}`, payload);

      await startWork({ orderid: currentOrderId, current_operation: currentOperation });
      await onLoad4();
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
            imaStdId: img.id,
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

  const normalizedOp = (row?.station ?? row?.current_operation ?? work?.current_operation)?.toString().padStart(4, "0");
  console.log("🔍 normalizedOp:", normalizedOp, "| row?.station:", row?.station, "| work?.current_operation:", work?.current_operation);
  const hasStarted = !!work?.actuaL_START_DATE;
  const hasFinished = !!work?.actuaL_FINISH_DATE;

  //console.log("Item component : ", item_component);

  const station = String(row?.current_operation ?? "");
  const canEditChecklist = station === "0010";

  const toggleCode = (code: string) => {
    setCheckedCodes((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );

  };

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
              label="Sparepart"
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

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", p: 3 }}>
                {visibleItems.map((item) => {
                  const checked = checkedCodes.includes(item.code);

                  return (
                    <FormControlLabel
                      key={item.code}
                      disabled={!canEditChecklist}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => {
                            if (!canEditChecklist) return;
                            toggleCode(item.code);
                            console.log("checked station code:", item.code);
                          }}
                          sx={{
                            color: "#1976d2",
                            "&.Mui-checked": { color: "#0d47a1" },
                          }}
                        />
                      }
                      label={`${item.label}`}
                      sx={{
                        m: 0,
                        p: 1,
                        px: 2,
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#fafafa",
                        transition: "0.2s",
                        "&:hover": canEditChecklist
                          ? { backgroundColor: "#f0f7ff", borderColor: "#90caf9" }
                          : undefined,
                      }}
                    />
                  );
                })}
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
              {/* ── AGENTIC TIMER CARD ── */}
              <Paper
                elevation={6}
                sx={{
                  mb: 2,
                  p: { xs: 2, sm: 2.5 },
                  display: "flex",
                  alignItems: "stretch",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: 4,
                  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  position: "relative",
                  overflow: "hidden",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                {/* Decorative circle */}
                <Box
                  sx={{
                    position: "absolute",
                    right: -30,
                    top: -30,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "rgba(37, 99, 235, 0.04)",
                  }}
                />

                {/* LEFT — Elapsed Time */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", mb: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, textTransform: "uppercase" }}>
                      Elapsed
                    </Typography>
                  </Box>
                  <Typography
                    component="div"
                    sx={{
                      fontWeight: 800,
                      background: isWorking
                        ? "linear-gradient(to right, #2563EB, #4F46E5)"
                        : "linear-gradient(to right, #64748B, #94A3B8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
                      letterSpacing: -0.5,
                      lineHeight: 1.1,
                    }}
                  >
                    <SimpleElapsedTimer
                      startAt={work?.acT_START_DATE ?? "00:00:00"}
                      running={isWorking}
                    />
                  </Typography>
                </Box>

                {/* Vertical Divider */}
                <Box sx={{ width: "1px", bgcolor: "#e2e8f0", my: 0.5, flexShrink: 0 }} />

                {/* RIGHT — Standard Time Countdown */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", mb: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, textTransform: "uppercase" }}>
                      Std. Time
                    </Typography>
                  </Box>
                  <StandardTimeCountdown
                    startAt={work?.acT_START_DATE}
                    durationMinutes={work?.duratioN_NORMAL}
                    running={isWorking}
                  />
                </Box>
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

          {/* ── ACTION BUTTONS ── */}
          <Box sx={{ px: 2, pb: 3, pt: 1 }}>

            {/* ─── PRIMARY: Start / Finish ─── */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2.5 }}>
              {!isWorking && !hasFinished && (
                <Button
                  onClick={() => setOpenEmpModal(true)}
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon />}
                  sx={{
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    borderRadius: "14px",
                    minWidth: 200,
                    height: 64,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    textTransform: "none",
                    letterSpacing: 0.5,
                    boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(34,197,94,0.5)",
                    },
                    "&:active": { transform: "scale(0.97)" },
                  }}
                >
                  Start
                </Button>
              )}

              {isWorking && (
                <Button
                  onClick={async () => {
                    const mapped = checkedCodes.map((code) => ({ code }));
                    setCheckList(mapped);
                    setIsWorking(false);
                    const isSuccess = await finishWork(mapped);
                    if (isSuccess) { navigate(-1); }
                  }}
                  variant="contained"
                  startIcon={<CheckCircleOutlineIcon />}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    borderRadius: "14px",
                    minWidth: 200,
                    height: 64,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    textTransform: "none",
                    letterSpacing: 0.5,
                    boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(59,130,246,0.5)",
                    },
                    "&:active": { transform: "scale(0.97)" },
                  }}
                >
                  Finish
                </Button>
              )}
            </Box>

            {/* ─── Divider ─── */}
            <Divider sx={{ mb: 2, borderColor: "rgba(0,0,0,0.06)" }} />

            {/* ─── SECONDARY: Check List, Completed, Remark ─── */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
              {["0010", "0030", "0070"].includes(normalizedOp ?? "") && (
                <Button
                  onClick={async () => {
                    setChecklistLoading(true);
                    try {
                      const bearerToken = localStorage.getItem('token') ?? '';
                      const res = await fetch(`${process.env.REACT_APP_SERVICE_MANAGEMENT_URL}/api/v1/checklist/token`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${bearerToken}`,
                        },
                        body: JSON.stringify({
                          orderId: orderId ?? "",
                          updatedBy: (() => {
                            try {
                              const p = localStorage.getItem("profile");
                              return p ? JSON.parse(p).employee_id ?? "unknown" : "unknown";
                            } catch { return "unknown"; }
                          })(),
                        }),
                      });
                      const data = await res.json();
                      setChecklistToken(data.token);
                      setOpenChecklist(true);
                    } catch (err) {
                      console.error("❌ Failed to get checklist token:", err);
                    } finally {
                      setChecklistLoading(false);
                    }
                  }}
                  variant="outlined"
                  startIcon={<FactCheckIcon />}
                  sx={{
                    borderRadius: "12px",
                    minWidth: 150,
                    height: 48,
                    fontSize: 15,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#3b82f6",
                    color: "#3b82f6",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#2563eb",
                      backgroundColor: "rgba(59,130,246,0.06)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Check List
                </Button>
              )}

              <Button
                onClick={completed}
                variant="outlined"
                startIcon={<AssignmentTurnedInIcon />}
                sx={{
                  borderRadius: "12px",
                  minWidth: 150,
                  height: 48,
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#8b5cf6",
                  color: "#8b5cf6",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#7c3aed",
                    backgroundColor: "rgba(139,92,246,0.06)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Completed
              </Button>

              <Button
                onClick={() => setOpenRemark(true)}
                variant="outlined"
                startIcon={<StickyNote2OutlinedIcon />}
                sx={{
                  borderRadius: "12px",
                  minWidth: 150,
                  height: 48,
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#64748b",
                  color: "#64748b",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#475569",
                    backgroundColor: "rgba(100,116,139,0.06)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Remark
              </Button>
            </Box>

            {/* ─── DANGER: Return, Qc Return ─── */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                onClick={returnWork}
                variant="outlined"
                startIcon={<ReplayIcon />}
                sx={{
                  borderRadius: "12px",
                  minWidth: 150,
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#dc2626",
                    backgroundColor: "rgba(239,68,68,0.06)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Return
              </Button>

              <Button
                onClick={qcReturnWork}
                variant="outlined"
                startIcon={<UndoIcon />}
                sx={{
                  borderRadius: "12px",
                  minWidth: 150,
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#dc2626",
                    backgroundColor: "rgba(239,68,68,0.06)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                QC Return
              </Button>
            </Box>

          </Box>
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
                  navigate(`/TableSparePart/${orderId}`);
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

      <AppHeader title={row?.title || "Work Order"} icon={<BusinessCenterIcon />} />

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
                stop_remark: dropdown, current_operation: work?.current_operation,
                ORDERID: work?.orderid,
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


        {/* Station Checklist Dialog (iframe embed) */}
        <Dialog
          open={openChecklist}
          onClose={() => setOpenChecklist(false)}
          fullWidth
          maxWidth={normalizedOp === "0010" ? "sm" : "lg"}
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: "90vh",
            },
          }}
        >
          <Button
            onClick={() => setOpenChecklist(false)}
            color="inherit"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: "50%",
              fontSize: "1.2rem",
              zIndex: 1,
              color: "#64748B",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" },
            }}
          >
            ✕
          </Button>
          <DialogContent sx={{ p: 0 }}>
            {checklistToken ? (() => {
              const bearerToken = localStorage.getItem('token') ?? '';
              const authParam = bearerToken ? `&auth=${encodeURIComponent(bearerToken)}` : '';

              return normalizedOp === "0010" ? (
                /* Inspector — ติ๊กเปลี่ยน/ล้าง */
                <iframe
                  src={`${process.env.REACT_APP_SERVICE_MANAGEMENT_URL}/checklist/embed-inspector?token=${encodeURIComponent(checklistToken)}&station=${encodeURIComponent(normalizedOp ?? "")}${authParam}`}
                  width="100%"
                  height="600px"
                  style={{ border: "none" }}
                  title="Station Checklist"
                />
              ) : (
                /* Station อื่น — แสดง 2 iframe คู่กัน */
                <Box sx={{ display: "flex", width: "100%", height: "600px" }}>
                  {/* งานจาก Inspector (read-only) */}
                  <iframe
                    src={`${process.env.REACT_APP_SERVICE_MANAGEMENT_URL}/checklist/embed-work?token=${encodeURIComponent(checklistToken)}&station=${encodeURIComponent(row?.station ?? normalizedOp ?? "")}${authParam}`}
                    width="50%"
                    height="100%"
                    style={{ border: "none", borderRight: "1px solid #E2E8F0" }}
                    title="Inspector Work"
                  />
                  {/* Checklist กรอกงาน */}
                  <iframe
                    src={`${process.env.REACT_APP_SERVICE_MANAGEMENT_URL}/checklist/embed?token=${encodeURIComponent(checklistToken)}&station=${encodeURIComponent(row?.station ?? normalizedOp ?? "")}${authParam}`}
                    width="50%"
                    height="100%"
                    style={{ border: "none" }}
                    title="Station Checklist"
                  />
                </Box>
              );
            })() : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <CircularProgress size={32} />
              </Box>
            )}
          </DialogContent>
        </Dialog>

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
