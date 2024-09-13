import React, { useEffect, useState } from "react";


function PriceLabel({sellingPrice}){
    return(
        <div className="disButtonBase-root disChip-root makeStyles-price-23 disChip-outlined">
          <span className="disChip-label">{sellingPrice} DANG</span>
        </div>
    );
}

export default PriceLabel;