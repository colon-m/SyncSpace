import React,{useEffect} from 'react';
import { useTitle } from '/src/hooks/useTitle';
const Mail = () => {
    const { setTitle } = useTitle();
    useEffect(() => {
        setTitle("Mail");
    }, []);
    return (
        <div>
            <h1>Mail Page</h1>
        </div>
    )
}

export default Mail;
