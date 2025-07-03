import { Checklist, ErrorOutline, Login, Logout } from "@mui/icons-material";
import { Chip } from "@mui/material";


export default function CheckInStatusComponent({ status }: any) {


    const statusMap: any = {
        in: {
            label: 'เข้างาน',
            color: 'success',
            icon: <Login />,
        },
        out: {
            label: 'ออกงาน',
            color: 'error',
            icon: <Logout />,
        },
    };

    const current = statusMap[status] || {
        label: 'ไม่ทราบสถานะ',
        color: 'default',
        icon: <ErrorOutline />,
    };

    return (
        <Chip
            label={current.label}
            color={current.color}
            icon={current.icon}
            variant="outlined"
            sx={{ fontWeight: 500 }}
        />
    );

}