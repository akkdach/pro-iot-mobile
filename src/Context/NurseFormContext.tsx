import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface INurseForm {
  no?: number;
  employee_id: string;
  fullname: string;
  position: string;
  department: string;
  significant_characteristic: string;
}

export interface IDisease {
  disease_group: string;
  disease_group_name: string;
}

export interface IMedicine {
  medicine: string;
  quantity: number;
  unit: string;
  id?: number;
  price: number;
  total: number;
  disease_group: string;
  disease_group_name: string;
}

interface INurseFormContext {
  nurseForm?: INurseForm | null;
  setNurseForm: (nurseForm: INurseForm) => void;
  diseaseList: IDisease[];
  setDiseaseList: (diseaseList: IDisease[]) => void;
  medicine: IMedicine[];
  setMedicine: (medicine: IMedicine[]) => void;
}

const NurseFormContext = createContext<INurseFormContext | undefined>(undefined);

export const NurseFormProvider = ({ children }: { children: ReactNode }) => {
  const [nurseForm, setNurseForm] = useState<INurseForm | null>(null);
  const [diseaseList, setDiseaseList] = useState<IDisease[]>([]);
  const [medicine, setMedicine] = useState<IMedicine[]>([]);

  useEffect(() => {
    console.log(diseaseList);
  }, [diseaseList]);

  return (
    <NurseFormContext.Provider value={{ nurseForm, setNurseForm, diseaseList, setDiseaseList, medicine, setMedicine }}>
      {children}
    </NurseFormContext.Provider>
  );
};

export const useNurseForm = (): INurseFormContext => {
  const context = useContext(NurseFormContext);
  if (!context) {
    throw new Error('useNurseForm must be used within a NurseFormProvider');
  }
  return context;
};
