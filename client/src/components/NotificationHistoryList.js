// src/components/NotificationHistoryList.js
import React, { useState } from 'react'; // Import useState

// Hàm helper để format ngày giờ (ví dụ)
const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Sử dụng toLocaleString cho cả ngày và giờ
        return date.toLocaleString('vi-VN', {
             day: '2-digit', month: '2-digit', year: 'numeric',
             hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return isoString;
    }
};

// --- Định nghĩa các style cho nội dung ---
const contentStyle = {
    margin: '8px 0 0 0', fontSize: '0.9rem', color: '#555',
    whiteSpace: 'pre-wrap', // Giữ các dấu xuống dòng
    wordBreak: 'break-word' // Ngắt từ dài
};
const fullContentStyle = { ...contentStyle, maxHeight: 'none', overflow: 'visible' }; // Hiển thị đầy đủ
const snippetContentStyle = { // Hiển thị rút gọn (khoảng 2-3 dòng)
    ...contentStyle,
    maxHeight: '3.6em', // Giới hạn chiều cao (tùy chỉnh nếu cần)
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2, // Số dòng tối đa hiển thị
    WebkitBoxOrient: 'vertical'
};
// --------------------------------------

const NotificationHistoryItem = ({ notification, isExpanded, onClick }) => { // Nhận thêm props
    // Không cần state riêng ở đây nữa
    const displayContent = notification.NoiDung; // Luôn lấy nội dung đầy đủ

    return (
        // Thêm onClick và cursor: pointer
        <div
            style={{
                background: 'white',
                padding: '15px 20px',
                marginBottom: '15px',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #6c757d', // Màu viền xám cho lịch sử
                cursor: 'pointer', // Thêm con trỏ chuột
                transition: 'background-color 0.2s ease',
            }}
            onClick={onClick} // Gọi hàm xử lý click từ component cha
            title="Nhấn để xem/ẩn chi tiết" // Thêm title
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>
                    Đến: {notification.RecipientName || 'Không rõ'}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {formatDateTime(notification.ThoiGian)}
                </span>
            </div>
            <h4 style={{ margin: '0 0 5px 0', color: '#111' }}>{notification.TieuDe}</h4>
            {/* Sử dụng isExpanded để chọn style hiển thị nội dung */}
            <p style={isExpanded ? fullContentStyle : snippetContentStyle}>
                {displayContent}
            </p>
        </div>
    );
};



const NotificationHistoryList = ({ notifications }) => {
    // === Thêm State để quản lý item đang được mở rộng ===
    const [expandedNotificationId, setExpandedNotificationId] = useState(null);
    // =====================================================

    // === Hàm xử lý khi nhấn vào một item ===
    const handleItemClick = (notificationId) => {
        setExpandedNotificationId(prevId => (prevId === notificationId ? null : notificationId));
    };
    // =======================================

    // Component cha (NotificationHistoryView) đã kiểm tra rỗng
    if (!notifications || notifications.length === 0) {
        return null;
    }

    return (
        <div>
            {notifications.map((notification) => {
                 // Xác định xem item hiện tại có đang được mở rộng không
                const isExpanded = expandedNotificationId === notification.MaThongBao;
                return (
                    <NotificationHistoryItem
                        key={notification.MaThongBao}
                        notification={notification}
                        isExpanded={isExpanded} // Truyền trạng thái mở rộng
                        onClick={() => handleItemClick(notification.MaThongBao)} // Truyền hàm xử lý click
                    />
                );
            })}
        </div>
    );
};

export default NotificationHistoryList;