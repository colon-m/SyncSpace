import React from "react";

import AddButton from "./addButton";
import './index.css';

const TodoBar = ({ socket,events, setEvents, currentEvent, setCurrentEvent }) => {
  const handleAddEvent = () => {
    const newEventTitle = prompt("请输入新看板的标题:");
    const details = prompt("请输入新看板的描述:");
    if(!(newEventTitle && details)){
      alert("标题和描述不能为空！");
      return;
    }
    if (events.some(event => event.title === newEventTitle)) {
      alert("看板标题已存在，请选择其他标题。");
      return;
    }
    const newEvent = {
      title: newEventTitle,
      details: details,
      ['To Do']: [],
      ['In Progress']: [],
      ['Completed']: []
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    setCurrentEvent(newEvent);
    socket.emit('joinRoom', newEventTitle);
  }
  const handleClickEvent = (event) => {
    setCurrentEvent(event);
    socket.emit('joinRoom', event.title,(err, response) => {
    if (err) {
      throw err;
    } else {
      if (!response || !response.data) {
        return;
      }
      setEvents(prevEvents => {
        const index = prevEvents.findIndex(ev => ev.title === event.title);
        if (index !== -1) {
          const updatedEvents = [...prevEvents];
          updatedEvents[index] = { ...updatedEvents[index], ...response.data };
          return updatedEvents;
        }
        return prevEvents;
      });
    }
  });
  }
  return (
    <div className="event-bar">
        <div className="event-bar-content">
          {events.map((event, index) => (
            <div
              key={index}
              className={`event-item over-hide ${currentEvent?.title === event?.title ? "active" : ""}`}
              onClick={() => handleClickEvent(event)}
            >
              {event.title}
            </div>
          ))}
        </div>
        <AddButton
          handleAddEvent={handleAddEvent}
          className="add-button"
        />
    </div>
  );
};

export default TodoBar;
