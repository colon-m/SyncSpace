import { useEffect } from "react";
import { useTitle } from "/src/hooks/useTitle";
const PageOne = () => {
    const { setTitle } = useTitle();
    useEffect(() => {
        setTitle("关于我们");
    }, []);
    return (
        <div>
            <h1>关于我们</h1>
        </div>
    )
}

export default PageOne;
