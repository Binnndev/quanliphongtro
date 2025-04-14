import React, { useState, useEffect } from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer";
import Header from "../components/Header";
import SubHeader from "../components/SubHeader";
import Button from "../components/Button";
import DichVuIndex from "../components/DichVuIndex";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";
import Home from "./home";
import DienNuoc from "../components/DienNuocIndex";
import PaymentIndex from "../components/PaymentIndex";
import ThongKe from "../components/ThongKe";
import axios from "axios";
import {
    getDsPhong,
    getNhaTroByChuTro,
  themPhong,
  suaPhong,
  xoaPhong,
} from "../services/phongService";

const Homepage = () => {
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const MaTK = localStorage.getItem("MaTK");

  const [rooms, setRooms] = useState([]);

  const [isOpen, setIsOpen] = useState(false);

    const [page, setPage] = useState("home");
    
    // State for rental houses
    const [rentalHouses, setRentalHouses] = useState([]);
    const [houses, setHouses] = useState([]);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [loadingHouses, setLoadingHouses] = useState(false);
    const [selectedHouseId, setSelectedHouseId] = useState(null); // ID of the selected house (MaNhaTro)

  

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
    if (!isAuthenticated()) {
        navigate("/");
        return; // Stop effect if not authenticated
    }

    // Fetch rental houses if the user is a landlord
    const fetchRentalHouses = async () => {
        if (loaiTaiKhoan === "Chủ trọ" && MaTK) {
            setLoadingHouses(true);
            try {
                const houses = await getNhaTroByChuTro(MaTK);
                console.log("Fetched Rental Houses RAW:", JSON.stringify(houses, null, 2)); // <-- ADD THIS LOG
                setRentalHouses(houses);
                console.log("Fetched Rental Houses:", houses); // Log the fetched houses
                localStorage.setItem("MaChuTro", houses[0]?.MaChuTro); // Store the first house's ID in localStorage if available
                // Automatically select the first house if available
                if (houses.length > 0) {
                    // Use optional chaining AND check if the ID property exists and is not undefined
                    const firstHouseId = houses[0]?.MaNhaTro; // Adjust MaNhaTro if needed
                    console.log("First house object:", houses[0]); // Log the first object
                    console.log("ID property extracted from first house:", firstHouseId); // See what ID value you got
                
                    // Only set if the ID is not null or undefined
                    if (firstHouseId !== null && firstHouseId !== undefined) {
                         setSelectedHouseId(firstHouseId);
                    } else {
                         console.warn("First house found, but its MaNhaTro is missing or undefined.");
                         setSelectedHouseId(null); // Fallback to null if ID is invalid
                    }
                } else {
                     setSelectedHouseId(null);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách nhà trọ:", error);
                setRentalHouses([]); // Set empty on error
                setSelectedHouseId(null);
            } finally {
                setLoadingHouses(false);
            }
        } else {
             // Not a landlord, clear houses state
             setRentalHouses([]);
             setSelectedHouseId(null);
        }
    };

    fetchRentalHouses();

  }, [navigate, loaiTaiKhoan, MaTK]); // Dependencies for fetching houses

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await axios.get("/api/houses"); // hoặc /api/rental-house nếu đúng API
        if (Array.isArray(res.data)) {
          setHouses(res.data);
          setSelectedHouse(res.data[0]); // chọn nhà đầu tiên mặc định
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách nhà:", err);
      }
    };

    fetchHouses();
  }, []);
    
    const handleHouseSelect = (houseId) => {
        setSelectedHouseId(houseId);
        // Optional: Automatically switch to 'home' page when a house is selected
        // setPage('home');
        console.log("Selected House ID:", houseId);
    };
  const fetchRooms = async () => {
    try {
      const dsPhong = await getDsPhong();
      setRooms(dsPhong);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách room:", error);
    }
  };

  const handleThemPhong = async () => {
    // Ví dụ: thêm phòng demo
    const phongMoi = {
      roomName: "Room Demo",
      description: "Mô tả phòng demo",
      price: 1000000,
      rented: false,
      amenities: "WiFi, Điều hòa",
    };
    try {
      const result = await themPhong(phongMoi);
      console.log("Thêm room thành công:", result);
      setRooms([...rooms, result]);
    } catch (error) {
      console.error("Lỗi khi thêm room:", error);
    }
  };

  const handleSuaNha = async (id) => {
    // Ví dụ: sửa thông tin phòng
    const dataCapNhat = {
      roomName: "Room Edited",
      description: "Cập nhật mô tả cho room",
      price: 2000000,
      rented: true,
      amenities: "WiFi, TV",
    };
    try {
      const result = await suaPhong(id, dataCapNhat);
      console.log("Sửa room thành công:", result);
      setRooms(rooms.map((room) => (room.id === id ? result : room)));
    } catch (error) {
      console.error("Lỗi khi sửa room:", error);
    }
  };

  const handleXoaPhong = async (id) => {
    try {
      const result = await xoaPhong(id);
      console.log("Xóa room thành công:", result);
      setRooms(rooms.filter((room) => room.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa room:", error);
    }
  };
    
  console.log("Homepage RENDER - current selectedHouseId STATE:", selectedHouseId); // <-- ADD THIS LOG

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div
        style={{ background: "#1B2428", flex: "1 1 20%" }}
        className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      >
        <div
          style={{
            width: 384,
            height: 84,
            left: 0,
            top: 0,
            background: "#1B2428",
            borderBottom: "1px #21373D solid",
          }}
        >
          <div
            style={{
              width: 363,
              height: 65,
              left: 10,
              top: 9,
              position: "absolute",
              textAlign: "center",
              color: "white",
              fontSize: 32,
              fontFamily: "Inter",
              fontWeight: "400",
              wordWrap: "break-word",
            }}
          >
            <AnimatedSignature text="Quản Lý Nhà Trọ" />
          </div>
        </div>
        <MainContainer onSelectPage={setPage} currentPage={page} />
      </div>
      <div
        style={{
          display: "flex",
          width: "80%",
          minHeight: "100vh",
          background: "#E0E0E0",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Header />
        <div
          className="control-content"
          style={{
            width: "80%",
            height: 835,
            right: 0,
            top: 83,
            position: "fixed",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#E0E0E0",
            borderBottom: "1px #D2D2D2 solid",
          }}
        >
          <div
            style={{
              width: "calc(100% - 23px)",
              height: 815,
              backgroundColor: "white",
              flexDirection: "column",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "calc(100% - 23px)",
                height: 83,
                right: 0,
                top: 83,
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                background: "white",
                borderBottom: "1px #D2D2D2 solid",
              }}
            >
              {/* Rental House Selection Buttons (Only for Landlord) */}
              {loaiTaiKhoan === "Chủ trọ" && (
                             <div
                                style={{
                                    width: "100%", // Full width
                                    minHeight: 60, // Min height for buttons
                                    padding: "10px 15px", // Padding around buttons
                                    display: "flex",
                                    flexWrap: "wrap", // Allow buttons to wrap
                                    gap: "10px", // Space between buttons
                                    alignItems: "center",
                                    background: "#fff", // White background
                                    borderBottom: "1px solid #D2D2D2", // Separator line
                                    boxSizing: 'border-box'
                                }}
                             >
                                {loadingHouses && <p style={{color: 'grey'}}>Đang tải danh sách nhà...</p>}
                                {!loadingHouses && rentalHouses.length === 0 && <p style={{color: 'grey'}}>Không tìm thấy nhà trọ nào.</p>}
                                {!loadingHouses && rentalHouses.map((house) => (
                                    // <Button
                                    //     key={house.MaNhaTro}
                                    //     // Use TenNhaTro or DiaChi or combine them
                                    //     label={`${house.TenNhaTro || `Nhà ${house.MaNhaTro}`}`} // Use TenNhaTro or default
                                    //     // Apply 'active-btn' if selected, ensure CSS exists for it
                                    //     class_name={`address-btn btn-2 ${selectedHouseId === house.MaNhaTro ? 'active-btn' : ''}`}
                                    //     onClick={() => handleHouseSelect(house.MaNhaTro)}
                                    // />
                                    <button key={house.MaNhaTro} className={`address-btn btn-2 ${selectedHouseId === house.MaNhaTro ? 'active-btn' : ''}`} onClick={() => handleHouseSelect(house.MaNhaTro)}>{`${house.TenNhaTro || `Nhà ${house.MaNhaTro}`}`}</button>
                                ))}
                             </div>
                         )}
            </div>
            <div
              style={{
                width: "calc(100% - 23px)",
                height: "100%",
                right: 0,
                top: 83,
                display: "flex",
                justifyContent: "flex-start",
                borderRadius: "10px",
                margin: "10px 0",
                flexDirection: "column",
                alignItems: "center",
                background: "#ccc",
                borderBottom: "1px #D2D2D2 solid",
              }}
            >
              {page === "home" && <Home selectedHouseId={selectedHouseId} />}
              {page == "dien" && <DienNuoc type="Điện" data={dataDien} />}
              {page == "nuoc" && <DienNuoc type="Nước" data={dataNuoc} />}
              {page == "tinhTien" && <PaymentIndex />}
              {page === "dichVu" && selectedHouse?.MaChuTro && (
            <DichVuIndex maChuTro={selectedHouse.MaChuTro} />
          )}
              {page === "thongke" && <ThongKe />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
