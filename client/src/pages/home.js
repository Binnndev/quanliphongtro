// src/home.js
import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import Button from "../components/Button";
import PushNumb from "../components/PushNumb";
import RoomItem from "../components/RoomItem";
import {
    getDsPhongByChuTro,
    themPhong,
    suaPhong,
    xoaPhong,
} from "../services/phongService";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Receive selectedHouseId as a prop
const Home = ({ selectedHouseId }) => {
    const navigate = useNavigate(); // Initialize useNavigate

    console.log("Home component received selectedHouseId PROP:", selectedHouseId);
    const [allRooms, setAllRooms] = useState([]); // Store all rooms for the landlord
    const [loading, setLoading] = useState(true);

    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const MaTK = localStorage.getItem("MaTK");

    // Fetch ALL rooms for the landlord once
    useEffect(() => {
        const fetchAllLandlordRooms = async () => {
            if (loaiTaiKhoan === "Chủ trọ" && MaTK) {
                setLoading(true);
                try {
                    const ds = await getDsPhongByChuTro(MaTK);
                    if (Array.isArray(ds)) {
                        setAllRooms(ds);
                    } else {
                        console.warn("API response for all landlord rooms was not an array.");
                        setAllRooms([]);
                    }
                } catch (error) {
                    console.error(`Lỗi khi lấy tất cả phòng cho chủ trọ ${MaTK}:`, error);
                    setAllRooms([]);
                } finally {
                    setLoading(false);
                }
            } else {
                 // Not a landlord or missing ID, ensure rooms are empty
                setAllRooms([]);
                setLoading(false);
            }
        };

        fetchAllLandlordRooms();
    }, [MaTK, loaiTaiKhoan]); // Only re-fetch if landlord changes

    // --- Filter rooms based on selectedHouseId ---
    // Use useMemo to avoid re-filtering on every render unless rooms or selectedHouseId change
    const filteredRooms = useMemo(() => {
        if (!selectedHouseId) {
            // If no house is selected, show all rooms (or none, depending on desired behavior)
            // return allRooms; // Option 1: Show all
            return []; // Option 2: Show none until a house is selected
        }
        if (!Array.isArray(allRooms)) {
            return []; // Should not happen if fetch logic is correct, but safeguard
        }
        // Filter rooms matching the selected house ID
        return allRooms.filter(room => room && room.MaNhaTro === selectedHouseId);
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


    // --- Handlers ---
    // (Keep handlers as previously defined: handleThemPhong, handleSuaPhong, handleXoaPhong, handleThemKhach)
    // Note: These handlers might now need the 'selectedHouseId' if the action
    // (like adding a room) needs to be associated with the currently selected house.

    const handleNavigateToAddTenant = (roomId) => {
        console.log("Navigating to Add Tenant page for room:", roomId);
        navigate(`/room/${roomId}/tenants`); // Navigate to the add route
    };

    const handleThemPhong = () => {
        console.log("Trigger Thêm phòng action", { selectedHouseId });
        if (!selectedHouseId) {
            alert("Vui lòng chọn một nhà trọ trước khi thêm phòng.");
            return;
        }
        // TODO: Open Add Room modal, passing selectedHouseId
    };
     const handleSuaPhong = (roomId) => { /* ... keep implementation ... */ };
     const handleXoaPhong = async (roomId) => {
         console.log("Trigger Xóa phòng action for room ID:", roomId);
        if (!roomId) return;
        try {
            await xoaPhong(roomId);
            // Update the *main* list, filtering will adjust automatically
            setAllRooms(currentRooms => currentRooms.filter(room => room.MaPhong !== roomId));
        } catch (error) {
            console.error(`Lỗi khi xóa phòng ${roomId}:`, error);
            alert(`Lỗi xóa phòng: ${error.message || 'Vui lòng thử lại.'}`);
        }
     };
     const handleThemKhach = (roomId) => { /* ... keep implementation ... */ };

    // --- Render Logic ---
    if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Đang tải dữ liệu phòng...</div>;

    // If no house is selected (and we chose not to show all rooms)
    if (loaiTaiKhoan === "Chủ trọ" && !selectedHouseId && !loading) {
         return <div style={{ padding: "30px", textAlign: "center", color: '#777' }}>Vui lòng chọn một nhà trọ từ danh sách ở trên.</div>;
    }


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
                        <Button
                            label="Thêm phòng"
                            class_name="green-btn btn"
                            onClick={handleThemPhong}
                        />
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
        </div>
    );
};

export default Home;