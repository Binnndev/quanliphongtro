import React, { useState, useEffect } from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer";
import Header from "../components/Header";
import SubHeader from "../components/SubHeader";
import Button from "../components/Button";
import DichVuIndex from "../components/DichVuIndex";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";
import TenantDashboard from "../components/TenantDashboard";
import Home from "./home";
import RoomTypeIndex from "../components/RoomTypeIndex";
import DienNuoc from "../components/DienNuocIndex";
import PaymentIndex from "../components/PaymentIndex";
import ThongKe from "../components/ThongKe";
import Renter from "./Renter";
import axios from "axios";
import {
    getDsPhong,
    getNhaTroByChuTro,
  themPhong,
  suaPhong,
  xoaPhong,
} from "../services/phongService";
import { themNhaTro, suaNhaTro, xoaNhaTro } from "../services/nhaService";
import {
    getRoomType,
    addRoomType,
    updateRoomType,
    deleteRoomType,
} from "../services/roomTypeService";
import NotificationManagementPage from "./NotificationManagementPage";

const Homepage = () => {
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const MaTK = localStorage.getItem("MaTK");
    const MaChuTro = localStorage.getItem("MaChuTro"); 

    const [rooms, setRooms] = useState([]);

    const [isOpen, setIsOpen] = useState(false);

    const [page, setPage] = useState("home");
    const [selectedRoomIdForTenant, setSelectedRoomIdForTenant] = useState(null);
    
    // State for rental houses
    const [rentalHouses, setRentalHouses] = useState([]);
    const [houses, setHouses] = useState([]);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [loadingHouses, setLoadingHouses] = useState(false);
    const [selectedHouseId, setSelectedHouseId] = useState(null); // ID of the selected house (MaNhaTro)

    // --- STATE CHO MODAL NHÀ TRỌ ---
    const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
    const [houseModalMode, setHouseModalMode] = useState('add'); // 'add' or 'edit'
    const [currentEditingHouse, setCurrentEditingHouse] = useState(null); // Lưu nhà đang sửa
    const [houseFormData, setHouseFormData] = useState({
        TenNhaTro: '',
        DiaChi: ''
    });
    const [isSubmittingHouse, setIsSubmittingHouse] = useState(false);
    const [houseFormError, setHouseFormError] = useState(null);
    // ---------------------------------

    // --- STATE CHO LOẠI PHÒNG ---
    const [roomTypes, setRoomTypes] = useState([]);
    const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
    const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
    const [roomTypeModalMode, setRoomTypeModalMode] = useState('add');
    const [currentEditingRoomType, setCurrentEditingRoomType] = useState(null);
    const [roomTypeFormData, setRoomTypeFormData] = useState({
        // *** Sửa tên trường và thêm trường mới ***
        TenLoai: '',
        Gia: '',
        DienTich: '', // Thêm Diện tích
        SoNguoiToiDa: '', // Thêm Số người
    });
    const [isSubmittingRoomType, setIsSubmittingRoomType] = useState(false);
    const [roomTypeError, setRoomTypeError] = useState(null);
  

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

  }, [navigate, loaiTaiKhoan, MaTK]);
    
  useEffect(() => {
    const fetchRoomTypesForLandlord = async () => {
        // Lấy MaChuTro mới nhất từ localStorage mỗi lần effect chạy
        const currentMaChuTro = localStorage.getItem("MaChuTro");

        // Chỉ fetch nếu là chủ trọ và CÓ MaChuTro
        if (loaiTaiKhoan === "Chủ trọ" && currentMaChuTro) {
            setLoadingRoomTypes(true);
            setRoomTypes([]);
            try {
                console.log(`Workspaceing room types for landlord ID: ${currentMaChuTro}`);
                // *** Gọi hàm service mới ***
                const fetchedRoomTypes = await getRoomType(currentMaChuTro);
                setRoomTypes(fetchedRoomTypes);
                console.log("Fetched Room Types:", fetchedRoomTypes);
            } catch (error) {
                console.error(`Lỗi khi lấy danh sách loại phòng cho chủ trọ ${currentMaChuTro}:`, error);
                setRoomTypes([]);
            } finally {
                setLoadingRoomTypes(false);
            }
        } else {
            // Nếu không phải chủ trọ hoặc không có MaChuTro, danh sách loại phòng rỗng
            setRoomTypes([]);
        }
    };

    fetchRoomTypesForLandlord();

}, [loaiTaiKhoan, MaChuTro]); // Chạy lại khi loại tài khoản thay đổi hoặc MaChuTro (lấy từ state/context nếu có thay vì localStorage) thay đổi

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
    
    console.log("Homepage RENDER - current selectedHouseId STATE:", selectedHouseId); // <-- ADD THIS LOG
    
    // --- HÀM XỬ LÝ CHO MODAL NHÀ TRỌ ---

    const openHouseModal = (mode = 'add', houseData = null) => {
        setHouseModalMode(mode);
        setIsSubmittingHouse(false);
        setHouseFormError(null);

        if (mode === 'edit' && houseData) {
            setCurrentEditingHouse(houseData);
            setHouseFormData({
                TenNhaTro: houseData.TenNhaTro || '',
                DiaChi: houseData.DiaChi || '',
                MoTa: houseData.MoTa || '' // Thêm các trường khác
            });
        } else {
            setCurrentEditingHouse(null);
            setHouseFormData({ // Reset form cho chế độ add
                TenNhaTro: '',
                DiaChi: '',
                MoTa: ''
            });
        }
        setIsHouseModalOpen(true);
    };

    const closeHouseModal = () => {
        setIsHouseModalOpen(false);
        setCurrentEditingHouse(null);
        setHouseFormData({ TenNhaTro: '', DiaChi: '', MoTa: '' });
        setHouseFormError(null);
    };

    const handleHouseInputChange = (event) => {
        const { name, value } = event.target;
        setHouseFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleHouseFormSubmit = async (event) => {
        event.preventDefault();
        setIsSubmittingHouse(true);
        setHouseFormError(null);

        // Validation cơ bản
        if (!houseFormData.TenNhaTro || !houseFormData.DiaChi) {
            setHouseFormError("Vui lòng nhập Tên nhà trọ và Địa chỉ.");
            setIsSubmittingHouse(false);
            return;
        }

        // Chuẩn bị payload (có thể thêm MaChuTro nếu API cần)
        const payload = {
             ...houseFormData,
             MaChuTro: localStorage.MaChuTro // Gửi kèm MaChuTro nếu API thêm/sửa yêu cầu
        };

        try {
            if (houseModalMode === 'add') {
                console.log("Submitting ADD House:", payload);
                const addedHouse = await themNhaTro(payload); // Gọi API thêm
                // Cập nhật state danh sách nhà trọ
                setRentalHouses(prev => [...prev, addedHouse]);
                alert('Thêm nhà trọ thành công!');
                 // Tùy chọn: Tự động chọn nhà vừa thêm
                 // handleHouseSelect(addedHouse.MaNhaTro);
            } else if (houseModalMode === 'edit' && currentEditingHouse) {
                console.log("Submitting EDIT House:", payload, "for ID:", currentEditingHouse.MaNhaTro);
                const updatedHouse = await suaNhaTro(currentEditingHouse.MaNhaTro, payload); // Gọi API sửa
                // Cập nhật state danh sách nhà trọ
                setRentalHouses(prev => prev.map(house =>
                    house.MaNhaTro === currentEditingHouse.MaNhaTro ? updatedHouse : house
                ));
                 // Nếu nhà đang được chọn bị sửa, cập nhật lại thông tin (nếu cần)
                 if (selectedHouseId === currentEditingHouse.MaNhaTro) {
                     // Có thể cần cập nhật lại selectedHouse nếu bạn lưu cả object
                 }
                alert('Cập nhật nhà trọ thành công!');
            }
            closeHouseModal(); // Đóng modal sau khi thành công
        } catch (apiError) {
            console.error(`Lỗi khi ${houseModalMode === 'add' ? 'thêm' : 'cập nhật'} nhà trọ:`, apiError);
            setHouseFormError(`Thao tác thất bại: ${apiError.response?.data?.message || apiError.message || 'Vui lòng thử lại.'}`);
        } finally {
            setIsSubmittingHouse(false);
        }
    };

    const handleDeleteHouse = async (houseId, houseName) => {
        if (!houseId) return;

        // Xác nhận trước khi xóa
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhà trọ "${houseName || houseId}" không? Hành động này sẽ xóa tất cả phòng và dữ liệu liên quan đến nhà trọ này (nếu backend hỗ trợ xóa cascade).`)) {
            return;
        }

        try {
            await xoaNhaTro(houseId); // Gọi API xóa
            // Cập nhật state: Loại bỏ nhà trọ khỏi danh sách
            setRentalHouses(prev => prev.filter(house => house.MaNhaTro !== houseId));

            // Nếu nhà trọ đang được chọn bị xóa, reset lựa chọn
            if (selectedHouseId === houseId) {
                 setSelectedHouseId(null); // Hoặc chọn nhà đầu tiên còn lại
            }

            alert('Xóa nhà trọ thành công!');

        } catch (deleteError) {
             console.error(`Lỗi khi xóa nhà trọ ${houseId}:`, deleteError);
             // Xử lý lỗi ràng buộc khóa ngoại một cách thân thiện hơn
             if (deleteError.response?.status === 409 || deleteError.message.includes('constraint')) { // Kiểm tra lỗi conflict hoặc constraint
                  alert(`Lỗi xóa nhà trọ: Không thể xóa nhà trọ này vì vẫn còn phòng hoặc dữ liệu khác (hợp đồng, điện nước,...) liên kết với nó. Vui lòng xóa các dữ liệu liên quan trước.`);
             } else {
                  alert(`Lỗi xóa nhà trọ: ${deleteError.response?.data?.message || deleteError.message || 'Vui lòng thử lại.'}`);
             }

        }
    };

    // --- KẾT THÚC HÀM XỬ LÝ MODAL NHÀ TRỌ ---

    // --- HÀM XỬ LÝ CHO MODAL LOẠI PHÒNG (Cập nhật) ---
    const openRoomTypeModal = (mode = 'add', roomTypeData = null) => {
        setRoomTypeModalMode(mode);
        setIsSubmittingRoomType(false);
        setRoomTypeError(null);

        if (mode === 'edit' && roomTypeData) {
            setCurrentEditingRoomType(roomTypeData);
            setRoomTypeFormData({
                // *** Cập nhật tên trường và thêm trường ***
                TenLoai: roomTypeData.TenLoai || '',
                Gia: roomTypeData.Gia || '',
                DienTich: roomTypeData.DienTich || '',
                SoNguoiToiDa: roomTypeData.SoNguoiToiDa || '',
            });
        } else {
            setCurrentEditingRoomType(null);
            setRoomTypeFormData({ // Reset form
                TenLoai: '',
                Gia: '',
                DienTich: '',
                SoNguoiToiDa: '',
            });
        }
        setIsRoomTypeModalOpen(true);
    };

    const closeRoomTypeModal = () => {
        setIsRoomTypeModalOpen(false);
        setCurrentEditingRoomType(null);
        // *** Cập nhật reset form ***
        setRoomTypeFormData({ TenLoai: '', Gia: '', DienTich: '', SoNguoiToiDa: '' });
        setRoomTypeError(null);
    };

    const handleRoomTypeInputChange = (event) => {
        const { name, value } = event.target;
        setRoomTypeFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoomTypeFormSubmit = async (event) => {
        event.preventDefault();
        setIsSubmittingRoomType(true);
        setRoomTypeError(null);
        const currentMaChuTro = localStorage.getItem("MaChuTro"); // Lấy MaChuTro

        // Validation
        // *** Cập nhật tên trường validate ***
        if (!roomTypeFormData.TenLoai || !roomTypeFormData.Gia || !roomTypeFormData.DienTich || !roomTypeFormData.SoNguoiToiDa) {
            setRoomTypeError("Vui lòng nhập đầy đủ Tên loại, Giá, Diện tích và Số người tối đa.");
            setIsSubmittingRoomType(false);
            return;
        }
        if (!currentMaChuTro) { // Kiểm tra MaChuTro
            setRoomTypeError("Lỗi: Không xác định được Chủ trọ. Vui lòng thử tải lại trang.");
            setIsSubmittingRoomType(false);
            return;
        }

        // Chuẩn bị payload
        const payload = {
            ...roomTypeFormData,
            // *** Parse các giá trị số ***
            Gia: parseFloat(roomTypeFormData.Gia) || 0,
            DienTich: parseFloat(roomTypeFormData.DienTich) || 0,
            SoNguoiToiDa: parseInt(roomTypeFormData.SoNguoiToiDa, 10) || 0,
            // *** Thêm MaChuTro vào payload khi thêm mới ***
            ...(roomTypeModalMode === 'add' && { MaChuTro: parseInt(currentMaChuTro, 10) }) // Parse MaChuTro nếu cần
        };
         // Loại bỏ MaChuTro khỏi payload khi sửa (API sửa dựa vào ID trên URL)
         if (roomTypeModalMode === 'edit') {
            delete payload.MaChuTro;
         }


        try {
            if (roomTypeModalMode === 'add') {
                console.log("Submitting ADD Room Type:", payload);
                const addedRoomType = await addRoomType(payload);
                setRoomTypes(prev => [...prev, addedRoomType]);
                alert('Thêm loại phòng thành công!');
            } else if (roomTypeModalMode === 'edit' && currentEditingRoomType) {
                console.log("Submitting EDIT Room Type:", payload, "for ID:", currentEditingRoomType.MaLoaiPhong);
                const updatedRoomType = await updateRoomType(currentEditingRoomType.MaLoaiPhong, payload);
                setRoomTypes(prev => prev.map(rt =>
                    rt.MaLoaiPhong === currentEditingRoomType.MaLoaiPhong ? { ...rt, ...updatedRoomType } : rt // Merge data
                ));
                alert('Cập nhật loại phòng thành công!');
            }
            closeRoomTypeModal();
        } catch (apiError) {
            console.error(`Lỗi khi ${roomTypeModalMode === 'add' ? 'thêm' : 'cập nhật'} loại phòng:`, apiError);
            setRoomTypeError(`Thao tác thất bại: ${apiError.response?.data?.message || apiError.message || 'Vui lòng thử lại.'}`);
        } finally {
            setIsSubmittingRoomType(false);
        }
    };

    // *** Cập nhật tham số tên loại phòng nếu cần ***
    const handleDeleteRoomType = async (loaiPhongId, tenLoai) => {
        if (!loaiPhongId) return;

        if (!window.confirm(`Bạn có chắc chắn muốn xóa loại phòng "${tenLoai || loaiPhongId}" không? Hành động này có thể thất bại nếu có phòng đang sử dụng loại này.`)) {
            return;
        }

        try {
            await deleteRoomType(loaiPhongId);
            setRoomTypes(prev => prev.filter(rt => rt.MaLoaiPhong !== loaiPhongId));
            alert('Xóa loại phòng thành công!');
        } catch (deleteError) {
            console.error(`Lỗi khi xóa loại phòng ${loaiPhongId}:`, deleteError);
             let errorMessage = `Lỗi xóa loại phòng: ${deleteError.response?.data?.message || deleteError.message || 'Vui lòng thử lại.'}`;
            if (deleteError.response?.status === 409 || (deleteError.response?.data?.message && deleteError.response.data.message.toLowerCase().includes('constraint'))) {
                 errorMessage = `Lỗi xóa loại phòng: Không thể xóa vì vẫn còn phòng thuộc loại này. Vui lòng xóa các phòng liên quan trước.`;
             }
             alert(errorMessage);
        }
    };
    // --- KẾT THÚC HÀM XỬ LÝ MODAL LOẠI PHÒNG ---

    const handleNavigateToAddTenant = (roomId) => {
        console.log("Navigating to Add Tenant page for room:", roomId);
        navigate(`/room/${roomId}/tenants`); // Navigate to the add route
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure it's on top
    };
    
    const modalContentStyle = {
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        minWidth: '400px',
        maxWidth: '90%',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    };
    
    const formGroupStyle = {
        marginBottom: '15px',
    };
    
    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
    };
    
    const inputStyle = {
        width: '100%',
        padding: '8px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box', // Important for width: 100%
    };

    const textAreaStyle = { ...inputStyle, minHeight: '80px' };
    
    const modalActionsStyle = {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    };

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
                                <div style={{ width: "100%", padding: "10px 15px", display: "flex", gap: "15px", alignItems: "center", background: "#fff", borderBottom: "1px solid #D2D2D2", boxSizing: 'border-box', marginBottom: '10px' }}>
                                    <label htmlFor="houseSelect" style={{ fontWeight: 'bold' }}>Chọn nhà trọ:</label>
                                    {loadingHouses ? (
                                        <p style={{ color: 'grey' }}>Đang tải...</p>
                                    ) : rentalHouses.length === 0 ? (
                                            <p style={{ color: 'grey' }}>Chưa có nhà trọ nào.</p>
                                        ) : (
                                                <select
                                                    id="houseSelect"
                                                    value={selectedHouseId || ""} // Dùng selectedHouseId, đảm bảo có giá trị rỗng cho option mặc định
                                                    onChange={(e) => handleHouseSelect(e.target.value ? parseInt(e.target.value, 10) : null)} // ParseInt nếu ID là số, hoặc giữ nguyên nếu là chuỗi. Xử lý giá trị rỗng.
                                                    style={{ padding: '8px 10px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '200px', flexGrow: 1 /* Cho phép co giãn */ }}
                                                >
                                                    <option value="">-- Chọn nhà trọ --</option> {/* Option mặc định */}
                                                    {rentalHouses.map((house) => (
                                                        <option key={house.MaNhaTro} value={house.MaNhaTro}>
                                                            {house.TenNhaTro || `Nhà ${house.MaNhaTro}`} {/* Hiển thị tên hoặc ID */}
                                                        </option>
                                                    ))}
                                                </select>
                                    )}
                                    {/* Nút Sửa/Xóa chỉ hiển thị KHI ĐÃ CHỌN một nhà */}
                                    {selectedHouseId && !loadingHouses && (
                                         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                             {/* Nút Sửa */}
                                             <button
                                                 onClick={() => {
                                                     const houseToEdit = rentalHouses.find(h => h.MaNhaTro === selectedHouseId);
                                                     if (houseToEdit) openHouseModal('edit', houseToEdit);
                                                 }}
                                                 title="Sửa thông tin nhà trọ đang chọn"
                                                 style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '1.1em' }}
                                             >
                                                 <i className="fa-solid fa-pen-to-square"></i>
                                             </button>
                                             {/* Nút Xóa */}
                                             <button
                                                 onClick={() => {
                                                     const houseToDelete = rentalHouses.find(h => h.MaNhaTro === selectedHouseId);
                                                     if (houseToDelete) handleDeleteHouse(houseToDelete.MaNhaTro, houseToDelete.TenNhaTro);
                                                 }}
                                                 title="Xóa nhà trọ đang chọn"
                                                 style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.1em' }}
                                             >
                                                 <i className="fa-solid fa-trash-can"></i>
                                             </button>
                                         </div>
                                    )}
                                    {/* Nút Thêm Nhà có thể đặt ở đây hoặc trong SubHeader */}
                                     <button className="orange-btn" onClick={() => openHouseModal('add')} style={{ marginLeft: 'auto' }}>Thêm nhà</button>

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
                            {page === "home" && loaiTaiKhoan === "Chủ trọ" && <Home selectedHouseId={selectedHouseId} setPage={setPage}
                                setSelectedRoomIdForTenant={setSelectedRoomIdForTenant} />}
                            {page === "home" && loaiTaiKhoan === "Khách thuê" && <TenantDashboard onSelectPage={setPage} />}
                            {page === "loaiPhong" && loaiTaiKhoan === "Chủ trọ" && (
                            <RoomTypeIndex
                                // selectedHouseId={selectedHouseId} // <= BỎ ĐI
                                roomTypes={roomTypes}
                                loading={loadingRoomTypes}
                                onAdd={() => openRoomTypeModal('add')}
                                onEdit={(roomType) => openRoomTypeModal('edit', roomType)}
                                onDelete={handleDeleteRoomType} // Đảm bảo tên loại phòng đúng (TenLoai)
                            />
                            )}
                            {page === "dien" && <DienNuoc type="Điện" data={dataDien} />}
                            {page === "nuoc" && <DienNuoc type="Nước" data={dataNuoc} />}
                            {page === "tinhTien" && <PaymentIndex landlordId={selectedHouse.MaChuTro} />}
                            {page === "dichVu" && selectedHouse?.MaChuTro && <DichVuIndex maChuTro={selectedHouse.MaChuTro} />}
                            {page === "thongbao" && <NotificationManagementPage/>}
                            {page === "thongke" && <ThongKe />}
                            {page === "khachthue" && loaiTaiKhoan === "Chủ trọ" && selectedRoomIdForTenant &&
                            <Renter roomId={selectedRoomIdForTenant} setPage={setPage} />
                            
                            }
                            {page === "khachthue" && loaiTaiKhoan === "Khách thuê" &&
                            (() => { // Sử dụng IIFE để đọc localStorage và xử lý logic
                                const tenantRoomId = localStorage.getItem("roomId");
                                console.log("Homepage rendering 'khachthue' for Tenant, roomId from localStorage:", tenantRoomId); // Kiểm tra
                                if (tenantRoomId) {
                                    // Render RenterPage với roomId lấy từ localStorage
                                    // Truyền setPage nếu RenterPage của khách thuê cũng cần nút quay lại Home
                                    return <Renter roomId={tenantRoomId} setPage={setPage} />;
                                } else {
                                    // Xử lý trường hợp không tìm thấy roomId (có thể dashboard chưa kịp lưu)
                                    console.warn("Homepage: Could not find tenant roomId in localStorage for RenterPage.");
                                    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Lỗi: Không tìm thấy thông tin phòng. Vui lòng quay lại trang chủ hoặc thử lại.</div>;
                                }
                            })()
                        }
                        </div>
                    </div>
                </div>
            </div>
            {/* --- MODAL THÊM/SỬA NHÀ TRỌ --- */}
            {isHouseModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            {houseModalMode === 'add' ? 'Thêm nhà trọ mới' : 'Chỉnh sửa nhà trọ'}
                        </h2>

                        {houseFormError && <p style={{ color: 'red', marginBottom: '15px' }}>{houseFormError}</p>}

                        <form onSubmit={handleHouseFormSubmit}>
                            <div style={formGroupStyle}>
                                <label htmlFor="TenNhaTro" style={labelStyle}>Tên nhà trọ:</label>
                                <input
                                    type="text"
                                    id="TenNhaTro"
                                    name="TenNhaTro"
                                    value={houseFormData.TenNhaTro}
                                    onChange={handleHouseInputChange}
                                    style={inputStyle}
                                    required
                                    maxLength={100} // Thêm giới hạn ký tự nếu cần
                                />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="DiaChi" style={labelStyle}>Địa chỉ:</label>
                                <input
                                    type="text"
                                    id="DiaChi"
                                    name="DiaChi"
                                    value={houseFormData.DiaChi}
                                    onChange={handleHouseInputChange}
                                    style={inputStyle}
                                    required
                                    maxLength={255}
                                />
                            </div>

                            <div style={modalActionsStyle}>
                                <button
                                    type="button"
                                    className="grey-btn btn" // Sử dụng class CSS của bạn
                                    onClick={closeHouseModal}
                                    disabled={isSubmittingHouse}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="green-btn btn" // Sử dụng class CSS của bạn
                                    disabled={isSubmittingHouse}
                                >
                                    {isSubmittingHouse ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* --- KẾT THÚC MODAL --- */}

            {/* --- MODAL THÊM/SỬA LOẠI PHÒNG --- */}
            {isRoomTypeModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            {roomTypeModalMode === 'add' ? 'Thêm loại phòng mới' : 'Chỉnh sửa loại phòng'}
                        </h2>

                        {roomTypeError && <p style={{ color: 'red', marginBottom: '15px' }}>{roomTypeError}</p>}

                        <form onSubmit={handleRoomTypeFormSubmit}>
                            <div style={formGroupStyle}>
                                <label htmlFor="TenLoai" style={labelStyle}>Tên loại phòng:</label>
                                <input
                                    type="text"
                                    id="TenLoai"       // <= Sửa ID
                                    name="TenLoai"      // <= Sửa Name
                                    value={roomTypeFormData.TenLoai}
                                    onChange={handleRoomTypeInputChange}
                                    style={inputStyle}
                                    required
                                    maxLength={100}
                                />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="Gia" style={labelStyle}>Giá (VNĐ):</label>
                                <input
                                    type="number" // Sử dụng type number cho giá tiền
                                    id="Gia"
                                    name="Gia"
                                    value={roomTypeFormData.Gia}
                                    onChange={handleRoomTypeInputChange}
                                    style={inputStyle}
                                    required
                                    min="0" // Giá không được âm
                                />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="DienTich" style={labelStyle}>Diện tích (m²):</label>
                                <input
                                    type="number"
                                    id="DienTich"
                                    name="DienTich"
                                    value={roomTypeFormData.DienTich}
                                    onChange={handleRoomTypeInputChange}
                                    style={inputStyle}
                                    required
                                    min="1" // Diện tích tối thiểu là 1? Hoặc 0 nếu cho phép
                                    step="0.1" // Cho phép nhập số thập phân (ví dụ: 20.5 m²)
                                />
                            </div>
                             <div style={formGroupStyle}>
                                <label htmlFor="SoNguoiToiDa" style={labelStyle}>Số người tối đa:</label>
                                <input
                                    type="number"
                                    id="SoNguoiToiDa"
                                    name="SoNguoiToiDa"
                                    value={roomTypeFormData.SoNguoiToiDa}
                                    onChange={handleRoomTypeInputChange}
                                    style={inputStyle}
                                    required
                                    min="1" // Tối thiểu 1 người
                                    step="1" // Chỉ cho phép số nguyên
                                />
                            </div>

                            <div style={modalActionsStyle}>
                                <button
                                    type="button"
                                    className="grey-btn btn"
                                    onClick={closeRoomTypeModal}
                                    disabled={isSubmittingRoomType}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="green-btn btn"
                                    disabled={isSubmittingRoomType}
                                >
                                    {isSubmittingRoomType ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
             {/* --- KẾT THÚC MODAL LOẠI PHÒNG --- */}
    </div>
  );
};

export default Homepage;