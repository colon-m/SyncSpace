import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import {v4 as uuidv4} from "uuid"

import {fileUpload} from '/src/utils/fileUpload';
import { useUser } from "/src/hooks/useUser";
import Task from "./task"
import AddRowButton from "./addButton";
import "./index.css";

const Column = ({socket, tag,setEvents,currentEvent}) =>{
    const {user} = useUser();
    const handleAddRow = () =>{
        const name = prompt('请输入子任务');
        const details = prompt('请输入详细描述');
        if(!(name && details)){
            alert("任务名或详细不为空！");
            return;
        };
        setEvents((prev) => {
            const arrCopy = [...prev];
            const index = prev.findIndex(
                (event) => event.title === currentEvent.title
            );
            const eventCopy = arrCopy[index];
            // Remove old and add the latest data
            arrCopy.splice(index, 1, {
                ...eventCopy,
                [tag]: [
                ...eventCopy[tag],
                { name: name, id: uuidv4(), details: details, owner: {userName:user.userName,avatar:user.avatar} },
                ],
            });
            socket.emit("updateEvent", { room: currentEvent.title, event: arrCopy[index] });
            return arrCopy;
        });
    };
    const handleUpdate = (id) => {
        const name = prompt('请输入更新后的任务名称');
        const details = prompt('请输入描述');
        if(!(name && details)) return;
        setEvents(prev => prev.map(event => {
            if(event.title === currentEvent.title) {
                const event = {
                ...event,
                [tag]: event[tag].map(task => 
                    task.id === id 
                    ? {...task, name, details}
                    : task)
                }
                socket.emit("updateEvent", { room: currentEvent.title, event });
                return event;
            } else{
                return event
            }
        }));
    }
    const handleRemove = (id,e) => {
        e.stopPropagation();
        setEvents(prev => prev.map(event => {
            if(event.title === currentEvent.title) {
                const event = {
                    ...event,
                    [tag]: event[tag].filter(task => task.id !== id)
                }
                socket.emit("updateEvent", { room: currentEvent.title, event });
                return event;
            } else{
                return event
            }
        }));
    }
    const handleFileUpload = async (e,setUploadFile,setUploading,setProgress,setFiles) => {
        const file = e.target.files[0];
        if (!file || file.length === 0) return;
        await fileUpload(file, setUploadFile, setUploading, setProgress, setFiles);
    }
    return(
        <div className="column">
            <div className="title">
                <span>{tag}</span>
            </div>
            <AddRowButton handleAddRow={handleAddRow}/>
            <Droppable droppableId={tag}>
                {(provided) => {
                    return (
                        <div
                            className="tasks-container"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {currentEvent && currentEvent[tag]?.map((item,index)=>{
                                return(<Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={index}
                                >
                                    {(provided)=>{
                                        return <Task
                                                key={item.id}
                                                handleFileUpload={handleFileUpload}
                                                id={item.id}
                                                name={item.name}
                                                user={item.owner}
                                                details={item.details}
                                                provided={provided}
                                                handleUpdate={handleUpdate}
                                                handleRemove={handleRemove}
                                            />
                                            
                                    }}
                                </Draggable>)
                            })}
                            {provided.placeholder}
                        </div>
                    )
                }}
            </Droppable>
        </div>
    )
}

export default Column;