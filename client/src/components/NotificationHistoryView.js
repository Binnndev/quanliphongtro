// src/components/NotificationHistoryView.js
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Thêm useRef
import axios from 'axios';
import NotificationHistoryList from './NotificationHistoryList';

const NotificationHistoryView = ({ senderId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // === State cho Pagination ===
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    // ============================

    // === State cho Tìm kiếm ===
    const [searchTerm, setSearchTerm] = useState(''); // Lưu giá trị input ngay lập tức
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Giá trị sau khi người dùng ngừng gõ
    const debounceTimeoutRef = useRef(null); // Để lưu timeout ID
    // =========================

    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");

    // --- Fetch Notifications (Thêm tham số search) ---
    const fetchHistory = useCallback(async (userId, page, pageSize, search) => {
        if (!userId) return;

        // Clear error cũ khi fetch mới
        setError('');
        setIsLoading(true);
        console.log(`Workspaceing history for User ID: ${userId}, Page: ${page}, Limit: ${pageSize}, Search: "${search}"`);

        try {
            const response = await axios.get(`/api/notifications/sent/${userId}`, {
                params: {
                    page: page,
                    limit: pageSize,
                    search: search || undefined, // Chỉ gửi nếu có giá trị search
                    loaiTaiKhoan: loaiTaiKhoan // Gửi loại tài khoản nếu cần
                }
            });

            if (response.data && Array.isArray(response.data.data) && response.data.pagination) {
                setNotifications(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                // Không cần setCurrentPage ở đây vì nó là dependency của useEffect gọi hàm này
                console.log(`Workspaceed: ${response.data.data.length} items, Page ${response.data.pagination.currentPage}/${response.data.pagination.totalPages}`);
            } else {
                 console.warn("API response structure invalid or no data.", response.data);
                setNotifications([]); setTotalPages(1);
                // Nếu là trang 1 thì không cần reset, nếu không phải thì reset về 1 khi không có data? -> Backend nên xử lý trả về trang cuối cùng có data nếu page > totalPages
            }
        } catch (err) {
            console.error("Error fetching notification history:", err);
            setError(err.response?.data?.message || "Lỗi tải lịch sử thông báo.");
            setNotifications([]); setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    // Chỉ phụ thuộc userId, không nên thêm page, pageSize, search vào đây
    }, []);


    // --- Effect cho Debouncing Search Term ---
    useEffect(() => {
        // Clear timeout cũ nếu có
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Thiết lập timeout mới
        debounceTimeoutRef.current = setTimeout(() => {
            // Chỉ cập nhật debouncedSearchTerm nếu khác giá trị hiện tại
            // và reset về trang 1 khi search term thay đổi
            if (searchTerm !== debouncedSearchTerm) {
                 console.log(`Debounced Search Term Updated: "${searchTerm}"`);
                 setDebouncedSearchTerm(searchTerm);
                 setCurrentPage(1); // QUAN TRỌNG: Reset về trang 1 khi tìm kiếm mới
            }
        }, 500); // Chờ 500ms sau khi người dùng ngừng gõ

        // Cleanup timeout khi component unmount hoặc searchTerm thay đổi
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    // Chỉ phụ thuộc vào searchTerm để trigger debounce
    }, [searchTerm, debouncedSearchTerm]); // Thêm debouncedSearchTerm để kiểm tra tránh cập nhật dư thừa


    // --- Effect chính để Fetch Data ---
    // Chạy khi landlordId, currentPage, limit, hoặc debouncedSearchTerm thay đổi
    useEffect(() => {
        if (senderId) {
            fetchHistory(senderId, currentPage, limit, debouncedSearchTerm);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [senderId, currentPage, limit, debouncedSearchTerm, fetchHistory]); // Thêm debouncedSearchTerm

    // === HÀM ĐIỀU HƯỚNG TRANG (Giữ nguyên) ===
    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };
    const goToPreviousPage = () => { goToPage(currentPage - 1); };
    const goToNextPage = () => { goToPage(currentPage + 1); };
    // ============================

    // --- Handler cho ô tìm kiếm ---
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    // ============================


    return (
        <div>
            {/* === Ô Tìm Kiếm === */}
            <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                <input
                    type="search"
                    placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem'
                    }}
                />
            </div>
            {/* ================= */}

            {/* Hiển thị Loading / Error / List / No Results */}
            {isLoading && <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '30px' }}>Đang tải và tìm kiếm...</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '30px' }}>{error}</p>}

            {!isLoading && !error && notifications.length === 0 && (
                 <p style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>
                    {debouncedSearchTerm ? `Không tìm thấy thông báo nào khớp với "${debouncedSearchTerm}".` : 'Chưa có thông báo nào được gửi.'}
                 </p>
            )}

            {!isLoading && !error && notifications.length > 0 && (
                <>
                    <NotificationHistoryList notifications={notifications} />

                    {/* === KHỐI PHÂN TRANG (Giữ nguyên) === */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', paddingBottom: '10px', gap: '10px' }}>
                            <button className='grey-btn btn btn-sm' onClick={goToPreviousPage} disabled={currentPage === 1 || isLoading}>&laquo; Trước</button>
                            <span style={{ margin: '0 10px', fontSize: '0.9rem', fontWeight:'500' }}>
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button className='grey-btn btn btn-sm' onClick={goToNextPage} disabled={currentPage === totalPages || isLoading}>Sau &raquo;</button>
                        </div>
                    )}
                    {/* ======================= */}
                </>
            )}
        </div>
    );
};

export default NotificationHistoryView;