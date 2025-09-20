import React,{useState} from "react";
import {Avatar} from "antd";
import {EditOutlined,DeleteOutlined,FileAddOutlined} from "@ant-design/icons"

import References from '/src/components/references';
import "./index.css"

const Task = ({handleFileUpload, id,name,details,user,provided,handleUpdate,handleRemove}) => {
    const [showReferences, setShowReferences] = useState(false);

    return (
        <>
            <div
                className="task"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
            >
                <h2 className="task-name over-hide" title={name}>{name}</h2>
                <p className="task-details">{details}</p>
                <div className="bottom" >
                    <div>
                        <EditOutlined onClick={()=>handleUpdate(id)}/>
                    </div>
                    <div className="file">
                        <FileAddOutlined onClick={() => setShowReferences(pre => !pre)} />
                    </div>
                    <div className="remove-bar">
                        <DeleteOutlined onClick={(e)=>{handleRemove(id,e)}}/>
                    </div>
                </div>
                <div className="avatar" title={user.userName}>
                    <Avatar src={user.avatar} size="middle" />
                </div>
                {showReferences && <References handleFileUpload={handleFileUpload} />}
            </div>
        </>
    )
}

export default React.memo(Task);