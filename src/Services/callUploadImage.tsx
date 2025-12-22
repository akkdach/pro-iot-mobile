import axios from 'axios';

export default async function callUploadImage(file: File[], url: string, fieldName = 'contents') {
    var baseURL = `https://service.bevproasia.com/api/v1/${url}`
    try {
        const form = new FormData();
        file.forEach((file, i) => {
            form.append(`file`, file);
        });

        const response = await axios.post(baseURL, form, {
            headers: {
                'accept': '*/*'
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('Upload failed:', error.message);
        throw error;
    }
}