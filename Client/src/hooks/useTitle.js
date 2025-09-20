import { useContext } from "react";
import TitleContext from "../contexts/titleContext";

export function useTitle() {
    const context = useContext(TitleContext);
    if (!context) {
        throw new Error("useTitle must be used within a TitleProvider");
    }
    return context;
}