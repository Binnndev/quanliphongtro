// src/components/TenantDashboard.js
import React, { useState, useEffect } from 'react';
import UserIcon from './UserIcon'; // Icon người dùng
import { getTenantRoom } from '../services/phongService'; // Giả lập API lấy thông tin phòng
import { FaRegMoneyBillAlt, FaRegBell, FaBolt, FaTint, FaFileContract, FaHistory, FaListAlt } from 'react-icons/fa'; // Chọn icon phù hợp

// ... (Các service và styles không dùng nữa có thể bỏ đi)

const TenantDashboard = ({ onSelectPage }) => {
    const [roomInfo, setRoomInfo] = useState(null);
    const [billingSummary, setBillingSummary] = useState(null);
    const [notifications, setNotifications] = useState({ unreadCount: 0, latest: [] });
    const [contractInfo, setContractInfo] = useState(null);
    // State cho Điện Nước (ví dụ lấy từ API hoặc tính toán)
    const [utilityInfo, setUtilityInfo] = useState({
        lastReadingDate: 'Chưa có',
        dienDauKy: 'N/A',
        dienCuoiKy: null, // null nghĩa là chưa cập nhật
        dienThangTruoc: 'N/A',
        nuocDauKy: 'N/A',
        nuocCuoiKy: null,
        nuocThangTruoc: 'N/A'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tenantName = localStorage.getItem("ten") || "Khách thuê";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // // --- GỌI API THỰC TẾ Ở ĐÂY ---
                // // Giả lập dữ liệu mẫu phong phú hơn
                // await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ mạng

                // const roomData = { TenPhong: 'P101', GiaThue: 5000000 };
                const billingData = { nextDueDate: '30/04/2025', estimatedAmount: 5550000, overdue: false };
                const notificationData = { unreadCount: 2, latest: [{ id: 1, title: 'Thông báo bảo trì thang máy T4' }, { id: 2, title: 'Lịch phun thuốc muỗi định kỳ' }] };
                const contractData = { startDate: '01/01/2025', endDate: '31/12/2025', deposit: 5000000 };
                const utilityData = { // Dữ liệu này cần lấy từ API
                     lastReadingDate: '31/03/2025',
                     dienDauKy: 1290,
                     dienCuoiKy: null, // Kỳ này chưa có chỉ số cuối
                     dienThangTruoc: 51, // Số kWh tháng trước
                     nuocDauKy: 845,
                     nuocCuoiKy: null,
                     nuocThangTruoc: 24 // Số m3 tháng trước
                 };
         
                const roomData = await getTenantRoom();
                if (!roomData) {
                    throw new Error("Không tìm thấy thông tin phòng.");
                }

                setRoomInfo(roomData);
                localStorage.setItem("roomId", roomData[0].MaPhong); // Lưu mã phòng vào localStorage
                
                setBillingSummary(billingData);
                setNotifications(notificationData);
                setContractInfo(contractData);
                setUtilityInfo(utilityData);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu dashboard khách thuê:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Giao diện Loading và Error ---
    if (loading) return (
        <div className="dashboard-loading">
            {/* Có thể thêm spinner ở đây */}
            <p>Đang tải thông tin...</p>
        </div>
    );
    if (error) return <div className="dashboard-error">{error}</div>;

    // --- Giao diện Dashboard chính ---
    return (
        <div style={{ display: "flex", height: '100vh', position: 'fixed', top:0, justifyContent: 'center', width: "100%", overflow: 'hidden' }}>
            {/* Sidebar */}
            

            {/* Right Content Area */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
                {/* Fixed Header */}
                <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>Trang chủ</p> {/* Tiêu đề chung */}
                    <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
                </div>
        <div className="tenant-dashboard"> {/* <<< Class container chính */}
            <p className="dashboard-subheader">
                Đây là trang tổng quan cho phòng <strong >{roomInfo?.[0].TenPhong || 'của bạn'}</strong>.
            </p>

            {/* --- Các Khối Thông Tin --- */}

            {/* Khối Thanh Toán */}
            <div className="dashboard-card"> {/* <<< Class card */}
                <h3><FaRegMoneyBillAlt /> Thanh Toán Kỳ Tới</h3> {/* <<< Thêm Icon */}
                {billingSummary ? (
                    <>
                        <p>Ngày đến hạn: <strong>{billingSummary.nextDueDate}</strong></p>
                        <p>Số tiền (dự kiến): <strong>{billingSummary.estimatedAmount?.toLocaleString()} đ</strong></p>
                        {billingSummary.overdue && <p className="highlight-overdue">Có hóa đơn quá hạn!</p>} {/* <<< Class highlight */}
                        <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
                             *(Ước tính dựa trên tiền phòng, dịch vụ cố định và điện/nước tháng trước)*
                         </p>
                        <button className="dashboard-button primary" onClick={() => onSelectPage('tinhTien')}> {/* <<< Class button */}
                            <FaListAlt /> Xem Hóa Đơn
                        </button>
                    </>
                ) : <p>Chưa có thông tin thanh toán.</p>}
            </div>

            {/* Khối Thông Báo */}
            <div className="dashboard-card">
                <h3><FaRegBell /> Thông Báo</h3>
                {notifications.unreadCount > 0 ? (
                     <p>Bạn có <strong className="highlight-unread">{notifications.unreadCount}</strong> thông báo mới chưa đọc.</p> /* <<< Class highlight */
                ) : (
                     <p>Không có thông báo mới.</p>
                )}
                {notifications.latest.slice(0, 1).map(noti => (
                     <p key={noti.id} className="latest-notification">Mới nhất: {noti.title}</p> /* <<< Class */
                ))}
                <button className="dashboard-button primary" onClick={() => onSelectPage('thongbao')}>
                    Xem Tất Cả
                 </button>
            </div>

             {/* Khối Điện Nước */}
             <div className="dashboard-card">
                <h3><FaBolt /><FaTint style={{marginLeft: '-5px'}}/> Điện & Nước</h3>
                <p style={{fontSize: '0.9em', color: '#6c757d', marginBottom: '15px'}}>Cập nhật đến ngày: {utilityInfo.lastReadingDate}</p>
                <div className="utility-details">
                        <div style={{ marginBottom: '15px' }}>
                    <strong>Điện:</strong><br/>
                     <span style={{fontSize: '0.9em'}}> - Đầu kỳ: {utilityInfo.dienDauKy}</span><br/>
                     <span style={{fontSize: '0.9em'}}> - Cuối kỳ: {utilityInfo.dienCuoiKy === null ? <i>(Chờ cập nhật)</i> : utilityInfo.dienCuoiKy}</span><br/>
                     <span style={{fontSize: '0.9em'}}> - Tháng trước dùng: <strong>{utilityInfo.dienThangTruoc} kWh</strong></span>
                </div>
                 <div>
                    <strong>Nước:</strong><br/>
                    <span style={{fontSize: '0.9em'}}> - Đầu kỳ: {utilityInfo.nuocDauKy}</span><br/>
                    <span style={{fontSize: '0.9em'}}> - Cuối kỳ: {utilityInfo.nuocCuoiKy === null ? <i>(Chờ cập nhật)</i> : utilityInfo.nuocCuoiKy}</span><br/>
                    <span style={{fontSize: '0.9em'}}> - Tháng trước dùng: <strong>{utilityInfo.nuocThangTruoc} m³</strong></span>
                            </div>
                            </div>
                <div className="utility-buttons"> {/* <<< Group nút */}
                    <button className="dashboard-button secondary" onClick={() => onSelectPage('dien')}>
                         <FaHistory /> Lịch Sử Điện
                     </button>
                    <button className="dashboard-button info" onClick={() => onSelectPage('nuoc')}>
                         <FaHistory /> Lịch Sử Nước
                    </button>
                </div>
            </div>

            {/* Khối Hợp Đồng */}
             <div className="dashboard-card">
                 <h3><FaFileContract /> Hợp Đồng Thuê Nhà</h3>
                 {contractInfo ? (
                    <>
                         <p>Hiệu lực: <strong>{contractInfo.startDate} - {contractInfo.endDate}</strong></p>
                         <p>Tiền cọc: <strong>{contractInfo.deposit?.toLocaleString()} đ</strong></p>
                         {/* Thêm nút xem chi tiết hoặc tải hợp đồng nếu có */}
                         {/* <button className="dashboard-button secondary" onClick={() => onSelectPage('hopDong')}>Xem Chi Tiết</button> */}
                     </>
                 ) : <p>Chưa có thông tin hợp đồng.</p>}
             </div>

             {/* Thêm các khối khác nếu cần */}
             {/* Ví dụ: Khối liên hệ */}
             {/* <div className="dashboard-card"> ... </div> */}

                </div>
            </div>
        </div>

    );
};

export default TenantDashboard;