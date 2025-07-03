import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import callApi from '../Services/callApi';
import { useUser } from './userContext';

interface ICheckIn {
    status: string;
    latitude: string;
    longitude: string;
    last_login: string; // หรือใช้ Date ถ้า API ส่งมาเป็น timestamp
    image: string;
}
interface ICheckInList {
    check_in: string
    check_out: string
    created_at: string
    date: string
    employee_id: string
    id: number
    latitude: string;
    longitude: string;
    status: string
}
interface ILocation {
    latitude: number
    longitude: number
}
interface CheckInContextType {
    checkIn: ICheckIn | null;
    checkInList: ICheckInList[];
    setCheckInList: (data: ICheckInList[]) => void;
    setCheckIn: (data: ICheckIn) => void;
    image: string;
    setImage: (data: string) => void;
    onLoadCheckInList:(data:any)=>void;
}

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

export const CheckInProvider = ({ children }: { children: ReactNode }) => {
    const [checkIn, setCheckIn] = useState<ICheckIn | null>(null);
    const [checkInList, setCheckInList] = useState<ICheckInList[]>([]);
    const [image, setImage] = useState<string>("");
    const {location} = useUser();
    useEffect(() => {
        onLoadCheckInList()
    }, [])
    const onLoadCheckInList = async () => {
        const res = await callApi('attendance?type=list')
        if (res.data?.data) {
            setCheckInList(res.data?.data);
        }
    }
    useEffect(() => {
        if (location) {
            setCheckIn({...location,latitude:location.latitude,longitude:location.longitude});
        } else {
        }
    }, [location])
    return (
        <CheckInContext.Provider value={{ checkIn, setCheckIn, image, setImage, checkInList, setCheckInList, onLoadCheckInList }}>
            {children}
        </CheckInContext.Provider>
    );
};

export const useCheckIn = (): CheckInContextType => {
    const context = useContext(CheckInContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
