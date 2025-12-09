import axios from "axios";
import React, { createContext, useContext, useState } from "react";
import callApi from "../Services/callApi";
import Header from "../Layout/Header";

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

  currenT_STATION?: String;
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

      const res = await callApi.post(
        "/WorkOrderList/Start",
        { ORDERID: work?.orderid },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      console.log("Start Work : ", data);

      setWork((prev) => ({
        ...prev!,
        orderid: data.DataResult?.ORDERID,
        actuaL_START_DATE: data.DataResult?.ACTUAL_START_DATE,
        actuaL_START_TIME: data.DataResult?.ACTUAL_START_TIME,
        weB_STATUS: data.DataResult?.WEB_STATUS,
      }));
      alert(data.message);
    } catch (err) {
      console.log(err);
    }
  };

  const pauseWork = () => {
    console.log("work is pause");
  };

  const finishWork = async () => {
    console.log("work is finish");
    try {
      if (!work?.orderid) return;

      const res = await callApi.post(
        "/WorkOrderList/Finish",
        { ORDERID: work?.orderid },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      console.log("Finish Work : ", data);

      setWork((prev) => ({
        ...prev!,
        orderid: data.DataResult?.ORDERID,
        actuaL_FINISH_DATE: data.DataResult?.ACTUAL_FINISH_DATE,
        actuaL_FINISH_TIME: data.DataResult?.ACTUAL_FINISH_TIME,
        weB_STATUS: data.DataResult?.WEB_STATUS,
      }));
      alert(data.message);
    } catch (err) {
      console.log(err);
    }
  };

  const checkListWork = () => {
    console.log("work is check list");
  };

  const completed = async () => {
    console.log("work is completed");
    try {
      if (!work?.orderid) return;

      const res = await callApi.post(
        "/WorkOrderList/Completed",
        { ORDERID: work?.orderid },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data;
      console.log("Completed Work : ", data);

      setWork((prev) => ({
        ...prev!,
        orderid: data.DataResult?.ORDERID,
        weB_STATUS: data.DataResult?.WEB_STATUS,
      }));

      alert(data.message);
    } catch (err) {
      console.log(err);
    }
  };

  const returnWork = async () => {
    console.log("work is return");
    try {
      if (!work?.orderid) return;

      const res = await callApi.post(
        "/WorkOrderList/Return",
        {
          ORDERID: work?.orderid,
          current_station: work?.currenT_STATION,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      console.log("Return Work : ", data);
    } catch (err) {
      console.log(err);
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
    try{
      console.log("in try catch");
    }catch(err){
      console.log(err)
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
