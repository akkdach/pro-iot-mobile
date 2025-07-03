import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const BookingCard = ({ booking }: any) => {
    return (
        <Card sx={{width:'100%', maxWidth: 400, borderRadius: 3, boxShadow: 5, padding: 0, margin: 2 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, margin: 'auto' }}>
                <div style={{display:'flex'}}>
                    <Typography variant="h5" color="primary" style={{ alignContent: 'flex-start' }}>
                        🚗 {booking?.licensePlate}
                    </Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "2px", alignContent: 'flex-start' }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        📍 ต้นทาง: {booking?.startLocation}
                    </Typography>
                    <Typography variant="body2">
                        , ⏳ : {booking?.startDateTime}
                    </Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "2px", alignContent: 'flex-start' }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        📍 ปลายทาง: {booking?.endLocation}
                    </Typography>
                    <Typography variant="body2">
                        , ⏳ : {booking?.endDateTime}
                    </Typography>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "2px", alignContent: 'flex-start' }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        ไมล์เริ่มต้น :
                    </Typography>
                    <Typography variant="body2">
                        , ไมล์สิ้นสุด :
                    </Typography>
                    <Typography variant="body2">
                        , ระยะทาง :
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
};

export default function BookingList() {
    return <div style={{display:'flex',flex:1,flexDirection:'row',justifyContent:'center'}}>
        <BookingCard props={{}} />
    </div>
};
