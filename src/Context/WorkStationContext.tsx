import axios from "axios";
import React, { createContext, useContext, useState } from "react";
import callApi from "../Services/callApi";
import Header from "../Layout/Header";
import Swal from "sweetalert2";
import { steps } from "../Pages/workStation/SetupAndRefurbish";

interface Work {
  // id?: number;

  orderid?: string;
  ordeR_TYPE?: string;
  shorT_TEXT?: string;
  equipment?: string;
  weB_STATUS?: string;
  // current_operation?: string;
  state?: string;

  slA_FINISH_TIME?: String;
  actuaL_START_DATE?: Date;
  actuaL_FINISH_DATE?: Date;
  servicE_TIME?: String;
  actuaL_START_TIME?: String;
  actuaL_FINISH_TIME?: String;

  current_operation?: String;
}

interface Item_Component {
  worK_ORDER_COMPONENT_ID?: Number;
  orderid?: string;
  reS_ITEM?: string;
  reserV_NO?: string;
  matL_DESC?: string;
  actuaL_QUANTITY?: Number;
  actuaL_QUANTITY_UNIT?: string;
}

interface WorkContextType {
  work: Work | null;
  setWork: React.Dispatch<React.SetStateAction<Work | null>>;

  item_component: Item_Component[] | null;
  setItem_Component: React.Dispatch<
    React.SetStateAction<Item_Component[] | null>
  >;

  startWork: () => void;
  pauseWork: () => void;
  finishWork: () => void;
  checkListWork: () => void;
  completed: () => void;
  returnWork: () => void;

  addPart: (name: String, qty: number) => void;
  deletePart: (name: String, qty: number, id: number) => void;
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

  const startWork = async () => {
    console.log("Work is start");
    try {
      if (!work?.orderid) return;

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

      const res = await callApi.post(
        "/WorkOrderList/Start",
        { ORDERID: work?.orderid, current_operation: work?.current_operation },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      console.log("Start Work : ", data);

      if (!data.isSuccess) {
        await Swal.fire({
          title: "Failed",
          text: data.Message ?? "Cannot start this work order",
          icon: "error",
        });
        return;
      }

      setWork((prev) => ({
        ...prev!,
        orderid: data.dataResult?.ORDERID,
        actuaL_START_DATE: data.dataResult?.actuaL_START_DATE,
        actuaL_START_TIME: data.dataResult?.ACTUAL_START_TIME,
        weB_STATUS: data.dataResult?.WEB_STATUS,
        current_operation: data.dataResult?.current_operation,
      }));

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

  const finishWork = async () => {
    console.log("work is finish");
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
        { ORDERID: work?.orderid, current_operation: work?.current_operation },
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
        orderid: data.dataResult?.ORDERID,
        actuaL_FINISH_DATE: data.dataResult?.ACTUAL_FINISH_DATE,
        actuaL_FINISH_TIME: data.dataResult?.ACTUAL_FINISH_TIME,
        weB_STATUS: data.dataResult?.WEB_STATUS,
        current_operation: data.dataResult?.current_operation,
      }));

      await Swal.fire({
        title: "Finished!",
        text: "Work order has been finished successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      alert(data.message);
    } catch (err: any) {
      console.error("FinishWork Error:", err);
      await Swal.fire({
        title: "Error",
        text: err.response?.data?.Message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  const checkListWork = () => {
    console.log("work is check list");
  };

  const completed = async () => {
    console.log("work is completed");
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
    console.log("work is return");
    try {
      if (!work?.orderid) return;

      const getReturnableStations = (currentStation?: string | String) => {
        if (!currentStation) return {};

        const stationCode = currentStation.toString().padStart(4, "0");
        console.log(
          "currentStation raw >>>",
          currentStation,
          "normalized >>>",
          stationCode
        );

        const stationSteps = steps.filter((s) => s.station);

        const currentIndex = stationSteps.findIndex(
          (s) => s.station === stationCode
        );

        console.log("currentIndex >>>", currentIndex);

        if (currentIndex <= 0) return {};

        const available: Record<string, string> = {};

        for (let i = 0; i < currentIndex; i++) {
          const item = stationSteps[i];
          if (item.station) {
            available[item.station] = item.title;
          }
        }

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

      const res = await callApi.post(
        "/WorkOrderList/Return",
        {
          ORDERID: work?.orderid,
          current_station: work?.current_operation,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      console.log("Return Work : ", data);

      if (!data.isSuccess) {
        await Swal.fire({
          title: "Failed",
          text: data.Message ?? data.message ?? "Cannot return this work order",
          icon: "error",
        });
        return;
      }

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

  const deletePart = async (name: String, qty: number, id: number) => {
    console.log(`delete part is working delete`);
    try {
      if (!work?.orderid) return;

      const res = await callApi.delete(`/WorkOrderList/SparePart/${id}`);

      const data = res.data;
      console.log("Delete spare part : ", data);

      if (!data.IsSuccess) {
        alert("Delete spare part fail : ");
        return;
      }

      setItem_Component((prev) =>
        (prev ?? []).filter((item) => item.worK_ORDER_COMPONENT_ID !== id)
      );

      alert("Delete spare part already");
    } catch (err) {
      console.log(err);
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
