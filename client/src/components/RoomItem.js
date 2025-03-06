import React from "react";
import Button from "./Button";

const RoomItem = ({className, name_passenger="", price_of_room='1.000.000', name_room="Phòng"}) => {
    return (
        <div className={`${className}`} style={{width: 275, height: 255, marginBottom: '20px',display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", background: 'white', borderRadius: 10, overflow: 'hidden'}}>
          <div style={{overflow: 'hidden'}}>
            <div style={{ left: 61, top: 1, textAlign: 'center', color: 'black', fontSize: 24, fontWeight: '500', wordWrap: 'break-word'}}>{name_room}</div>
          </div>
          <div style={{width: "100%", overflow: 'hidden', display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
            <i class="fa-solid fa-user" style={{margin: '0 10px'}}></i>
            <span>{name_passenger}</span>
          </div>
          <div style={{width: "100%", overflow: 'hidden', display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
            <i class="fa-solid fa-money-bill-wave" style={{margin: '0 10px'}}></i>
            <span style={{color: '#D84040', fontWeight: 600}}>{price_of_room}đ</span>
          </div>
          <div style={{width: "100%", overflow: 'hidden', display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
            <Button class_name='blue-btn-item btn' label='Thêm Khách' />
          </div>
          <div style={{width: "100%", overflow: 'hidden', display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Button class_name='green-btn-item btn' label='Chỉnh sửa' />
            <Button class_name='delete-btn-item btn' label='Xóa' />
          </div>
        </div>
    );
};

export default RoomItem;