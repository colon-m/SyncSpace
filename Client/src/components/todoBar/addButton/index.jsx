import React from "react";

const addButton = ({ handleAddEvent }) => {
  return (
    <button className="add-button" onClick={handleAddEvent}>
      +
    </button>
  );
}

export default addButton;