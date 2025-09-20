import React,{useState,useEffect, useRef} from "react";

import { Empty, Progress } from "antd";
import {PaperClipOutlined, CloseOutlined} from "@ant-design/icons"

import "./index.css"

const References = ({handleFileUpload}) => {
    const [files, setFiles] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(null);
    const fileInputRef = useRef(null);

    const handleDeleteFile = (name) => {
        setFiles(pre=>pre.filter(file=>file.name!==name))
    }

    useEffect(() => {
        const fileInputDom = fileInputRef.current; 
        fileInputDom.addEventListener("change", (e) => handleFileUpload(e,setUploadFile,setUploading,setProgress,setFiles));
        return () => {
            if(fileInputDom){
                fileInputDom.removeEventListener("change", (e) => handleFileUpload(e,setUploadFile,setUploading,setProgress,setFiles));
            }
        }
    },[])
    return (
        <div className="references">
            <div className="ref-header">
                <PaperClipOutlined />
                <span className="ref-title">附件</span>
                <div className="upload-area">
                    <div className="upload-btn">
                        <span className="upload-icon">+</span>
                        <input 
                            ref={fileInputRef}
                            className="file-input"
                            type="file"
                            title="上传文件"
                        />
                    </div>
                </div>
            </div>
            <div className="ref-body">
                {files.length > 0 || uploadFile
                ? 
                <div>
                    <div className="files-upload" >
                    {files.length > 0 && files.map((file, index) => (
                        <div className="item-upload">
                            <img src={file.typeUrl} title={file.name} alt={file.name} className="file-icon" key={index} />
                            <CloseOutlined className="file-close" onClick={()=>handleDeleteFile(file.name)}/>
                        </div>
                    ))}
                    </div>
                    {uploadFile &&
                    <div className="file-item uploading">
                        <div>
                            <img src={uploadFile.typeUrl} title={uploadFile.name} alt={uploadFile.name} className="file-icon" />
                            <span className="file-name">{uploadFile.name}</span>
                        </div>
                        {uploading && <div className="progress-bar">
                            <Progress percent={progress} />
                        </div>}
                    </div>}
                </div>
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无附件" />}
            </div>
        </div>
    )
}

export default References;