import React from 'react';
import { Navigate } from "react-router";
import { useUser } from '/src/hooks/useUser';
const Auth = ({ children }) => {
    const { user } = useUser();
    if (!user) {
        console.log("nav之前")
        return <Navigate to="login" replace />;
    }
    return children;
};
export default Auth;

