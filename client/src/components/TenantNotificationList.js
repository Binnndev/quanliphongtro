import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Import axios
// import { useAuth } from './AuthContext'; // Ví dụ

const TenantNotificationList = () => {
    // const { currentUser } = useAuth(); // Ví dụ lấy user khách thuê
    // Giả lập ID khách thuê - THAY BẰNG ID THỰC TẾ
    const tenantId = 3; // ID của khách thuê đang đăng nhập

    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedNotificationId, setExpandedNotificationId] = useState(null); // State for expansion
    const [isMarkingAll, setIsMarkingAll] = useState(false); // Loading for Mark All
    // === State cho Pagination ===
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10); // Số item mỗi trang (có thể làm state nếu muốn đổi)
    // ============================

    // --- Helper Functions (Optional: move to utils) ---
    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    // --- Fetch Notifications với Pagination ---
    // Dùng useCallback để tránh tạo lại hàm fetch trừ khi dependency thay đổi (hiếm)
    const fetchTenantNotifications = useCallback(async (userId, page, pageSize) => {
        if (!userId) { setError("Lỗi: Không xác định được người dùng."); setIsLoading(false); return; }
        console.log(`Workspaceing notifications for User ID (MaTK): ${userId}, Page: ${page}, Limit: ${pageSize}`);
        setIsLoading(true); setError('');
        try {
            const response = await axios.get(`/api/notifications/user/${userId}`, {
                params: { // Gửi params cho backend
                    page: page,
                    limit: pageSize
                    // read: filterRead // Thêm filter nếu có
                }
            });

            // Kiểm tra cấu trúc response từ backend
            if (response.data && Array.isArray(response.data.data) && response.data.pagination) {
                setNotifications(response.data.data.map(n => ({ ...n, id: n.MaThongBao }))); // Gán id nếu cần
                setTotalPages(response.data.pagination.totalPages); // Cập nhật tổng số trang
                // setCurrentPage(response.data.pagination.currentPage); // Cập nhật trang hiện tại (thường khớp với page gửi đi)
                console.log(`Tải thông báo thành công: ${response.data.data.length} items, Trang ${response.data.pagination.currentPage}/${response.data.pagination.totalPages}`);
            } else {
                console.warn("API response không đúng cấu trúc hoặc không có dữ liệu.", response.data);
                setNotifications([]); setTotalPages(1); setCurrentPage(1); // Reset về trang 1
            }
        } catch (err) {
            console.error("Lỗi lấy thông báo:", err);
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách thông báo.');
            setNotifications([]); setTotalPages(1); setCurrentPage(1); // Reset về trang 1
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback không có dependency nội bộ thay đổi thường xuyên


     // --- Effect để Fetch Data khi trang hoặc limit thay đổi ---
     useEffect(() => {
        if (tenantId) {
            fetchTenantNotifications(tenantId, currentPage, limit); // Gọi fetch với trang hiện tại
        }
        setExpandedNotificationId(null); // Đóng các mục đang mở rộng khi chuyển trang
    }, [tenantId, currentPage, limit, fetchTenantNotifications]); // Thêm currentPage, limit, fetchTenantNotifications

    // --- Mark single notification as read ---
    const markNotificationAsReadAPI = async (notificationId) => {
        // No need for tenantId check here if backend auth relies on logged-in user
        console.log(`Marking notification ${notificationId} as read (API call)...`);
        try {
            await axios.patch(`/api/notifications/${notificationId}/read`);
            console.log(`Marked ${notificationId} as read successfully.`);
            return true;
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
            alert(`Lỗi: ${error.response?.data?.message || 'Không thể đánh dấu đã đọc.'}`);
            return false;
        }
    }


    // --- Handle Click on Notification Item ---
    const handleNotificationClick = async (notificationId) => {
        const targetIndex = notifications.findIndex(n => n.MaThongBao === notificationId);
        if (targetIndex === -1) return;

        const targetNotification = notifications[targetIndex];

        // Toggle expansion
        setExpandedNotificationId(prevId => (prevId === notificationId ? null : notificationId));
        console.log(`Clicked notification ID: ${notificationId}, Expanded: ${expandedNotificationId}`);

        // Mark as read API call ONLY if it's currently unread
        if (!targetNotification.DaDoc) {
            const success = await markNotificationAsReadAPI(notificationId);
            if (success) {
                // Update local state immediately for better UX
                setNotifications(prevNotifications => {
                     const newNotifications = [...prevNotifications];
                     newNotifications[targetIndex] = { ...newNotifications[targetIndex], DaDoc: true };
                     return newNotifications;
                 });
            }
            // If API fails, alert is shown in API function, UI won't update DaDoc visually
        }
    };

    // --- Handle Mark All As Read ---
    const handleMarkAllRead = async () => {
        if (!tenantId) return;
        const unreadNotifications = notifications.filter(n => !n.DaDoc);
        if (unreadNotifications.length === 0) {
            alert("Không có thông báo mới nào để đánh dấu.");
            return;
        }

        setIsMarkingAll(true);
        console.log(`Marking all as read for user ${tenantId}...`);
        try {
            // Call backend API
            const response = await axios.patch(`/api/notifications/user/${tenantId}/read-all`);
            console.log("Mark all as read response:", response.data);
            // Update local state to reflect the change immediately
            setNotifications(prev => prev.map(n => ({ ...n, DaDoc: true })));
            alert(response.data.message || `Đã đánh dấu ${unreadNotifications.length} thông báo là đã đọc.`);
        } catch (error) {
            console.error(`Error marking all as read for user ${tenantId}:`, error);
            alert(`Lỗi: ${error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc.'}`);
        } finally {
            setIsMarkingAll(false);
        }
    };

    // === HÀM ĐIỀU HƯỚNG TRANG ===
    const goToPage = (pageNumber) => {
        // Chỉ chuyển trang nếu trang mới hợp lệ và khác trang hiện tại
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    const goToPreviousPage = () => {
        goToPage(currentPage - 1);
    };

    const goToNextPage = () => {
        goToPage(currentPage + 1);
    };
    // ============================

    // --- Styles ---
    const notificationListStyle = { padding: '20px' };
    const notificationItemStyle = {
        background: 'white',
         padding: '15px 20px',
        marginBottom: '10px',
         borderRadius: '6px',
         boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
         cursor: 'pointer',
         borderLeft: '5px solid transparent', // Border cho trạng thái đọc/chưa đọc
        transition: 'background-color 0.2s ease',
        };
    const unreadStyle = { borderLeftColor: '#007bff', fontWeight: 'bold' };
    const timeStyle = { fontSize: '0.8rem', color: '#888', marginTop: '8px', display: 'block' };
     const contentStyle = {
         margin: '8px 0 0 0', fontSize: '0.9rem', color: '#555',
         whiteSpace: 'pre-wrap', // Preserve line breaks in content
         wordBreak: 'break-word' // Break long words
     };
      const fullContentStyle = { ...contentStyle, maxHeight: 'none', overflow: 'visible' };
      const snippetContentStyle = {
          ...contentStyle,
          maxHeight: '3.6em', // Limit height to roughly 2 lines
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
      };
     const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };


    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải thông báo...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    const unreadCount = notifications.filter(n => !n.DaDoc).length;

    return (
        <div style={notificationListStyle}>
            <div style={headerStyle}>
                 <h3 style={{ margin: 0, fontWeight: 'bold' }}>Danh sách thông báo {unreadCount > 0 ? `(${unreadCount} mới)` : ''}</h3>
                 {/* Mark All Read Button */}
                 {notifications.length > 0 && unreadCount > 0 && (
                    <button className="grey-btn btn btn-sm" onClick={handleMarkAllRead} disabled={isMarkingAll}>
                        Đánh dấu tất cả là đã đọc
                    </button>
                     
                 )}
            </div>

            {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>Bạn chưa có thông báo nào.</p>
            ) : (
                <div>
                    {notifications.map(noti => {
                        const isExpanded = expandedNotificationId === noti.MaThongBao;
                        return (
                            <div
                                key={noti.MaThongBao}
                                style={{ ...notificationItemStyle, ...(noti.DaDoc ? {} : unreadStyle) }}
                                onClick={() => handleNotificationClick(noti.MaThongBao)}
                                title={noti.DaDoc ? 'Nhấn để xem lại' : 'Nhấn để xem và đánh dấu đã đọc'}
                            >
                                <h5 style={{ margin: '0 0 5px 0', fontSize:'1.1rem', ...(noti.DaDoc ? {fontWeight: 'normal'} : {}) }}>
                                    {noti.TieuDe}
                                </h5>

                                {/* Display snippet or full content based on expansion */}
                                <p style={isExpanded ? fullContentStyle : snippetContentStyle}>
                                    {noti.NoiDung}
                                </p>

                                <span style={timeStyle}>
                                    {/* Access Sender Name via SenderAccount alias */}
                                    {formatDateTime(noti.ThoiGian)}
                                </span>
                            </div>
                        );
                    })}
                    {/* Pagination Controls if implemented */}
                </div>
            )}

            {/* === KHỐI PHÂN TRANG === */}
            {!isLoading && totalPages > 1 && ( // Chỉ hiện khi có nhiều hơn 1 trang và không loading
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', paddingBottom: '10px', gap: '10px' /* Thêm gap */}}>
                    
                    <button className='grey-btn btn btn-sm' onClick={goToPreviousPage} isabled={currentPage === 1 || isLoading}>&laquo; Trước</button>
                    <span style={{ margin: '0 10px', fontSize: '0.9rem', fontWeight:'500' }}>
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button className='grey-btn btn btn-sm' onClick={goToNextPage} isabled={currentPage === totalPages || isLoading}>Sau &raquo;</button>
                    {/* (Tùy chọn) Hiển thị các nút số trang nếu cần */}
                </div>
            )}
            {/* ======================= */}
        </div>
    );
};

export default TenantNotificationList;