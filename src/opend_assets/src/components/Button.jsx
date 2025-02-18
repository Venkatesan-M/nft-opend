import React, { useEffect, useState } from "react";


function Button({handleClick, text}){
    return(
        <div className="Chip-root makeStyles-chipBlue-108 Chip-clickable">
            <span
              onClick={handleClick}
              className="form-Chip-label"
            >
              {text}
            </span>
            </div>
    );
}

export default Button;