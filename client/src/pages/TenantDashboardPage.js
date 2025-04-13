// src/pages/TenantDashboardPage.js
import React, { useState, useEffect } from "react";
import axios from 'axios'; // Cần axios để fetch MaTK chủ trọ
import AnimatedSignature from "../components/AnimatedSignature";
import TenantSidebar from "../components/TenantSidebar"; // Sidebar mới hoặc đã sửa
import UserIcon from "../components/UserIcon";
// import { useNavigate } from "react-router-dom"; // Nếu dùng router
import TenantNotificationList from "../components/TenantNotificationList";
import TenantComposeMessage from "../components/TenantComposeMessage"; // Component soạn thảo mới

const TenantDashboardPage = () => {
    // const navigate = useNavigate();
    const [activeView, setActiveView] = useState('notifications'); // Mặc định xem thông báo

    // === Lấy ID Khách Thuê và Chủ Trọ ===
    // const { currentUser } = useAuth();
    const tenantId = 3; // <<<< THAY BẰNG MaTK KHÁCH THUÊ THỰC TẾ >>>>

    const [landlordInfo, setLandlordInfo] = useState({ MaTK: null, TenDangNhap: null });
    const [landlordFetchError, setLandlordFetchError] = useState('');
    const [isFetchingLandlord, setIsFetchingLandlord] = useState(false);
    // ====================================

    // --- Fetch MaTK chủ trọ khi component mount ---
    useEffect(() => {
        const fetchLandlordAccount = async () => {
            if (!tenantId) return;
            setIsFetchingLandlord(true);
            setLandlordFetchError('');
            try {
                // Gọi API mới đã tạo ở backend
                const response = await axios.get(`/api/tenants/${tenantId}/landlord-account`);
                if (response.data && response.data.MaTK) {
                    setLandlordInfo({
                        MaTK: response.data.MaTK,
                        TenDangNhap: response.data.TenDangNhap
                    });
                    console.log("Lấy MaTK chủ trọ thành công:", response.data);
                } else {
                   setLandlordFetchError("Không tìm thấy thông tin chủ trọ liên kết.");
                }
            } catch (err) {
                console.error("Lỗi khi fetch MaTK chủ trọ:", err);
                setLandlordFetchError(err.response?.data?.message || "Lỗi tải thông tin chủ trọ.");
            } finally {
                setIsFetchingLandlord(false);
            }
        };
        fetchLandlordAccount();
    }, [tenantId]); // Chỉ chạy lại nếu tenantId thay đổi
    // ---------------------------------------------

    // --- Hàm để thay đổi view ---
    const handleSetView = (viewName) => {
        setActiveView(viewName);
    };
    // ----------------------------

    const getPageTitle = () => {
         switch(activeView) {
             case 'notifications': return 'Thông Báo Của Bạn';
             case 'compose_message': return 'Gửi Yêu Cầu / Phản Hồi';
             case 'profile': return 'Thông Tin Cá Nhân';
             case 'payment': return 'Thanh Toán Hóa Đơn';
             default: return 'Trang Khách Thuê';
         }
    }

    return (
        <div style={{ display: "flex", height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ background: '#1B2428', width: "20%", minWidth: '250px', color: 'white', display: 'flex', flexDirection: 'column' }}>
                {/* ... Header Sidebar ... */}
                 <div style={{ height: 84, /*...*/ justifyContent: 'center' }}>
                    <AnimatedSignature text="TRANG KHÁCH THUÊ" />
                 </div>
                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {/* Truyền hàm setActiveView và activeView xuống Sidebar */}
                    <TenantSidebar setActiveView={handleSetView} activeView={activeView} />
                </div>
            </div>

            {/* Right Content Area */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
                {/* Fixed Header */}
                <div style={{ height: 83, /*...*/ justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>
                        {getPageTitle()} {/* Tiêu đề động */}
                    </p>
                    <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
                </div>

                {/* Scrollable Content Area */}
                <div style={{ paddingTop: '90px', flexGrow: 1, overflowY: 'auto', padding: '20px' }}> {/* Thêm padding chung */}
                    {/* Render nội dung dựa trên activeView */}
                    {activeView === 'notifications' && <TenantNotificationList />}
                    {activeView === 'compose_message' && (
                        isFetchingLandlord ? <p>Đang tải thông tin người nhận...</p> : (
                            landlordFetchError ? <p style={{color: 'red'}}>Lỗi: {landlordFetchError}</p> : (
                                landlordInfo.MaTK ?
                                <TenantComposeMessage tenantId={tenantId} landlordMaTK={landlordInfo.MaTK} />
                                : <p style={{color: 'red'}}>Không thể gửi yêu cầu do thiếu thông tin chủ trọ.</p>
                            )
                        )
                    )}
                    {/* Thêm các view khác nếu cần */}
                    {/* {activeView === 'profile' && <TenantProfile />} */}
                </div>
            </div>
        </div>
    );
};

export default TenantDashboardPage;