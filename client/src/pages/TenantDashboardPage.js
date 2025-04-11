import React, { useState } from "react"; // Thêm useState nếu cần quản lý view khác
import AnimatedSignature from "../components/AnimatedSignature";
// import TenantSidebar from "../components/TenantSidebar"; // Component Sidebar riêng cho khách thuê
import UserIcon from "../components/UserIcon";
import { useNavigate } from "react-router-dom";
import TenantNotificationList from "../components/TenantNotificationList";

// Giả lập Sidebar cho Khách thuê
const TenantSidebar = () => (
    <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '10px', padding: '10px', background: '#2C3A40', borderRadius: '4px' }}>Thông tin cá nhân</div>
        <div style={{ marginBottom: '10px', padding: '10px', background: '#007bff', borderRadius: '4px', color: 'white' }}>Thông báo</div> {/* Active link */}
        <div style={{ marginBottom: '10px', padding: '10px', background: '#2C3A40', borderRadius: '4px' }}>Thanh toán</div>
        <div style={{ marginBottom: '10px', padding: '10px', background: '#2C3A40', borderRadius: '4px' }}>Hợp đồng</div>
        {/* Thêm các link khác */}
    </div>
);


const TenantDashboardPage = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('notifications'); // Ví dụ: mặc định xem thông báo

    // Giả sử đây là trang của khách thuê đã đăng nhập

    return (
        <div style={{ display: "flex", height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar (Dùng component Sidebar của Khách thuê) */}
             <div style={{ background: '#1B2428', width: "20%", minWidth: '250px', color: 'white', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: 84, background: '#1B2428', borderBottom: '1px #21373D solid', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
                      {/* Có thể hiển thị logo hoặc tên ứng dụng */}
                       <AnimatedSignature text="TRANG KHÁCH THUÊ" />
                 </div>
                 <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                     <TenantSidebar /> {/* Component chứa các link nav của khách thuê */}
                 </div>
                 {/* Có thể không cần search ở đây */}
             </div>

            {/* Right Content Area */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
                {/* Fixed Header */}
                 <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                      {/* Xác định tiêu đề dựa trên activeView */}
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>
                           {activeView === 'notifications' ? 'Thông Báo Của Bạn' : 'Tiêu đề khác'}
                      </p>
                      <div style={{ marginRight: '20px' }}> <UserIcon /> </div> {/* Icon người dùng thuê */}
                 </div>

                 {/* Không có Tabs ở đây */}

                 {/* Scrollable Content Area */}
                  <div style={{ paddingTop: '90px', flexGrow: 1, overflowY: 'auto' }}>
                      {/* Render nội dung dựa trên activeView */}
                       {activeView === 'notifications' && <TenantNotificationList />}
                       {/* {activeView === 'profile' && <TenantProfile />} */}
                       {/* {activeView === 'payment' && <TenantPayment />} */}
                  </div>
            </div>
        </div>
    );
};

export default TenantDashboardPage;