import React from "react";
import TitleContext from "./titleContext";

export default function TitleProvider({children}) {
    const [title,setTitle] = React.useState("");
    return <TitleContext.Provider value={{title,setTitle}}>{children}</TitleContext.Provider>
}
