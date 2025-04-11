import React from "react";
import Button from "./Button";



const SubHeader = () => {
    return (
        <div className='control-content' style={{ width: '80%', height: 83, right: 0, top: 83, position: 'fixed', display: "flex", justifyContent: 'flex-end', alignItems: "center", background: 'white', borderBottom: '1px #D2D2D2 solid' }}>
            <Button class_name="passenger-btn btn-2" label='Khách thuê' />
            <Button class_name="blue-btn btn-2" label='Phòng' />
            <Button class_name="orange-btn" label='Thêm nhà' />
        </div>
    )
}

export default SubHeader;