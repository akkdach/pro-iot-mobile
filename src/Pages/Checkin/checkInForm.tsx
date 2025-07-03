import { CameraAltSharp, Login, Logout, UploadFile } from "@mui/icons-material";
import { Button } from "@mui/material";
import CameraModal from "../../Component/CameraModal";
import { useState } from "react";
import Swal from "sweetalert2";
import callApi from "../../Services/callApi";
import VisuallyHiddenInput from "../../Component/CustomInput";
import { useCheckIn } from "../../Context/CheckInContext";
import { useUser } from "../../Context/userContext";


const date = new Date();
const formattedDate = date.toLocaleDateString('us-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});


export default function CheckINForm() {
    const { user } = useUser();
    const { checkIn, onLoadCheckInList } = useCheckIn();
    const [isOpenCamera, setIsOpenCamera] = useState<boolean>();
    const { setImage, image } = useCheckIn();

    const handleCheckIn = () => {
        if (!image) {
            Swal.fire('Warning', 'กรุณาถ่ายรูปก่อนเช็คอิน', 'warning')
            return;
        }
        Swal.fire({
            title: 'ยืนยัน?',
            text: 'ยืนยันการเช็คอิน!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ดำเนินการต่อ!',
            cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
            if (result.isConfirmed) {

                const res = await callApi.post('attendance?type=checkin', { ...checkIn, status: 'in', image: image })
                if (res.data?.status == 'success') {
                    Swal.fire('ดำเนินการสำเร็จ!', '', 'success');
                    onLoadCheckInList(null);
                    onLineNotiCheckIn(res.data?.data)
                }

            }
        });
    };

    const onLineNotiCheckIn = async (id: any) => {
        var json = {
            "type": "template",
            "altText": "Check In",
            "template": {
                "type": "carousel",
                "columns": [
                    {
                        "thumbnailImageUrl": "https://worklift.dnatechnology99.com/image/checkin_" + id + ".jpg",
                        "title": "'" + user?.fullname + "'",
                        "text": "Check In :" + formattedDate,
                        "actions": [
                            {
                                "type": "uri",
                                "label": "Location",
                                "uri": `https://www.google.com/maps?q=${checkIn?.latitude},${checkIn?.longitude}`
                            }
                        ]
                    }
                ]
            }
        };
        const res = await callApi.post('https://worklift.dnatechnology99.com/api/linebot.php?checkin_id=' + id, json);

    }

    const onLineNotiCheckOut = async (id: any) => {
        var json = {
            "type": "template",
            "altText": "Check Out",
            "template": {
                "type": "carousel",
                "columns": [
                    {
                        "thumbnailImageUrl": "https://worklift.dnatechnology99.com/image/checkin_" + id + ".jpg",
                        "title": "'" + user?.fullname + "'",
                        "text": "Check Out :" + formattedDate,
                        "actions": [
                            {
                                "type": "uri",
                                "label": "Location",
                                "uri": `https://www.google.com/maps?q=${checkIn?.latitude},${checkIn?.longitude}`
                            }
                        ]
                    }
                ]
            }
        };
        const res = await callApi.post('https://worklift.dnatechnology99.com/api/linebot.php?checkin_id=' + id, json);

    }

    const handleCheckOut = () => {
        if (!image) {
            Swal.fire('Warning', 'กรุณาถ่ายรูปก่อนเช็คเอาท์', 'warning')
            return;
        }
        Swal.fire({
            title: 'ยืนยัน?',
            text: 'ยืนยันการเช็คเอาท์!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ดำเนินการต่อ!',
            cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await callApi.post('attendance?type=checkout', { ...checkIn, status: 'out', image: image })
                if (res.data?.status == 'success') {
                    Swal.fire('ดำเนินการสำเร็จ!', '', 'success');
                    onLoadCheckInList({});
                    onLineNotiCheckOut(res.data?.data)
                }

                // ทำสิ่งที่ต้องการหลังจากยืนยัน
            }
        });
    };
    const onCapture = (e: any) => {
        setImage(e)
        setIsOpenCamera(false)
    }
    return (<>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 15, margin: 15 }}>
            {/* <Button
                fullWidth
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadFile />}
            >
                อัปโหลดไฟล์
                <VisuallyHiddenInput
                    type="file"
                    onChange={(event: any) => console.log(event.target.files)}
                    multiple={false}
                />
            </Button> */}
            <Button
                fullWidth
                onClick={() => setIsOpenCamera(true)}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CameraAltSharp />}
            >
                ถ่ายรูป
            </Button>
            <CameraModal isOpen={isOpenCamera} onClose={() => setIsOpenCamera(false)} onCapture={(e: any) => { onCapture(e); }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 15, margin: 15 }}>
            <Button
                fullWidth
                onClick={() => handleCheckIn()}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<Login />}
            >
                เช็คอิน
            </Button>
            <Button
                fullWidth
                onClick={() => handleCheckOut()}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<Logout />}
            >
                เช็คเอาท์
            </Button>
            {/* <button onClick={() => handleCheckIn()} style={{ display: 'flex', alignItems: 'center', flex: 2, justifyContent: 'center' }}
        className='btn btn-primary' title='เข้างาน'  ><WorkHistory></WorkHistory> เข้างาน</button>
      <button onClick={() => handleCheckOut()}
        style={{ display: 'flex', alignItems: 'center', flex: 2, justifyContent: 'center' }}
        className='btn btn-primary' title='ออกงาน'  ><WorkOff></WorkOff> ออกงาน</button> */}
        </div>
    </>)
}