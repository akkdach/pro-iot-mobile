import { splitDate } from '../Utility/DatetimeService';
import callApi from './callApi';

interface UploadImageParams {
    orderId: string;
    tradCode?: string;
    orderType?: string;
    year?: string;
    month?: string;
    image: File;
}

export default async function callUploadImage(params: UploadImageParams) {

    const res = await callApi.get(`/WorkOrderList/Img/${params.orderId}`);
    const data = res.data.dataResult;
    console.log("data Result Img info : ", data);

    const { year, month } = splitDate(new Date(data.productioN_START_DATE));

    const now = new Date();

    const form = new FormData();
    form.append("OrderId", params.orderId);
    form.append("TradCode", "refurbish");
    form.append("OrderType", data.ordeR_TYPE || "01");
    form.append("Year", year || now.getFullYear().toString());
    form.append("Month", month || (now.getMonth() + 1).toString().padStart(2, '0'));
    form.append("Image", params.image);

    try {
        const response = await callApi.post("/WorkOrderList/UploadImage", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error: any) {
        console.error('Upload failed:', error.message);
        throw error;
    }
}