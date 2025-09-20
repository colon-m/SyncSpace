import React,{ useLayoutEffect,useEffect,useState, useCallback } from 'react';

import useSocket from '/src/hooks/useSocket';
import {fetchProjectData} from "/src/api/project"
import EventBar from '/src/components/todoBar';
import TaskBox from '/src/components/todoTaskBox';
import { useTitle } from '/src/hooks/useTitle';
import {useUser} from '/src/hooks/useUser';
import './index.css';

const Todo = () => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const { setTitle } = useTitle();
  const { user } = useUser();
  const socket = useSocket({ setEvents });

  const updateCurrentEvent = useCallback(() =>{
    setCurrentEvent(preEvent=>{
      if(!preEvent) {
        if(events[0]) {
          socket.emit('joinRoom', events[0].title);
          return events[0];
        }else{
          return null;
        }
      }
      const temp = events.find(event=>event.title === preEvent.title);
      socket.emit('joinRoom', temp.title);
      return temp;
    })
  },[events,socket]);

  const updateEvents = useCallback(async ()=>{
    try {
      if(events.length !== 0){
        localStorage.setItem('events', JSON.stringify(events));
      }
    } catch (error) {
      console.error('Error updating events:', error);
    }
  },[events]);

  useEffect(() => {
    setTitle("看板");
    const fetchData = async () => {
      const result = await fetchProjectData();
      if (result) {
        console.log("result:",result)
        console.log("user:",user)
        const ownEvents = result.data.filter((eve)=>eve.members.includes(user.userName))
        console.log("ownEvents:",ownEvents);
        setEvents(ownEvents);
      } else {
        const localData = localStorage.getItem('events');
        if (localData) {
          setEvents(JSON.parse(localData));
        }
      }
    };
    fetchData();
  }, []);
  useLayoutEffect(() => {
    updateEvents();
    updateCurrentEvent();
  },[updateEvents,updateCurrentEvent]);

  return (
    <div className='container'>
      {events.length > 0 && (
        <EventBar
          socket={socket}
          events={events}
          setEvents={setEvents}
          currentEvent={currentEvent}
          setCurrentEvent={setCurrentEvent}
        />
      )}
      {events.length > 0 && (
        <TaskBox
          socket={socket}
          events={events}
          setEvents={setEvents}
          currentEvent={currentEvent}
          setCurrentEvent={setCurrentEvent}
        />
      )}
    </div>
  );
};

export default Todo;