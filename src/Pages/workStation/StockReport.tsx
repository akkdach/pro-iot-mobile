import { use } from "react";
import AppHearder from "../../Component/AppHeader"
import InventoryIcon from '@mui/icons-material/Inventory';
import { useEffect } from "react";
import callApi from "../../Services/callApi";

const StockReport = () => {

    useEffect(() => {
        onLoad();
    }, [])

    const onLoad = async () => {
        const res = await callApi.get("/WorkOrderList/stockReport");
        const data = res.data;

        console.log("Stock Report : ", data);
    }

  return (

    <div>
        <AppHearder title="Stock Report" icon={<InventoryIcon />} />
        <h1>Stock Report Page</h1>
    </div>
  )
}
export default StockReport