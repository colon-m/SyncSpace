import React,{useCallback} from "react";
import {DragDropContext} from "@hello-pangea/dnd";

import Column from "./column";
import "./index.css";

const TaskBox = ({socket,events,setEvents,currentEvent}) => {
    const handleDragEnd = useCallback((result) => {

        const { destination, source } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        setEvents((pre) => {

            const copyEvents = pre.map(event => ({ ...event }));

            // 找到当前事件（避免未找到事件）
            const originEventIndex = copyEvents.findIndex(
                (event) => event.title === currentEvent.title
            );
            if (originEventIndex === -1) {
                console.error("未找到当前事件：", currentEvent.title);
                return pre; // 未找到，返回原状态
            }
            const currentEventCopy = { ...copyEvents[originEventIndex] }; // 深拷贝当前事件

            // 处理源区域（检查有效性）
            const sourceTaskArea = currentEventCopy[source.droppableId] || []; // 设为默认空数组
            if (!Array.isArray(sourceTaskArea)) {
                console.error("源区域无效（非数组）：", source.droppableId);
                return pre; // 源区域无效，返回原状态
            }
            if (source.index < 0 || source.index >= sourceTaskArea.length) {
                console.error("源索引越界：", source.index);
                return pre; // 索引越界，返回原状态
            }

            // 获取并检查`moveObj`（避免空对象）
            const moveObj = { ...sourceTaskArea[source.index] }; // 深拷贝要移动的任务
            if (!moveObj || Object.keys(moveObj).length === 0) {
                return pre; // 无效任务，返回原状态
            }

            // 从源区域移除任务（不可变性）
            const updatedSourceTaskArea = [...sourceTaskArea]; // 复制源区域数组
            updatedSourceTaskArea.splice(source.index, 1); // 移除当前任务
            currentEventCopy[source.droppableId] = updatedSourceTaskArea; // 更新源区域

            // 处理目标区域（保留原有内容，避免覆盖）
            const destinationTaskArea = currentEventCopy[destination.droppableId] || []; // 设为默认空数组
            if (!Array.isArray(destinationTaskArea)) {
                console.error("目标区域无效（非数组）：", destination.droppableId);
                return pre; // 目标区域无效，返回原状态
            }

            // 将`moveObj`插入目标区域指定位置（不可变性）
            const updatedDestinationTaskArea = [...destinationTaskArea]; // 复制目标区域数组
            updatedDestinationTaskArea.splice(destination.index, 0, moveObj); // 插入到指定位置
            currentEventCopy[destination.droppableId] = updatedDestinationTaskArea; // 更新目标区域

            copyEvents[originEventIndex] = currentEventCopy; 
            console.log("更新后的事件：", currentEventCopy);
            socket.emit("updateEvent", { room: currentEvent.title, event: currentEventCopy });
            return copyEvents; 
        });
    },[setEvents,currentEvent,socket]);
    return (
        <div className="task-box-contariner">
            <DragDropContext onDragEnd={(result) => handleDragEnd(result)}>
                <div className="column-box">
                    {['To Do', 'In Progress', 'Completed'].map((tag) =>{
                        return <Column
                            socket={socket}
                            tag={tag}
                            key={tag}
                            events={events}
                            setEvents={setEvents}
                            currentEvent={currentEvent}
                        />
                    })}
                </div>
            </DragDropContext>
        </div>
    )
}

export default TaskBox;