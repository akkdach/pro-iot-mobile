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
    imageKey?: string;
}

export default async function callUploadImage(params: UploadImageParams) {
    if (!params.orderId) throw new Error("orderId is required");
    if (!params.image) throw new Error("image is required");

    // 1) ดึงข้อมูลจาก .NET (เหมือนเดิม)
    const res = await callApi.get(`/WorkOrderList/Img/${params.orderId}`);
    const data = res.data?.dataResult;

    const res2 = await callApi.get(`/Mobile/GetMasterWorkorderImage?order_id=${params.orderId}`);
    const data2 = res2.data?.dataResult; // List of image metadata objects

    // Fetch current image values to preserve them
    const res3 = await callApi.get(`/WorkOrderList/ImgBox/${params.orderId}`);
    const currentImages = res3.data?.dataResult?.[0] || {};

    // console.log("data2", data2);

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

        console.log("Upload Success response:", response.data);

        // 4) Update database with new URL
        if (Array.isArray(data2) && params.imageKey) {
            // Construct payload from existing data2 AND currentImages
            const payload: any = {
                orderId: params.orderId,
                ordeR_TYPE: params.orderType ?? data[0]?.ordeR_TYPE ?? "01",
                isConnect: true,
                tradename: params.tradCode ?? "refurbish",
            };

            // Map existing URLs from currentImages based on keys in data2
            data2.forEach((item: any) => {
                if (item.key) {
                    // Use current value from DB if available, otherwise empty
                    // IMPORTANT: Use the raw value from DB, do NOT replace/fix base URL here as we are saving back to DB
                    payload[item.key] = currentImages[item.key] || "";
                }
            });

            // Override with new URL
            // payload[params.imageKey] = typeof response.data === 'string' ? response.data : response.data?.url ?? response.data;
            payload[params.imageKey] = response.data?.path || response.data;

            console.log("Updating Image Payload:", payload);

            await callApi.put("/Mobile/update_workorderImage", payload);
        }


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
