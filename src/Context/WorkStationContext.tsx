import React, { createContext, useContext, useState } from "react";

interface Work {
  id?: number;
  lastName?: string;
  firstName?: string;
  age?: number;

  item?: string;
  itemNo?: string;
  itemDes?: string;
  qtv?: string;
  qtvShip?: string;

  workOrder?: string;
  orderType?: string;
  description?: string;
  equipment?: string;
  status?: string;
  currentStation?: string;
  state?: string;

  slaTime?: String;
  startDate?: Date;
  finishDate?: Date;
  useTime?: String;
  startTime?: String;
  finishTime?: String;
}

interface WorkContextType {
  work: Work | null;
  setWork: React.Dispatch<React.SetStateAction<Work | null>>;

  startWork: () => void;
  pauseWork: () => void;
  finishWork: () => void;
  checkListWork: () => void;
  completed: () => void;
  returnWork: () => void;

  addPart: (name: String, qty: number) => void;
  deletePart: (name: String, qty: number) => void;
  setScannedCode: (code: String) => void;
  setCaptureImage: (file: File[]) => void;
  submitWork: () => void;
}

const WorkContext = createContext<WorkContextType | null>(null);

export const WorkProvider = ({ children }: { children: React.ReactNode }) => {
  const [work, setWork] = useState<Work | null>(null);

  const startWork = () => {
    console.log("Work is start");
  };

  const pauseWork = () => {
    console.log("work is pause");
  };

  const finishWork = () => {
    console.log("work is finish");
  };

  const checkListWork = () => {
    console.log("work is check list");
  };

  const completed = () => {
    console.log("work is completed");
  };

  const returnWork = () => {
    console.log("work is return");
  };

  const addPart = (name: String, qty: number) => {
    console.log(`add part is working add ${name} qty ${qty}`);
  };

  const deletePart = (name: String, qty: number) => {
    console.log(`delete part is working delete ${name} qty ${qty}`);
  };

  const setScannedCode = (code: String) => {
    console.log(`Scanned Code is working the code is ${code}`);
  };

  const setCaptureImage = (file: File[]) => {
    console.log(`Capture image is working the file is ${file}`);
  };

  const submitWork = () => {
    console.log("submit Work is working");
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
        setCaptureImage,
        submitWork,
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
