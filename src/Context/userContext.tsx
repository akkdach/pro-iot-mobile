import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: number;
  employee_id: string;
  username: string;
  last_login: string; // หรือใช้ Date ถ้า API ส่งมาเป็น timestamp
  fullname:string;
  department:string;
  position:string;
  wk_ctr:string
}
interface ILocation {
  latitude:number
  longitude:number
}
interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  location:any;
  setLocation:(location:ILocation)=>void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [location,setLocation] = useState<ILocation>();
  useEffect(()=>{
    const profile = localStorage.getItem('profile');
    console.log(profile);
    if(profile){
        setUser(JSON.parse(profile));
    }else{
    }
  },[])
  return (
    <UserContext.Provider value={{ user, setUser,location,setLocation }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
