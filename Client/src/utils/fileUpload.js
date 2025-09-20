import { chunkUpload,completeUpload } from '/src/api/file';
import {generateThumbnail} from './generateThumbnail';
import {UploadController} from './uploader';

export const fileUpload = async (file, setUploadFile, setUploading, setProgress, setFiles) => {
    const fileName = file.name;
    const savedState = JSON.parse(localStorage.getItem(fileName)) || {};
    const chunkSize = savedState.chunkSize || calculateChunkSize(file.size);
    const tempFile = {
        name: fileName,
        type: file.type,
        typeUrl: await generateThumbnail(file),
        totalSize: file.size,
        chunkSize
    };
    const chunks = [];
    let start = 0;
    const chunkCount = Math.ceil(file.size / chunkSize);

    for(let i = 0; i < chunkCount; i++){
        const end = Math.min(chunkSize, file.size)
        const chunk = file.slice(start, end);
        chunks.push(chunk);
        chunks.push({
            index: i,
            blob: chunk,
            size: chunk.size,
            start,
            end,
            name: fileName,
            total: chunkCount
        });
        
        start = end;
    }

    setUploadFile({...tempFile});
    setUploading(true);
    setProgress(0);

    const controller = new UploadController(4,3,setProgress);
    const uploadedIndexes = savedState.uploadedIndexes || [];
    const chunksToUpload = chunks.filter(chunk => {
        !uploadedIndexes.includes(chunk.index);
    })

    chunksToUpload.forEach(chunk => controller.enqueue(chunk));

    try { 
        controller.processQueue(async(chunk)=>{
            const formData = new FormData();
            formData.append("chunk", chunk.blob);
            formData.append("name", chunk.name);
            formData.append("index", chunk.index);
            formData.append("total", chunk.total);

            await chunkUpload(formData);

            const newUploadedIndexes = [...uploadedIndexes, chunk.index];
            localStorage.set(fileName, JSON.stringify({
                ...savedState,
                uploadedIndexes: newUploadedIndexes,
                chunkSize
            }));
        });

            await completeUpload(fileName);

            setFiles((prevFiles) => {
                if(prevFiles.some(file=>file.name===tempFile.name)) return prevFiles;
                else return [...prevFiles, { ...tempFile }]
            });
            setUploading(false);
            setUploadFile(null);
            setProgress(null);
            localStorage.removeItem(fileName); 
        } catch (error) {
            console.error("文件上传失败:", error);
            setUploading(false);
        }
};

const evaluateNetwork = () => {
  return navigator.connection
    ? navigator.connection.downlink * 1024 
    : 500; 
}

const calculateChunkSize = (totalSize)=> {
  const NETWORK_TIERS = [
    { threshold: 500,  chunkSize: 1 * 1024 * 1024 },   // <500KB/s: 1MB
    { threshold: 2000, chunkSize: 5 * 1024 * 1024 },   // <2MB/s: 5MB
    { threshold: 5000, chunkSize: 10 * 1024 * 1024 },  // <5MB/s: 10MB
    { threshold: Infinity, chunkSize: 20 * 1024 * 1024 } // 20MB
  ];

  const speed = evaluateNetwork();
  const { chunkSize } = NETWORK_TIERS.find(tier => speed < tier.threshold);
  
  const MAX_CHUNKS = 500;
  const minChunkSize = Math.ceil(totalSize / MAX_CHUNKS);
  
  return Math.max(chunkSize, minChunkSize);
}