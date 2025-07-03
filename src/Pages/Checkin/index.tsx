import React, { useState } from "react";
import CheckInHistoryCompoment from "./CheckInHistoryCompoment";
import MapComponent from "../../Component/MapComponent";
import { CheckInProvider } from "../../Context/CheckInContext";
import CheckINForm from "./checkInForm";

export default function CheckIn() {
    // const [open, setOpen] = useState<boolean>(true);

    return <div>
        <CheckInProvider>
            <MapComponent />
            <CheckINForm />
            <CheckInHistoryCompoment />
        </CheckInProvider>
    </div>
}