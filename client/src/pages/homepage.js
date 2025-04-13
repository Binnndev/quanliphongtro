import React, { useState, useEffect } from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer";
import Header from "../components/Header";
import SubHeader from "../components/SubHeader";
import Button from "../components/Button";
import PushNumb from "../components/PushNumb";
import RoomItem from "../components/RoomItem";
import DichVuIndex from "../components/DichVuIndex";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";
import Invoice from "../components/invoices";
import Home from "./home";
import DienNuoc from "../components/DienNuocIndex";
import PaymentIndex from "../components/PaymentIndex";



const Homepage = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [page, setPage] = useState("home");

    const invoiceData = {
        nha: "Nhà Q7",
        diaChi: "Huỳnh Tấn Phát, Phường Tân Phú, Quận 7, Tp HCM",
        hoTen: "Vũ Văn Thiết",
        phong: "100A",
        ngayVao: "12/03/2024",
        thang: "02/2024",
        danhSachChiTiet: [
          { moTa: "Tiền nhà (01/02 - 28/02)", gia: 5310345 },
          { moTa: "Xe máy (1 chiếc)", gia: 50000 },
          { moTa: "Wifi (1)", gia: 250000 },
          { moTa: "Vệ sinh (2)", gia: 40000 },
          { moTa: "Nước (821 - 845)", gia: 480000 },
          { moTa: "Điện (980 - 1239)", gia: 777000 },
        ],
        tongTien: 6907345,
        bangChu: "sáu triệu chín trăm lẻ bảy nghìn ba trăm bốn mươi lăm",
        nganHang: "Sacombank",
        soTaiKhoan: "07861235123124",
        tenChuTK: "Huỳnh Công Khanh",
        soDienThoai: "0777905219",
      };

      const dataDien = [
        { thoiGian: "3/2024", nha: "Nhà Q7", phong: "100A", cu: 1239, moi: 1290 },
        { thoiGian: "3/2024", nha: "Nhà Q1", phong: "P001", cu: 4312, moi: 6524 },
      ];
      
      const dataNuoc = [
        { thoiGian: "3/2024", nha: "Nhà Q7", phong: "100A", cu: 821, moi: 845 },
        { thoiGian: "3/2024", nha: "Nhà Q1", phong: "P001", cu: 0, moi: 0 },
      ];

    const navigate = useNavigate();

    useEffect(() => {
        if(!isAuthenticated()) {
            navigate("/")
        }
    })

    return (
        <div style={{display: "flex", width: "100vw", height: "100vh"}}>
            <div style={{background: '#1B2428', flex: "1 1 20%"}} className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                <div style={{ width: 384, height: 84, left: 0, top: 0, background: '#1B2428', borderBottom: '1px #21373D solid' }}>
                    <div style={{ width: 363, height: 65, left: 10, top: 9, position: 'absolute', textAlign: 'center', color: 'white', fontSize: 32, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word' }}>
                        <AnimatedSignature text="Quản Lý Nhà Trọ" />
                    </div>
                </div>
                <MainContainer onSelectPage = {setPage} currentPage={page} />
            </div>
            <div style={{display: "flex", width: "80%", minHeight: "100vh", background: "#E0E0E0", justifyContent: "center", alignItems: "center"}}>
                <Header />
                <SubHeader />
                <div className='control-content' style={{ width: '80%', height: 835, right: 0, top: 166, position: 'fixed', display: "flex", justifyContent: 'center', alignItems: "center", background: '#E0E0E0', borderBottom: '1px #D2D2D2 solid' }}>
                    <div style={{width: 'calc(100% - 23px)', height: 815, backgroundColor: 'white', flexDirection: "column", borderRadius: '10px', display: "flex", justifyContent: "space-around", alignItems: "center"}}>
                        {/* <div style={{ width: 'calc(100% - 23px)', height: 83, right: 0, top: 83, display: "flex", justifyContent: 'flex-start', alignItems: "center", background: 'white', borderBottom: '1px #D2D2D2 solid' }}>
                            <Button class_name="address-btn btn-2 active-btn" label='1 - 198 ÂU CƠ' />
                            <Button class_name="address-btn btn-2" label='2 - 123 THANH NIÊN' />
                            <Button class_name="address-btn btn-2" label='3 - 12 NGUYỄN THÁI HỌC' />
                        </div> */}
                        <div style={{ width: 'calc(100% - 23px)', height: "100%", right: 0, top: 83, display: "flex", justifyContent: 'flex-start', borderRadius: '10px', margin: '10px 0', flexDirection: "column", alignItems: "center", background: '#ccc', borderBottom: '1px #D2D2D2 solid' }}>
                            {page == "home" && (
                                <Home />
                            )}
                            {page == "dien" && (
                                <DienNuoc type="Điện" data={dataDien} />
                            )}
                            {page == "nuoc" && (
                                <DienNuoc type="Nước" data={dataNuoc} />
                            )}
                            {page == "tinhTien" && (
                                <PaymentIndex />
                            )}
                            {page === "dichVu" && (
                                <DichVuIndex />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage