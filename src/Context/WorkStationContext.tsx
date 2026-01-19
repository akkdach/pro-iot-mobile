import axios from "axios";
import React, { createContext, useContext, useState } from "react";
import callApi from "../Services/callApi";
import Header from "../Layout/Header";
import Swal from "sweetalert2";
import { steps } from "../Pages/workStation/SetupAndRefurbish";
import CountTime from "../Utility/countTime";
import { useTimer } from "../Context/TimerContext";
import { CloseWorkMaster } from "../Utility/CloseWorkMaster";

interface Work {
  orderid?: string;
  ordeR_TYPE?: string;
  shorT_TEXT?: string;
  equipment?: string;
  weB_STATUS?: string;
  state?: string;

  actuaL_START_DATE?: string;
  actuaL_FINISH_DATE?: string;
  servicE_TIME?: Number;
  actuaL_START_TIME?: string;
  actuaL_FINISH_TIME?: string;

  current_operation?: string;

  acT_START_DATE?: Date;
  acT_START_TIME?: Date;
  acT_END_DATE?: Date;
  acT_END_TIME?: Date;

  worK_ACTUAL?: string;

  worK_ORDER_OPERATION_ID?: number;
  worK_ORDER_COMPONENT_ID?: number;

  mN_WK_CTR?: string;

  slA_FINISH_DATE?: Date;
  slA_FINISH_TIME?: string;
  slA_START_DATE?: Date;
  slA_START_TIME?: string;
}

interface Item_Component {
  worK_ORDER_COMPONENT_ID?: number;
  orderid?: string;
  reS_ITEM?: string;
  reserV_NO?: string;
  matL_DESC?: string;
  actuaL_QUANTITY?: number;
  actuaL_QUANTITY_UNIT?: string;
  material?: string;
}

interface SparePartApi {
  imageUrl?: string;
  material: string;
  materialDescription?: string;
  onWithdraw?: number;
  quotaStock?: number;
  znew?: number;
}

interface CartItem {
  item: SparePartApi;
  qty: number;
}

interface CheckOutCloseType {
  workOrder?: string;
  closeType?: number;
  code?: string | null;
  shortText?: string | null;
  lat?: number;
  lon?: number;
  mobile_remark?: string | null;
}

interface CheckList {
  code?: string;
}

interface WorkContextType {
  work: Work | null;
  setWork: React.Dispatch<React.SetStateAction<Work | null>>;

  item_component: Item_Component[] | null;
  setItem_Component: React.Dispatch<
    React.SetStateAction<Item_Component[] | null>
  >;

  checkOutCloseType: CheckOutCloseType | null;
  setCheckOutCloseType: React.Dispatch<
    React.SetStateAction<CheckOutCloseType | null>
  >;

  sparePart: SparePartApi[] | null;
  setSparePart: React.Dispatch<React.SetStateAction<SparePartApi[] | null>>;

  cartItem: CartItem[] | null;
  setCartItem: React.Dispatch<React.SetStateAction<CartItem[] | null>>;

  hasStarted: boolean | null;
  setHasStarted: React.Dispatch<React.SetStateAction<boolean | null>>;

  checkList: CheckList[] | null;
  setCheckList: React.Dispatch<React.SetStateAction<CheckList[] | null>>;

  startWork: () => void;
  pauseWork: () => void;
  finishWork: (codes?: { code?: string }[]) => void;
  checkListWork: () => void;
  completed: () => void;
  returnWork: () => void;

  addPart: (name: String, qty: number) => void;
  deletePart: (itemId: any) => void;
  setScannedCode: (code: String) => void;
  setUploadImage: (file: File[]) => void;
  submitWork: () => void;
}

const WorkContext = createContext<WorkContextType | null>(null);

