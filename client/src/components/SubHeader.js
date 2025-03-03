import React from "react";
import Button from "./Button";



const SubHeader = () => {
    return (
        <div style={{ width: '80%', height: 83, right: 0, top: 83, position: 'fixed', display: "flex", justifyContent: 'flex-end', alignItems: "center", background: 'white', borderBottom: '1px #D2D2D2 solid' }}>
            <Button class_name="passenger-btn" label='Khách thuê' />
            <Button class_name="blue-btn" label='Phòng' />
            <Button class_name="orange-btn" label='Thêm nhà' />
        </div>
    )
}

export default SubHeader;