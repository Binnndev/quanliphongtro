// src/pages/NotificationManagementPage.js
import React, { useState } from 'react';
import AnimatedSignature from '../components/AnimatedSignature';
import MainContainer from '../components/MainContainer'; // Sidebar Chủ trọ
import UserIcon from '../components/UserIcon';
import { useEffect } from 'react';
import SendNotificationForm from '../components/SendNotificationForm';
import NotificationHistoryView from '../components/NotificationHistoryView';
import ReceivedNotificationView from '../components/ReceivedNotificationView'; // Component mới

const NotificationManagementPage = () => {
    // --- Lấy User ID ---
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const loggedInUserId = localStorage.getItem("MaTK"); // Lấy từ localStorage
        // Hoặc: const loggedInUserId = currentUser?.MaTK; // Nếu dùng context
        if (loggedInUserId) {
            setUserId(parseInt(loggedInUserId, 10)); // Chuyển sang số nếu cần
        } else {
            console.error("Không tìm thấy MaTK người dùng!");
            // Có thể chuyển hướng về trang đăng nhập ở đây
        }
    }, []); // Chỉ chạy 1 lần khi component mount

    const [activeTab, setActiveTab] = useState('received'); // 'send' hoặc 'history'

    // --- Styles cho Tabs (Ví dụ) ---
    const tabButtonStyle = {
        padding: '10px 20px',
        fontSize: '1rem',
        cursor: 'pointer',
        border: 'none',
        borderBottom: '3px solid transparent', // Viền dưới mặc định trong suốt
        background: 'none',
        marginRight: '10px',
        color: '#666',
    };

    const activeTabButtonStyle = {
        ...tabButtonStyle,
        borderBottom: '3px solid #007bff', // Viền dưới cho tab active
        fontWeight: 'bold',
        color: '#007bff',
    };
    // --- Hết Styles ---

    // Không render gì nếu chưa có userId
    if (!userId) {
        return <div>Đang tải thông tin người dùng...</div>; // Hoặc spinner loading
    }

    return (
        <div style={{ display: "flex", height: '100vh', position: 'fixed', top:0, justifyContent: 'center', width: "100%", overflow: 'hidden' }}>
            {/* Sidebar */}
            

            {/* Right Content Area */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
                {/* Fixed Header */}
                <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>Quản Lý Thông Báo</p> {/* Tiêu đề chung */}
                    <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
                </div>

                {/* Scrollable Content Area */}
                <div style={{ paddingTop: '83px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}> {/* Thêm flex column */}
                    {/* Tab Navigation */}
                    <div style={{
                        background: 'white',
                        padding: '10px 20px 0 20px', // Bỏ padding bottom để viền chạm đáy
                        borderBottom: '1px solid #D2D2D2',
                        position: 'sticky', // Làm cho tab dính khi cuộn
                        top: '83px', // Dính ngay dưới header
                        zIndex: 9 // Thấp hơn header
                    }}>
                        <button
                            style={activeTab === 'received' ? activeTabButtonStyle : tabButtonStyle}
                            onClick={() => setActiveTab('received')}
                        >
                            Đã Nhận
                        </button>
                        <button
                            style={activeTab === 'send' ? activeTabButtonStyle : tabButtonStyle}
                            onClick={() => setActiveTab('send')}
                        >
                            Gửi Thông Báo
                        </button>
                        <button
                            style={activeTab === 'history' ? activeTabButtonStyle : tabButtonStyle}
                            onClick={() => setActiveTab('history')}
                        >
                            Lịch Sử Gửi
                        </button>
                    </div>

                    {/* Tab Content Area */}
                    <div style={{ flexGrow: 1, overflowY: 'auto', height: '0px', padding: '20px' }}> {/* Thêm padding cho nội dung tab */}
                        {activeTab === 'received' && (
                            <ReceivedNotificationView recipientId={userId} /> // <<== COMPONENT MỚI
                        )}
                        {activeTab === 'send' && (
                            <SendNotificationForm senderId={userId} />
                        )}
                        {activeTab === 'history' && (
                            // Truyền landlordId vào component con để nó tự fetch dữ liệu
                            <NotificationHistoryView senderId={userId} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationManagementPage;