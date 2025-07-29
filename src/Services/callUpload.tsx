// uploadFile.js
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Uploads a file to the specified API endpoint.
 * @param {string} filePath - Path to the file to upload.
 * @param {string} url - API endpoint to upload the file to.
 * @param {string} fieldName - Name of the form field (e.g., 'contents').
 * @returns {Promise<any>} - Response from the server.
 */
export async function uploadFile(file:File[], url:string, fieldName = 'contents') {
  var baseURL= `https://service.bevproasia.com/api/${url}`
  try {
    const form = new FormData();
    file.forEach((file,i) => {
      form.append(`files${i}`, file);
  });

    // form.append(fieldName, fs.createReadStream(filePath));

    const response = await axios.post(baseURL, form, {
      headers: {
        // ...form.getHeaders(),
        'accept': '*/*'
      }
    });

    return response.data;
  } catch (error:any) {
    console.error('Upload failed:', error.message);
    throw error;
  }
}
