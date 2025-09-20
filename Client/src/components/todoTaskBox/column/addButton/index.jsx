import React from "react";

import "./index.css"

const AddRowButton = ({handleAddRow}) =>{
    return (
        <button className="add-row-button" onClick={handleAddRow}>+</button>
    )
}

export default AddRowButton;