export const WorkProvider = ({ children }: { children: React.ReactNode }) => {
  const [work, setWork] = useState<Work | null>(null);
  const [item_component, setItem_Component] = useState<Item_Component[] | null>(
    null
  );
  const [hasStarted, setHasStarted] = useState<boolean | null>(false);
  const [sparePart, setSparePart] = useState<SparePartApi[] | null>(null);
  const [cartItem, setCartItem] = useState<CartItem[] | null>(null);

  const [checkOutCloseType, setCheckOutCloseType] = useState<
    CheckOutCloseType | null
  >(null);

  const [checkList, setCheckList] = useState<CheckList[] | null>(null);

  const timer = useTimer();

  const startWork = async () => {
    console.log("Work is start", work);
    try {
      if (!work?.orderid) return;

      console.log("Work is start", work.orderid);




      const confirm = await Swal.fire({
        title: "Start Work?",
        text: `Start Work Order: ${work.orderid}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Start",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#27ae60",
        cancelButtonColor: "#e74c3c",
      });

      if (!confirm.isConfirmed) return;


      const res = await callApi.post("/WorkOrderList/Start", {
        ORDERID: work?.orderid,
        current_operation: work?.current_operation ?? "",
      });

      const data = res.data;
      // console.log("Start Work : ", res);
      if (!data.isSuccess) {
        await Swal.fire({
          title: "Failed",
          text: data.Message ?? "Cannot start this work order",
          icon: "error",
        });
        return;
      }

      timer.start();

      setWork((prev) => ({
        ...prev!,
        orderid: data.dataResult?.orderid,
        acT_START_DATE: data.dataResult?.acT_START_DATE,
        acT_START_TIME: data.dataResult?.acT_START_TIME,
        weB_STATUS: data.dataResult?.WEB_STATUS,
        current_operation: data.dataResult?.current_operation,
      }));

      setHasStarted(true);

      await Swal.fire({
        title: "Success!",
        text: "Work order has been started.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("Start Work Error:", err);

      await Swal.fire({
        title: "Error",
        text: err.response?.data?.Message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  const pauseWork = () => {
    console.log("work is pause");
  };

  const finishWork = async (codes?: { code?: string }[]) => {
    console.log("work is finish");
    console.log("checkList in context : ", codes);
    try {
      if (!work?.orderid) return;

      const confirm = await Swal.fire({
        title: "Finish Work?",
        text: `Are you sure you want to finish Work Order: ${work.orderid}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Finish",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3498db",
        cancelButtonColor: "#e74c3c",
      });

      if (!confirm.isConfirmed) return;

      const res = await callApi.post(
        "/WorkOrderList/Finish",
        { ORDERID: work?.orderid, current_operation: work?.current_operation, CHECKED_CODE: codes?.map((c) => c.code) },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      console.log("Finish Work : ", data);

      if (!data.isSuccess) {
        await Swal.fire({
          title: "Failed",
          text: data.Message ?? data.message ?? "Cannot finish this work order",
          icon: "error",
        });
        return;
      }

      setWork((prev) => ({
        ...prev!,
        orderid: data.dataResult?.orderid,
        acT_END_DATE: data.dataResult?.acT_END_DATE,
        acT_END_TIME: data.dataResult?.acT_END_TIME,
        weB_STATUS: data.dataResult?.WEB_STATUS,
        current_operation: data.dataResult?.current_operation,
        worK_ACTUAL: data.dataResult?.worK_ACTUAL,
      }));

      timer.stop();

      await Swal.fire({
        title: "Finished!",
        text: "Work order has been finished successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("FinishWork Error:", err);
      await Swal.fire({
        title: "Error",
        text: err.response?.data?.Message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  const checkListWork = async () => {
    console.log("work is check list");
    if (!work?.orderid) return;

    const pick = await Swal.fire({
      title: "Choose Mode",
      text: "Select action type:",
      icon: "question",
      showCancelButton: true,

      confirmButtonText: "ปกติ",
      confirmButtonColor: "#1976d2",

      showDenyButton: true,
      denyButtonText: "ไม่ปกติ",
      denyButtonColor: "#f39c12",

      cancelButtonText: "Cancel",
      cancelButtonColor: "#95a5a6",
    });

    // ยกเลิก
    if (pick.isDismissed) return;

    // ปกติ -> เรียก API ตัวเดิม
    if (pick.isConfirmed) {
      try {
        const res = await callApi.get(
          `/Mobile/GetCheckOutCloseType?WorkOrder=${encodeURIComponent(String(work.orderid))}`
        );
        const data = res.data.dataResult;
        console.log("Normal API data:", data);

        const newCloseType = {
          closeType: 1,
          workOrder: work?.orderid,
          shortText: "",
          mobile_remark: "",
          lat: 0,
          lon: 0,
          code: "",
        };

        const confirmSend = await Swal.fire({
          title: "ยืนยันข้อมูล",
          html: `
    <div style="text-align: left;">
      <p><strong>Work Order:</strong> ${newCloseType.workOrder ?? "-"}</p>
      <p><strong>Close Type:</strong> ${newCloseType.closeType ?? "-"}</p>
      <p><strong>Code:</strong> ${newCloseType.code ?? "-"}</p>
      <p><strong>เวลาเริ่ม :</strong> ${work?.actuaL_START_DATE ?? "-"}</p>
      <p><strong>เวลาสิ้นสุด :</strong> ${work?.actuaL_FINISH_DATE ?? "-"}</p>
      <p><strong>Location:</strong> ${newCloseType.lat}, ${newCloseType.lon}</p>
    </div>
  `,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
          confirmButtonColor: "#27ae60",
          cancelButtonColor: "#e74c3c",
        });
        // ถ้าไม่ยืนยัน ให้หยุด
        if (!confirmSend.isConfirmed) return;

        setCheckOutCloseType(newCloseType);
        console.log("CheckOutCloseType: ", newCloseType);
        const send_close_type = await callApi.post("/Mobile/SetCheckOutCloseType", newCloseType);
        const data_close_normal = send_close_type.data;
        console.log("Send Close Type Normal: ", data_close_normal);

        // TODO: เอา data ไปทำ swal select ต่อ
        await Swal.fire({
          title: "ปกติ",
          text: "Loaded close type (TODO: show select).",
          icon: "success",
        });
      } catch (err) {
        console.log("Normal flow error:", err);
        await Swal.fire({
          title: "Error",
          text: "Cannot load close type.",
          icon: "error",
        });
      }
      return;
    }

    // ไม่ปกติ -> เรียก API อีกตัว (ตอนนี้ยังไม่เสร็จ)
    if (pick.isDenied) {
      console.log("work is not normal : ", work?.ordeR_TYPE);
      const type = work?.ordeR_TYPE;
      const options = CloseWorkMaster(type);

      if (!options || options.length === 0) {
        await Swal.fire({
          title: "Not normal",
          text: `ไม่พบตัวเลือกการปิดงานสำหรับ OrderType: ${type ?? "-"}`,
          icon: "warning",
        });
        return;
      }

      const inputOptions: Record<string, string> = Object.fromEntries(
        options.map((item: any) => [String(item.value), String(item.label)])
      );

      const defaultValue = String(
        options.find((x: any) => x.checked)?.value ?? options[0].value
      );

      const { isConfirmed, value } = await Swal.fire({
        title: "Not normal",
        text: "กรุณาเลือกประเภทการปิดงาน",
        icon: "info",
        input: "select",
        inputOptions,
        inputValue: defaultValue,
        inputPlaceholder: "เลือกการปิดงาน",
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        inputValidator: (v) => (!v ? "กรุณาเลือกประเภทการปิดงาน" : undefined),
      });

      if (!isConfirmed) return;

      const selectedValue = String(value);
      const selected = options.find((x: any) => String(x.value) === selectedValue);

      console.log("Selected close type:", selected);


      if (!work?.orderid) {
        await Swal.fire({
          title: "Error",
          text: "ไม่พบ workOrder (orderid)",
          icon: "error",
        });
        return;
      }

      const newCloseType_not_normal = {
        closeType: Number(selectedValue),
        workOrder: work.orderid,
        shortText: "",
        mobile_remark: "",
        lat: 0,
        lon: 0,
        code: String(selected?.value ?? ""),
      };

      const confirm = await Swal.fire({
        title: "ยืนยันการส่งข้อมูล?",
        html: `
    <div style="text-align:left; line-height:1.6">
      <div><b>WorkOrder:</b> ${newCloseType_not_normal.workOrder}</div>
      <div><b>Close Type:</b> ${newCloseType_not_normal.closeType}</div>
      <div><b>รายการ:</b> ${selected?.label ?? "-"}</div>
    </div>
  `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ยืนยันส่ง",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
      });

      if (!confirm.isConfirmed) return;

      setCheckOutCloseType(newCloseType_not_normal);

      try {
        Swal.fire({
          title: "กำลังส่งข้อมูล...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const send_close_not_normal = await callApi.post(
          "/Mobile/SetCheckOutCloseType",
          newCloseType_not_normal,
          { headers: { "Content-Type": "application/json" } }
        );

        const data_close_not_normal = send_close_not_normal.data;
        console.log("Send Close Type Not Normal: ", data_close_not_normal);

        await Swal.fire({
          title: "ส่งสำเร็จ",
          text: data_close_not_normal?.Message ?? "บันทึกเรียบร้อย",
          icon: "success",
        });
      } catch (err: any) {
        console.log(err);

        await Swal.fire({
          title: "ส่งไม่สำเร็จ",
          text:
            err?.response?.data?.Message ||
            err?.message ||
            "เกิดข้อผิดพลาดระหว่างส่งข้อมูล",
          icon: "error",
        });
      }

      return;
    }
  };

  const completed = async () => {
    console.log("work is completed");

    const CompletedOptions: Record<string, string> = {
      completed: "Completed",
      waiting_part: "Waiting Part",
      rework: "Rework",
    };
    try {
      if (!work?.orderid) return;

      const confirm = await Swal.fire({
        title: "Completed Work?",
        text: `Are you sure you want to Completed Work Order: ${work.orderid}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Completed",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3498db",
        cancelButtonColor: "#e74c3c",
      });

      if (!confirm.isConfirmed) return;

      //const currentOp = work.current_operation ?? "0010";

      const res = await callApi.post(
        "/WorkOrderList/Completed",
        { ORDERID: work?.orderid },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data;
      console.log("Completed Work : ", data);

      if (!data.isSuccess) {
        await Swal.fire({
          title: "Failed",
          text:
            data.Message ?? data.message ?? "Cannot completed this work order",
          icon: "error",
        });
        return;
      }

      setWork((prev) => ({
        ...prev!,
        orderid: data.dataResult?.ORDERID,
        weB_STATUS: data.dataResult?.WEB_STATUS,
        current_operation: data.dataResult?.current_operation,
      }));

      await Swal.fire({
        title: "Finished!",
        text: "Work order has been completed successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("CompletedWork Error:", err);
      await Swal.fire({
        title: "Error",
        text: err.response?.data?.Message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  const returnWork = async () => {
    console.log("work is return", work);

    const remarkOptions: Record<string, string> = {
      delay: "Delay",
      waiting_part: "Waiting Part",
      rework: "Rework",
    };

    try {
      if (!work?.orderid) return;

      const pad4 = (v: any) => String(v ?? "").trim().padStart(4, "0");

      const injectedToBase: Record<string, string> = {
        "0049": "0040",
        "0079": "0070",
      };

      // const getReturnableStations = (currentStation?: string | String) => {
      //   if (!currentStation) return {};

      //   const stationCode = currentStation.toString().padStart(4, "0");
      //   console.log(
      //     "currentStation raw >>>",
      //     currentStation,
      //     "normalized >>>",
      //     stationCode
      //   );

      //   const stationSteps = steps.filter((s) => s.station);

      //   const currentIndex = stationSteps.findIndex(
      //     (s) => s.station === stationCode
      //   );

      //   console.log("currentIndex >>>", currentIndex);

      //   if (currentIndex <= 0) return {};

      //   const available: Record<string, string> = {};

      //   for (let i = 0; i < currentIndex; i++) {
      //     const item = stationSteps[i];
      //     if (item.station) {
      //       available[item.station] = item.title;
      //     }
      //   }

      //   return available;
      // };

      const getReturnableStations = (currentStation?: string | String) => {
        if (!currentStation) return {};

        const stationCode = pad4(currentStation);
        const lookupCode = injectedToBase[stationCode] ?? stationCode;

        console.log(
          "currentStation raw >>>",
          currentStation,
          "normalized >>>",
          stationCode,
          "lookup >>>",
          lookupCode
        );

        const stationSteps = steps
          .filter((s) => s.station)
          .map((s) => ({ ...s, station: pad4(s.station) })); // normalize steps ด้วย

        const currentIndex = stationSteps.findIndex((s) => s.station === lookupCode);

        console.log("currentIndex >>>", currentIndex);

        if (currentIndex <= 0) return {}; // -1 หรือ 0 = return ไม่ได้

        const available: Record<string, string> = {};
        for (let i = 0; i < currentIndex; i++) {
          const item = stationSteps[i];
          if (item.station) available[item.station] = item.title;
        }

        // ถ้าอยากให้เลือก “รวมสถานีฐาน” ด้วย (0040/0070) ก็ต้องใส่ให้ถูก
        available[lookupCode] =
          stationSteps.find((s) => s.station === lookupCode)?.title ?? lookupCode;

        return available;
      };


      const visitedStations = getReturnableStations(work.current_operation);

      if (!visitedStations || Object.keys(visitedStations).length === 0) {
        await Swal.fire({
          title: "Cannot Return",
          text: "This work order cannot be returned to any previous station.",
          icon: "info",
        });
        return;
      }

      const confirm = await Swal.fire({
        title: "Return Work Order",
        text: "Select station to rollback:",
        icon: "warning",
        input: "select",
        inputOptions: visitedStations,
        inputPlaceholder: "Choose station...",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#e67e22",
        cancelButtonColor: "#95a5a6",
      });

      if (!confirm.isConfirmed) return;

      const selectedStation = confirm.value as string;


      const remarkConfirm = await Swal.fire({
        title: "Return Remark",
        text: "Select reason for return:",
        icon: "question",
        input: "select",
        inputOptions: remarkOptions,
        inputPlaceholder: "Choose reason...",
        showCancelButton: true,
        confirmButtonText: "Next",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#1976d2",
        cancelButtonColor: "#95a5a6",
        inputValidator: (v) => (!v ? "Please choose a reason" : undefined),
      });

      if (!remarkConfirm.isConfirmed) return;

      const selectedRemark = remarkConfirm.value as string;

      const payloadReturn = {
        ORDERID: work?.orderid,
        current_operation: selectedStation,
      };

      const payloadRemark = {
        ORDERID: work?.orderid,
        return_remark: selectedRemark,
      };

      const [res_return, res_remark] = await Promise.all([
        callApi.post("/WorkOrderList/Return", payloadReturn, {
          headers: { "Content-Type": "application/json" },
        }),
        callApi.post("/WorkOrderList/RemarkReturn", payloadRemark, {
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      const data_return = res_return.data;
      const data_remark = res_remark.data;

      if (!data_return?.isSuccess || !data_remark?.isSuccess) {
        await Swal.fire({
          title: "Failed",
          text:
            data_return?.Message ??
            data_return?.message ??
            data_remark?.Message ??
            data_remark?.message ??
            "Cannot return / save remark",
          icon: "error",
        });
        return;
      }

      setWork((prev) => (prev ? { ...prev, current_operation: selectedStation } : prev));

      await Swal.fire({
        title: "Finished!",
        text: "Work order has been returned successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("ReturnWork Error:", err);
      await Swal.fire({
        title: "Error",
        text: err.response?.data?.Message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  const addPart = async (name: String, qty: number) => {
    console.log(`add part is working`);
    try {
      if (!work?.orderid) return;

      if (qty <= 0) {
        alert("spare part must more than 0");
      }

      const res = await callApi.post(
        "/WorkOrderList/SparePart",
        { ORDERID: work?.orderid, RES_ITEM: name, ACTUAL_QUANTITY: qty },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data;
      console.log("Add spare part : ", data);

      if (!data.IsSuccess) {
        alert("Add spare part fail : ");
        return;
      }

      const dto = data.DataResult;

      const newItem: Item_Component = {
        orderid: dto?.ORDERID,
        reS_ITEM: dto?.RES_ITEM,
        actuaL_QUANTITY: dto?.ACTUAL_QUANTITY,
      };

      setItem_Component((prev) => [...(prev ?? []), newItem]);

      alert("Add new spare part successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const deletePart = async (itemId: any) => {
    try {
      const result = await Swal.fire({
        title: "ยืนยันการลบ?",
        text: "คุณต้องการลบรายการอะไหล่นี้ใช่หรือไม่",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#D32F2F",
        cancelButtonColor: "#9E9E9E",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      console.log("Deleting item with ID: ", itemId);

      Swal.fire({
        title: "กำลังลบ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await callApi.delete(`/WorkOrderList/SparePart/${itemId}`);
      const data = res.data;

      Swal.close();

      if (data.dataResult.isSuccess === false) {
        await Swal.fire({
          icon: "error",
          title: "ลบไม่สำเร็จ",
          text: data.dataResult.message || "ไม่สามารถลบรายการได้",
          confirmButtonText: "ปิด",
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          text: "รายการอะไหล่ถูกลบเรียบร้อยแล้ว",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      console.log("Delete Already : ", data);
    } catch (err) {
      console.error("Error deleting item:", err);

      Swal.close();

      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถลบรายการได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const setScannedCode = (code: String) => {
    console.log(`Scanned Code is working the code is ${code}`);
  };

  const setUploadImage = async (file: File[]) => {
    console.log(`Capture image is working the file is ${file}`);
    try {
      if (!work?.orderid) return;

      if (!file || file.length === 0) {
        console.warn("Don't have file");
        return;
      }

      const formData = new FormData();

      formData.append("file", file[0]);
      formData.append("order_id", work.orderid);

      const res = await callApi.post("upload", formData, {
        headers: { "Content-Type": "application/json" },
      });
      const data = res.data;
      console.log("upload image already : ", data);

      alert("upload image successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const submitWork = () => {
    console.log("submit Work is working");
    try {
      console.log("in try catch");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <WorkContext.Provider
      value={{
        work,
        setWork,
        startWork,
        pauseWork,
        finishWork,
        checkListWork,
        completed,
        returnWork,
        addPart,
        deletePart,
        setScannedCode,
        setUploadImage,
        submitWork,
        item_component,
        setItem_Component,
        hasStarted,
        setHasStarted,
        sparePart,
        setSparePart,
        cartItem,
        setCartItem,
        checkOutCloseType,
        setCheckOutCloseType,
        checkList,
        setCheckList,
      }}
    >
      {children}
    </WorkContext.Provider>
  );
};

export const useWork = () => {
  const ctx = useContext(WorkContext);
  if (!ctx) {
    throw new Error("useWork must be used within WorkProvider");
  }
  return ctx;
};
function setHasStarted(arg0: boolean) {
  throw new Error("Function not implemented.");
}
