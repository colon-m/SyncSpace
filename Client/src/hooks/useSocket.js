import { useEffect,useState } from 'react';
import io from 'socket.io-client';

const useSocket = ({setEvents}) => {

    const [socket,setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000/kanban');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        // socket.on('addEvent', (data) => {
        //     setEvents((prevEvents) => [...prevEvents, data]);
        // });

        newSocket.on('deleteEvent', (title) => {
            setEvents((prevEvents) => prevEvents.filter(event => event.title !== title));
        });

        newSocket.on('updateEvent', (data) => {
            setEvents((prevEvents) => prevEvents.map(event => event.title === data.title ? data : event));
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);
    return socket;
}

export default useSocket;