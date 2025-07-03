import { CameraAltSharp, Login, Logout, UploadFile, WorkHistory, WorkOff } from "@mui/icons-material";
import { Box, Button, Input, Paper, styled, Typography } from "@mui/material";
import Swal from "sweetalert2";
import CameraComponent from "../../Component/CameraComponent";
import CameraCapture from "../../Component/CameraCapture";
import CameraModal from "../../Component/CameraModal";
import { useEffect, useState } from "react";
import LocationPermission from "../../Utility/LocationPermission";
import callApi from "../../Services/callApi";
import { useUser } from "../../Context/userContext";
import { useCheckIn } from "../../Context/CheckInContext";
import CheckInStatusComponent from "./CheckInStatusComponent ";
import LazyImageCard from "./LazyImageCard";



const FlashList = ({ items }: any) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item: any) => (
                <Paper key={item.id} sx={{ padding: 2, borderRadius: '16px', backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center' }}>
                    {/* <img src={'./image.png'} alt={item.id} style={{ width: '50px', height: '50px', marginRight: '16px', borderRadius: '8px' }} /> */}
                    <LazyImageCard item={item} />
                    <Box sx={{textAlign:'left',color:'gray'}}>
                        <CheckInStatusComponent status={item.status} />
                        <Typography variant="body2" sx={{mt:1}}>วันเวลา: {item.created_at}</Typography>
                        <Typography variant="body2"><b>ตำแหน่งที่บันทึก :</b> <a href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`} target="_blank" rel="noopener noreferrer" >คลิกเพื่อดูแผนที่</a></Typography>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

export default function CheckInHistoryCompoment({ setOpen }: any) {
  const {checkInList} = useCheckIn();

 
  // const RenderCheckInList = () => {
    
  //   // const content = checkInList.map((item:any)=><FlashList items={item} />)
  //   // const content = checkInList.map((item: any, index) => <div key={'checkincard' + index} className="card">
  //   //   <div className='card-body'>
  //   //     <b className=''>ประเภทการบันทึกเวลา : {item.status}</b>
  //   //     <br></br><b className=''>เวลาที่บันทึก : {item.created_at}</b>
  //   //     <br></br><b className=''>ตำแหน่งที่บันทึก :</b> <a href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`} target="_blank" rel="noopener noreferrer">คลิกเพื่อดูแผนที่</a>
  //   //   </div>
  //   // </div>
  //   // )
  //   return (<>{content}</>)
  // }

  return <>

    <div style={{ marginTop: 20, maxHeight: 500, overflowY: 'scroll', overflowX: 'hidden', margin: 15 }}>
      <FlashList items={checkInList} />
      <div style={{ margin: 100 }}></div>
    </div>
  </>
}