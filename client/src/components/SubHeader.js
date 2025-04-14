import React from "react";
import Button from "./Button";



const SubHeader = ({ onAddHouseClick }) => {
    return (
        <div className='control-content' style={{ width: '80%', height: 83, right: 0, top: 83, position: 'fixed', display: "flex", justifyContent: 'flex-end', alignItems: "center", background: 'white', borderBottom: '1px #D2D2D2 solid', paddingRight: '20px', boxSizing: 'border-box' }}>
            <button className="orange-btn" onClick={onAddHouseClick}>Thêm nhà</button>
        </div>
    )
}

export default SubHeader;