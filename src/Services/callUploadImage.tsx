import axios from "axios";
import { splitDate } from "../Utility/DatetimeService";
import callApi from "./callApi";

interface UploadImageParams {
    orderId: string;
    image: File;
    tradCode?: string;
    orderType?: string;
    year?: string;
    month?: string;
}

export default async function callUploadImage(params: UploadImageParams) {
    if (!params.orderId) throw new Error("orderId is required");
    if (!params.image) throw new Error("image is required");

    // 1) ดึงข้อมูลจาก .NET (เหมือนเดิม)
    const res = await callApi.get(`/WorkOrderList/Img/${params.orderId}`);
    const data = res.data?.dataResult;

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No Img info found");
    }

    const startDate = data[0]?.productioN_START_DATE
        ? new Date(data[0].productioN_START_DATE)
        : new Date();

    const { year, month } = splitDate(startDate);

    // 2) build FormData
    const formData = new FormData();
    formData.append("tradCode", params.tradCode ?? "refurbish");
    formData.append("orderType", params.orderType ?? data[0]?.ordeR_TYPE ?? "01");
    formData.append("year", year);
    formData.append("month", month);
    formData.append("orderId", params.orderId);
    formData.append("image", params.image, params.image.name);

    // 3) ยิง axios ตรงไป external upload server
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
            "http://10.10.199.16:8080/upload",
            formData,
            {
                timeout: 5 * 60 * 1000,
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : undefined,
            },

        );

        return response.data;
    } catch (error: any) {
        // axios error handling
        if (axios.isAxiosError(error)) {
            console.error("Upload error:", {
                status: error.response?.status,
                data: error.response?.data,
            });
            throw new Error(
                `Upload failed (${error.response?.status}): ${error.response?.data ?? error.message
                }`
            );
        }

        throw error;
    }
}
