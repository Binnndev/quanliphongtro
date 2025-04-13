// src/components/TenantSidebar.js (Ví dụ đơn giản)
import React from 'react';
// Nếu dùng React Router cho navigation nội bộ: import { Link } from 'react-router-dom';
// Hoặc dùng callback để báo cho trang cha thay đổi view:
// const TenantSidebar = ({ setActiveView }) => ( ... )

// Ví dụ dùng callback:
const TenantSidebar = ({ setActiveView, activeView }) => ( // Nhận thêm activeView để highlight
    <div style={{ padding: '20px' }}>
        {/* Ví dụ các mục khác */}
        <div
            style={getStyle(activeView === 'profile')}
            onClick={() => setActiveView ? setActiveView('profile') : null} // Gọi callback
        >
            Thông tin cá nhân
        </div>
        <div
            style={getStyle(activeView === 'notifications')}
            onClick={() => setActiveView ? setActiveView('notifications') : null}
        >
            Thông báo
        </div>
        {/* Mục mới để gửi yêu cầu */}
        <div
            style={getStyle(activeView === 'compose_message')}
            onClick={() => setActiveView ? setActiveView('compose_message') : null}
        >
            Gửi Yêu cầu/Phản hồi
        </div>
        <div
            style={getStyle(activeView === 'payment')}
            onClick={() => setActiveView ? setActiveView('payment') : null}
        >
            Thanh toán
        </div>
        {/* ... */}
    </div>
);

// Helper function cho style (ví dụ)
const getStyle = (isActive) => ({
    marginBottom: '10px',
    padding: '10px',
    background: isActive ? '#007bff' : '#2C3A40', // Highlight nếu active
    color: isActive ? 'white' : '#adb5bd',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
});

export default TenantSidebar;