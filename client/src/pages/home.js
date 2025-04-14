// src/home.js
import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import Button from "../components/Button";
import PushNumb from "../components/PushNumb";
import RoomItem from "../components/RoomItem";
import {
    getDsPhongByChuTro,
    getDsLoaiPhong,
    themPhong,
    suaPhong,
    xoaPhong,
} from "../services/phongService";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// --- Simple Modal Styles (Replace with a library or CSS classes for better styling) ---
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

const modalActionsStyle = {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
};
// --- End Simple Modal Styles ---


// Receive selectedHouseId as a prop
const Home = ({ selectedHouseId }) => {
    const navigate = useNavigate(); // Initialize useNavigate

    console.log("Home component received selectedHouseId PROP:", selectedHouseId);
    const [allRooms, setAllRooms] = useState([]); // Store all rooms for the landlord
    const [allRoomTypes, setAllRoomTypes] = useState([]); // Store all room types
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add error state

    // --- Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentRoom, setCurrentRoom] = useState(null); // Store room data for editing
    const [formData, setFormData] = useState({ // State for form inputs
        TenPhong: '',
        DienTich: '',
        GiaPhong: '',
        SoNguoiToiDa: '',
        TrangThai: 'Còn phòng', // Default status
        MaNhaTro: '', // Will be set when opening modal
        MaLoaiPhong: '',
        GhiChu: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
    // --- End Modal State ---

    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const MaTK = localStorage.getItem("MaTK");

    useEffect(() => {
        const fetchAllLandlordRooms = async () => {
            if (loaiTaiKhoan === "Chủ trọ" && MaTK) {
                setLoading(true);
                setError(null); // Reset error on new fetch
                try {
                    const ds = await getDsPhongByChuTro(MaTK);
                    if (Array.isArray(ds)) {
                        setAllRooms(ds);
                    } else {
                        console.warn("API response for all landlord rooms was not an array.");
                        setAllRooms([]);
                        setError("Dữ liệu phòng nhận được không hợp lệ.");
                    }
                } catch (fetchError) {
                    console.error(`Lỗi khi lấy tất cả phòng cho chủ trọ ${MaTK}:`, fetchError);
                    setError(`Không thể tải danh sách phòng: ${fetchError.message}`);
                    setAllRooms([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setAllRooms([]);
                setLoading(false);
            }
        };

        // Fetch all room types (if needed)
        const fetchAllRoomTypes = async () => {
            setLoading(true); // Có thể set loading ở đây nếu muốn
            setError(null);
            try {
                const dsLoaiPhong = await getDsLoaiPhong();
                if (Array.isArray(dsLoaiPhong)) {
                    setAllRoomTypes(dsLoaiPhong); // <<<<<<< Lưu danh sách loại phòng
                } else {
                    console.warn("API response for room types was not an array.");
                    setAllRoomTypes([]);
                    setError("Dữ liệu loại phòng nhận được không hợp lệ.");
                }
            } catch (fetchError) {
                console.error("Lỗi khi lấy danh sách loại phòng:", fetchError);
                setError(`Không thể tải danh sách loại phòng: ${fetchError.message}`);
                setAllRoomTypes([]);
            } finally {
                 // setLoading(false); // Chỉ tắt loading sau khi cả 2 fetch xong (nếu cần)
            }
        };


        fetchAllLandlordRooms();
        fetchAllRoomTypes();
    }, [MaTK, loaiTaiKhoan]);

    // --- Filter rooms based on selectedHouseId ---
    // Use useMemo to avoid re-filtering on every render unless rooms or selectedHouseId change
    const filteredRooms = useMemo(() => {
        if (!selectedHouseId) return [];
        if (!Array.isArray(allRooms)) return [];
        return allRooms.filter(room => room && String(room.MaNhaTro) === String(selectedHouseId)); // Ensure type comparison consistency
    }, [allRooms, selectedHouseId]);

    // --- Calculate Statistics based on FILTERED rooms ---
    const totalRooms = filteredRooms.length;
    const { rentedCount, availableCount, maintenanceCount } = useMemo(() => {
        return Array.isArray(filteredRooms)
            ? filteredRooms.reduce(
                (counts, room) => {
                    const status = room?.TrangThai ?? 'Không xác định';
                    if (status === "Hết phòng") counts.rentedCount++;
                    else if (status === "Còn phòng") counts.availableCount++;
                    else if (status === "Đang bảo trì") counts.maintenanceCount++;
                    return counts;
                },
                { rentedCount: 0, availableCount: 0, maintenanceCount: 0 }
            )
            : { rentedCount: 0, availableCount: 0, maintenanceCount: 0 };
    }, [filteredRooms]); // Recalculate only when filteredRooms change

    // --- Modal and Form Handlers ---

    const openModal = (mode = 'add', roomData = null, roomType = null) => {
        setModalMode(mode);
        setIsSubmitting(false); // Reset submission state
        setError(null); // Clear previous form errors
        if (mode === 'edit' && roomData) {
            setCurrentRoom(roomData);
            setFormData({
                TenPhong: roomData.TenPhong || '',
                DienTich: roomData.RoomType.DienTich || '',
                GiaPhong: roomData.RoomType.Gia || '',
                SoNguoiToiDa: roomData.RoomType.SoNguoiToiDa || '',
                MaLoaiPhong: roomData.MaLoaiPhong || '',
                TrangThai: roomData.TrangThai || 'Còn phòng',
                MaNhaTro: roomData.MaNhaTro, // Keep existing MaNhaTro
                GhiChu: roomData.GhiChu || '',
            });
        } else { // Add mode or fallback
            setCurrentRoom(null);
            setFormData({ // Reset form for adding
                TenPhong: '',
                DienTich: '',
                GiaPhong: '',
                SoNguoiToiDa: '',
                TrangThai: 'Còn phòng',
                MaNhaTro: selectedHouseId, // Set the current house ID
                MaLoaiPhong: '',
                GhiChu: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRoom(null);
        setFormData({ // Reset form
            TenPhong: '', DienTich: '', GiaPhong: '', TrangThai: 'Còn phòng', MaNhaTro: '', MaLoaiPhong: ''
        });
        setError(null); // Clear any form errors
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoomTypeChange = (event) => {
        const selectedMaLoaiPhong = event.target.value;
        const selectedType = allRoomTypes.find(type => String(type.MaLoaiPhong) === String(selectedMaLoaiPhong));
        console.log("Selected room type:", selectedType);
        if (selectedType) {
            setFormData(prev => ({
                ...prev,
                MaLoaiPhong: selectedMaLoaiPhong,
                DienTich: selectedType.DienTich,
                GiaPhong: selectedType.Gia,
                SoNguoiToiDa: selectedType.SoNguoiToiDa
            }));
        } else {
            // Nếu chọn lại option mặc định "-- Chọn loại phòng --"
            setFormData(prev => ({
                ...prev,
                MaLoaiPhong: '',
                DienTich: '', // Xóa giá trị cũ
                GiaPhong: '',  // Xóa giá trị cũ
                SoNguoiToiDa: ''
            }));
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Update Validation: Ensure a room type is selected
        if (!formData.TenPhong || !formData.MaLoaiPhong) { // Kiểm tra MaLoaiPhong thay vì DienTich/GiaPhong
            setError("Vui lòng điền Tên phòng và chọn Loại phòng.");
            setIsSubmitting(false);
            return;
        }

        // Chuẩn bị dữ liệu gửi đi (chỉ gửi MaLoaiPhong, không gửi DienTich, GiaPhong)
        const payload = {
            TenPhong: formData.TenPhong,
            TrangThai: formData.TrangThai,
            GhiChu: formData.GhiChu,
            MaNhaTro: formData.MaNhaTro,
            MaLoaiPhong: formData.MaLoaiPhong, // <<<<<<<<<< GỬI MaLoaiPhong
            maChuTro: localStorage.MaChuTro
        };
        // Không cần gửi DienTich, GiaPhong nếu backend lấy từ MaLoaiPhong


        try {
            if (modalMode === 'add') {
                console.log("Submitting ADD form data:", payload);
                const addedRoom = await themPhong(payload); // Gửi payload đã chuẩn bị
                // Cần đảm bảo addedRoom trả về có cấu trúc đầy đủ (bao gồm RoomType) để hiển thị đúng
                setAllRooms(prev => [...prev, addedRoom]);
                alert('Thêm phòng thành công!');
            } else if (modalMode === 'edit' && currentRoom) {
                console.log("Submitting EDIT form data:", payload, "for room ID:", currentRoom.MaPhong);
                const updatedRoom = await suaPhong(currentRoom.MaPhong, payload); // Gửi payload đã chuẩn bị
                // Cần đảm bảo updatedRoom trả về có cấu trúc đầy đủ
                setAllRooms(prev => prev.map(room =>
                    room.MaPhong === currentRoom.MaPhong ? updatedRoom : room
                ));
                alert('Cập nhật phòng thành công!');
            }
            closeModal();
        } catch (apiError) {
            console.error(`Lỗi khi ${modalMode === 'add' ? 'thêm' : 'cập nhật'} phòng:`, apiError);
            setError(`Thao tác thất bại: ${apiError.response?.data?.error || apiError.message || 'Vui lòng thử lại.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Room Action Handlers ---
    const handleNavigateToAddTenant = (roomId) => {
        console.log("Navigating to Add Tenant page for room:", roomId);
        navigate(`/room/${roomId}/tenants`); // Navigate to the add route
    };

    const handleThemPhong = () => {
        if (!selectedHouseId) {
            alert("Vui lòng chọn một nhà trọ trước khi thêm phòng.");
            return;
        }
        openModal('add'); // Open modal in 'add' mode
    };

    const handleSuaPhong = (roomId) => {
        const roomToEdit = allRooms.find(room => room.MaPhong === roomId);
        const roomType = allRoomTypes.find(type => type.MaLoaiPhong === roomToEdit?.MaLoaiPhong);
        if (roomToEdit) {
            openModal('edit', roomToEdit, roomType); // Open modal in 'edit' mode with data
        } else {
            alert("Không tìm thấy thông tin phòng để chỉnh sửa.");
        }
    };

    const handleXoaPhong = async (roomId) => {
        console.log("Trigger Xóa phòng action for room ID:", roomId);
        if (!roomId) return;

        // Confirmation Dialog
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng này không? Hành động này không thể hoàn tác.`)) {
             return;
        }

        try {
            await xoaPhong(roomId); // Call API service
            // Update state: Remove room from the main list
            setAllRooms(currentRooms => currentRooms.filter(room => room.MaPhong !== roomId));
            alert('Xóa phòng thành công!');
        } catch (deleteError) {
            console.error(`Lỗi khi xóa phòng ${roomId}:`, deleteError);
            alert(`Lỗi xóa phòng: ${deleteError.message || 'Vui lòng thử lại.'}`);
        }
    };

    // --- Render Logic ---
    if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Đang tải dữ liệu phòng...</div>;

    // If no house is selected (and we chose not to show all rooms)
    if (loaiTaiKhoan === "Chủ trọ" && !selectedHouseId && !loading) {
         return <div style={{ padding: "30px", textAlign: "center", color: '#777' }}>Vui lòng chọn một nhà trọ từ danh sách ở trên.</div>;
    }

    const selectedRoomTypeObject = allRoomTypes.find(type => type.MaLoaiPhong === formData.MaLoaiPhong);
    // Lấy tên loại phòng từ object tìm được. Cung cấp giá trị dự phòng nếu không tìm thấy.
    const currentRoomTypeName = selectedRoomTypeObject ? selectedRoomTypeObject.TenLoai : "Không xác định"; // Hoặc chuỗi rỗng ''

    return (
        <div style={{ width: "100%" }}>
            {/* Header Section (Statistics for the SELECTED house) */}
            <div
                style={{
                    minHeight: 83, margin: "10px", padding: "10px 20px",
                    display: "flex", flexWrap: "wrap", justifyContent: "space-between",
                    alignItems: "center", gap: "20px", borderRadius: "10px",
                    background: "white", borderBottom: "1px solid #D2D2D2",
                }}
            >
                <div style={{ display: "flex", flexWrap:"wrap", alignItems: "center", gap: "15px" }}>
                    {/* Display counts for the filtered rooms */}
                    <PushNumb text="Còn trống" numb={availableCount} />
                    <PushNumb text="Đã cho thuê" numb={rentedCount} />
                    <PushNumb text="Bảo trì" numb={maintenanceCount} />
                    <PushNumb text="Tổng số" numb={totalRooms} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {loaiTaiKhoan === "Chủ trọ" && selectedHouseId && ( // Show button only if a house is selected
                        <button className="green-btn btn" onClick={handleThemPhong}>Thêm phòng</button>
                    )}
                </div>
            </div>

            {/* Room List Section (for the SELECTED house) */}
            <div
                style={{
                    display: "flex", justifyContent: "flex-start", flexWrap: "wrap",
                    gap: "15px", padding: "15px",
                }}
            >
                {loaiTaiKhoan === "Chủ trọ" && filteredRooms.length === 0 && !loading && selectedHouseId && (
                    <p style={{ width: '100%', textAlign: 'center', color: '#777', padding: '30px 0' }}>
                        Nhà trọ này chưa có phòng nào. Hãy nhấn "Thêm phòng".
                    </p>
                )}
                 {loaiTaiKhoan !== "Chủ trọ" && filteredRooms.length === 0 && !loading && (
                      <p style={{ width: '100%', textAlign: 'center', color: '#777', padding: '30px 0' }}>
                        Không có phòng nào để hiển thị.
                     </p>
                 )}

                {/* Map over FILTERED rooms */}
                {filteredRooms.map((room) => (
                    room?.MaPhong ? (
                        <RoomItem
                            key={room.MaPhong}
                            room={room}
                            loaiTaiKhoan={loaiTaiKhoan}
                            onEdit={handleSuaPhong}
                            onDelete={handleXoaPhong}
                            onAddTenant={handleNavigateToAddTenant}
                        />
                    ) : null
                ))}
            </div>
            {/* --- Add/Edit Room Modal --- */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            {modalMode === 'add' ? 'Thêm phòng mới' : 'Chỉnh sửa phòng'}
                        </h2>

                        {/* Display form error */}
                        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

                        <form onSubmit={handleFormSubmit}>
                            <div style={formGroupStyle}>
                                <label htmlFor="TenPhong" style={labelStyle}>Tên phòng / Số phòng:</label>
                                <input
                                    type="text"
                                    id="TenPhong"
                                    name="TenPhong"
                                    value={formData.TenPhong}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="MaLoaiPhong" style={labelStyle}>Loại phòng:</label>
                                {formData.TrangThai === 'Hết phòng' ? (
                                    <input
                                    type="text"
                                    id="TrangThai"
                                    name="TrangThai" // Giữ name để form có thể submit đúng (nếu cần)
                                    value={currentRoomTypeName} // Tên loại phòng
                                    readOnly // Thuộc tính quan trọng để không cho sửa
                                    style={inputStyle}
                                    />
                                ) : (
                                    <select
                                    id="MaLoaiPhong"
                                    name="MaLoaiPhong"
                                    value={formData.MaLoaiPhong}
                                    onChange={handleRoomTypeChange} // <<<< Gắn handler
                                    style={inputStyle}
                                    required
                                >
                                    <option value="">-- Chọn loại phòng --</option>
                                    {allRoomTypes.map(type => (
                                        <option key={type.MaLoaiPhong} value={type.MaLoaiPhong}>
                                            {type.TenLoai}
                                        </option>
                                    ))}
                                </select>)}
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="DienTich" style={labelStyle}>Diện tích (m²):</label>
                                <input
                                    type="number" // Use number type
                                    id="DienTich"
                                    name="DienTich"
                                    value={formData.DienTich}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                    min="1"
                                    required
                                    readOnly
                                />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="GiaPhong" style={labelStyle}>Giá phòng (VNĐ):</label>
                                <input
                                    type="number" // Use number type
                                    id="GiaPhong"
                                    name="GiaPhong"
                                    value={formData.GiaPhong}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                    min="0"
                                    required
                                    readOnly
                                />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="SoNguoiToiDa" style={labelStyle}>Số người tối đa:</label>
                                <input
                                    type="number" // Use number type
                                    id="SoNguoiToiDa"
                                    name="SoNguoiToiDa"
                                    value={formData.SoNguoiToiDa}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                    min="0"
                                    required
                                    readOnly
                                />
                            </div>
                             <div style={formGroupStyle}>
                                <label htmlFor="TrangThai" style={labelStyle}>Trạng thái:</label>
                                {formData.TrangThai === 'Hết phòng' ? (
                                // Trường hợp 1: Hết phòng -> Hiển thị input text read-only
                                <input
                                    type="text"
                                    id="TrangThai"
                                    name="TrangThai" // Giữ name để form có thể submit đúng (nếu cần)
                                    value="Hết phòng"
                                    readOnly // Thuộc tính quan trọng để không cho sửa
                                    style={inputStyle}
                                />
                            ) : (
                                // Trường hợp 2: Không phải Hết phòng -> Hiển thị dropdown với 2 option còn lại
                                <select
                                    id="TrangThai"
                                    name="TrangThai"
                                    value={formData.TrangThai} // Vẫn binding với state hiện tại
                                    onChange={handleInputChange} // Vẫn dùng handler cũ
                                    style={inputStyle}
                                >
                                    {/* Chỉ hiển thị 2 options này */}
                                    <option value="Còn phòng">Còn phòng</option>
                                    <option value="Đang bảo trì">Đang bảo trì</option>
                                    {/* Không có option "Hết phòng" ở đây */}
                                </select>
                            )}
                            </div>
                             {/* MaNhaTro is needed but usually not edited by the user directly */}
                            {/* <input type="hidden" name="MaNhaTro" value={formData.MaNhaTro} /> */}

                            <div style={modalActionsStyle}>
                                <button
                                    type="button" // Important: type="button" to prevent implicit form submission
                                    className="grey-btn btn" // Add appropriate classes
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                
                                <button
                                    type="submit" // This button submits the form
                                    className="green-btn btn" // Add appropriate classes
                                    disabled={isSubmitting}
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
             {/* --- End Modal --- */}
        </div>
    );
};

export default Home;