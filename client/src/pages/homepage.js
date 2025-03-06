import React, { useEffect } from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer";
import Header from "../components/Header";
import SubHeader from "../components/SubHeader";
import Button from "../components/Button";
import PushNumb from "../components/PushNumb";
import RoomItem from "../components/RoomItem";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

const data = {
    all: 10,
    used: 6
}

const Homepage = () => {

    const navigate = useNavigate();

    useEffect(() => {
        if(!isAuthenticated()) {
            navigate("/")
        }
    })

    return (
        <div style={{display: "flex"}}>
            <div style={{background: '#1B2428', width: "20%"}} className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                <div style={{ width: 384, height: 84, left: 0, top: 0, background: '#1B2428', borderBottom: '1px #21373D solid' }}>
                    <div style={{ width: 363, height: 65, left: 10, top: 9, position: 'absolute', textAlign: 'center', color: 'white', fontSize: 32, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word' }}>
                        <AnimatedSignature text="Quản Lý Phòng Trọ" />
                    </div>
                </div>
                <MainContainer />
            </div>
            <div style={{display: "flex", width: '100%'}}>
                <Header />
                <SubHeader />
                <div style={{ width: '80%', height: 835, right: 0, top: 166, position: 'fixed', display: "flex", justifyContent: 'center', alignItems: "center", background: '#E0E0E0', borderBottom: '1px #D2D2D2 solid' }}>
                    <div style={{width: 'calc(100% - 23px)', height: 815, backgroundColor: 'white', flexDirection: "column", borderRadius: '10px', display: "flex", justifyContent: "space-around", alignItems: "center"}}>
                        <div style={{ width: 'calc(100% - 23px)', height: 83, right: 0, top: 83, display: "flex", justifyContent: 'flex-start', alignItems: "center", background: 'white', borderBottom: '1px #D2D2D2 solid' }}>
                            <Button class_name="address-btn btn-2 active-btn" label='1 - 198 ÂU CƠ' />
                            <Button class_name="address-btn btn-2" label='2 - 123 THANH NIÊN' />
                            <Button class_name="address-btn btn-2" label='3 - 12 NGUYỄN THÁI HỌC' />
                        </div>
                        <div style={{ width: 'calc(100% - 23px)', height: "100%", right: 0, top: 83, display: "flex", justifyContent: 'flex-start', borderRadius: '10px', margin: '10px 0', flexDirection: "column", alignItems: "center", background: '#ccc', borderBottom: '1px #D2D2D2 solid' }}>
                            <div style={{ width: 'calc(100% - 20px)', height: 83, right: 0, top: 83, display: "flex", justifyContent: "space-between", alignItems: "center", margin: '10px 0', borderRadius: '10px', background: 'white', borderBottom: '1px #D2D2D2 solid' }}>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <PushNumb text='Còn trống' numb={data.all - data.used} />
                                    <PushNumb text='Đã cho thuê' numb={data.used} />
                                    <PushNumb text='Chưa thu phí' numb={0} />
                                </div>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <Button label='Thêm phòng' class_name='green-btn btn' />
                                    <Button label='Sửa nhà' class_name='blue-btn btn' />
                                    <Button label='Xóa nhà' class_name='delete-btn btn' />
                                </div>
                            </div>
                            <div style={{display: "flex", justifyContent: "space-around", flexWrap: "wrap"}}>
                                {Array.from({ length: data.all }, (_, index) => (
                                    <RoomItem key={index} className={index < data.used ? "active" : ""} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage