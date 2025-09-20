import { useEffect } from "react";
import { useTitle } from "/src/hooks/useTitle";
const PageTwo = () => {
    const { setTitle } = useTitle();
    useEffect(() => {
        setTitle("联系我们");
    }, []);
    return (
        <div>
            <h1>联系我们</h1>
        </div>
    )
}

export default PageTwo;