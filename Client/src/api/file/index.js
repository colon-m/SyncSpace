import axios from 'axios';

export const chunkUpload = async (formData) => {
    await axios.post("http://localhost:5000/api/file/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export const completeUpload = async (fileName) => {
    await axios.post("http://localhost:5000/api/file/upload", JSON.stringify({ name: fileName }), {
        headers: { 'Content-Type': 'application/json' }
    });
}