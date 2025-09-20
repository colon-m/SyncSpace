import { useState } from "react";
import UserContext from "./userContext";

export default function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const value = { user, setUser };
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

