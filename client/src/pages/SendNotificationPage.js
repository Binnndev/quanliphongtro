import React from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer"; // Sidebar cho chủ trọ
import Button from "../components/Button";
import UserIcon from "../components/UserIcon";
import { useNavigate } from "react-router-dom";
import SendNotificationForm from "../components/SendNotificationForm"; // Import form

const SendNotificationPage = () => {
    const navigate = useNavigate();
    // const { currentUser } = useAuth(); // Ví dụ lấy user

    // if (!currentUser || currentUser.role !== 'landlord') { // Ví dụ kiểm tra quyền
    //     navigate('/login'); // Hoặc trang không có quyền
    //     return null;
    // }
    // const senderId = currentUser.id;

    return (
        <div style={{ display: "flex", height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar (Dùng MainContainer của Chủ trọ) */}
             <div style={{ background: '#1B2428', width: "20%", minWidth: '250px', color: 'white', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: 84, background: '#1B2428', borderBottom: '1px #21373D solid', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
                     <AnimatedSignature text="QUẢN LÝ PHÒNG TRỌ" />
                 </div>
                 <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                      {/* MainContainer cần được cập nhật để có link "Gửi thông báo" */}
                      <MainContainer />
                 </div>
                 <div style={{ padding: '15px', borderTop: '1px solid #21373D' }}> <input type="search" placeholder="Search" style={{ /*...*/ }} /> </div>
             </div>

            {/* Right Content Area */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
                {/* Fixed Header */}
                 <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                     <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>Gửi Thông Báo</p> {/* Đổi tiêu đề */}
                     <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
                 </div>

                 {/* Không có Tabs ở đây */}

                 {/* Scrollable Content Area */}
                 {/* Chỉ cần padding top cho header */}
                 <div style={{ paddingTop: '90px', flexGrow: 1, overflowY: 'auto' }}>
                     <SendNotificationForm /> {/* Render form gửi thông báo */}
                 </div>
            </div>
        </div>
    );
};

export default SendNotificationPage;