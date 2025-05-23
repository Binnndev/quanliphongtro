// src/components/ReceivedNotificationView.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns'; // Thư viện định dạng thời gian
import vi from 'date-fns/locale/vi'; // Tiếng Việt cho date-fns
import { getNhaTroByChuTro, getDsPhongByNhaTro } from '../services/phongService';

// Component này nhận recipientId (là userId của người đang đăng nhập)
const ReceivedNotificationView = ({ recipientId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Bắt đầu với trạng thái loading
    const [error, setError] = useState('');
    const [expandedNotificationId, setExpandedNotificationId] = useState(null);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    // State cho Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    // State cho Tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const debounceTimeoutRef = useRef(null);

    const [houses, setHouses] = useState([]); // Danh sách nhà trọ
    const [roomsInSelectedHouse, setRoomsInSelectedHouse] = useState([]); // Danh sách phòng trong nhà đã chọn
    const [selectedHouseId, setSelectedHouseId] = useState(''); // ID nhà trọ đang lọc (' ' = tất cả)
    const [selectedRoomId, setSelectedRoomId] = useState('');   // ID phòng đang lọc (' ' = tất cả)
    const [loadingHouses, setLoadingHouses] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);

    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const isLandlordRecipient = loaiTaiKhoan === 'Chủ trọ';

    // --- Helper Functions ---
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

    // --- Fetch Houses (Chỉ chạy cho Chủ trọ) ---
    useEffect(() => {
        const fetchHousesForLandlord = async () => {
            // Chỉ fetch nếu người xem là chủ trọ và có recipientId (MaTK của chủ trọ)
            if (isLandlordRecipient && recipientId) {
                setLoadingHouses(true);
                try {
                    // Sử dụng recipientId như là MaTK của chủ trọ để lấy nhà
                    const fetchedHouses = await getNhaTroByChuTro(recipientId);
                    setHouses(fetchedHouses || []);
                    console.log("Fetched houses for landlord:", fetchedHouses);
                } catch (err) {
                    console.error("Lỗi khi tải danh sách nhà trọ:", err);
                    setHouses([]);
                } finally {
                    setLoadingHouses(false);
                }
            } else {
                setHouses([]); // Reset nếu không phải chủ trọ
            }
        };
        fetchHousesForLandlord();
    }, [recipientId, isLandlordRecipient]);

    // --- Fetch Rooms khi Nhà trọ được chọn (Chỉ chạy cho Chủ trọ) ---
    useEffect(() => {
        const fetchRoomsForHouse = async () => {
            // Chỉ fetch khi là chủ trọ VÀ đã chọn một nhà cụ thể (selectedHouseId có giá trị)
            if (isLandlordRecipient && selectedHouseId) {
                setLoadingRooms(true);
                setRoomsInSelectedHouse([]); // Xóa danh sách phòng cũ
                try {
                    console.log(`Workspaceing rooms for house ID: ${selectedHouseId}`);
                    // Gọi API lấy danh sách phòng theo MaNhaTro
                    const fetchedRooms = await getDsPhongByNhaTro(selectedHouseId);
                    setRoomsInSelectedHouse(fetchedRooms || []);
                    console.log("Fetched rooms:", fetchedRooms);
                } catch (err) {
                    console.error(`Lỗi khi tải phòng cho nhà ${selectedHouseId}:`, err);
                    setRoomsInSelectedHouse([]);
                } finally {
                    setLoadingRooms(false);
                }
            } else {
                setRoomsInSelectedHouse([]); // Xóa danh sách phòng nếu chọn "Tất cả nhà trọ"
            }
        };
        fetchRoomsForHouse();
    }, [selectedHouseId, isLandlordRecipient]);

    // --- Fetch Received Notifications (Đã sửa API endpoint) ---
    // Sử dụng useCallback tương tự như code gốc bạn cung cấp
    const fetchReceivedNotifications = useCallback(async (userId, page, pageSize, search, houseFilterId, roomFilterId) => {
        if (!userId) { setError("Lỗi: Không xác định được người nhận."); setIsLoading(false); return; }
        console.log(`Workspaceing RECEIVED notifications for User ID (MaTK): ${userId}, Page: ${page}, Limit: ${pageSize}, Search: "${search}"`);
        setIsLoading(true); setError('');
        try {
            const response = await axios.get(`/api/notifications/user/${userId}`, { // Gọi API lấy thông báo đã nhận
                params: {
                    page: page,
                    limit: pageSize,
                    search: search || undefined,
                    loaiTaiKhoan: loaiTaiKhoan,
                    nhaTroId: houseFilterId || undefined,
                    phongId: roomFilterId || undefined
                }
            });

            if (response.data && Array.isArray(response.data.data) && response.data.pagination) {
                // Gán MaThongBao làm id nếu cần thiết cho các thư viện UI hoặc key
                setNotifications(response.data.data.map(n => ({ ...n, id: n.MaThongBao })));
                setTotalPages(response.data.pagination.totalPages);
                 // Cập nhật lại currentPage nếu trang hiện tại lớn hơn tổng số trang trả về
                 if(currentPage > response.data.pagination.totalPages) {
                    setCurrentPage(response.data.pagination.totalPages || 1);
                }
                console.log(`Tải thông báo ĐÃ NHẬN thành công: ${response.data.data.length} items, Trang ${response.data.pagination.currentPage}/${response.data.pagination.totalPages}`);
            } else {
                console.warn("API response (received) không đúng cấu trúc hoặc không có dữ liệu.", response.data);
                setNotifications([]); setTotalPages(1); // Không reset currentPage ở đây vội
            }
        } catch (err) {
            console.error("Lỗi lấy thông báo đã nhận:", err);
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách thông báo đã nhận.');
            setNotifications([]); setTotalPages(1); // Reset state khi có lỗi
        } finally {
            setIsLoading(false);
        }
    // Lưu ý: useCallback với dependency rỗng [] có thể gây vấn đề stale state nếu hàm này
    // phụ thuộc gián tiếp vào state/props khác không được truyền vào.
    // Cân nhắc refactor dùng useEffect lồng hàm fetch như đề xuất trước đó.
    }, [currentPage, loaiTaiKhoan]); // Chỉ thêm currentPage để lấy đúng khi trang thay đổi sau khi fetch lỗi/reset


    // --- Effect cho Debouncing Search Term (Giữ nguyên) ---
    useEffect(() => {
        if (debounceTimeoutRef.current) { clearTimeout(debounceTimeoutRef.current); }
        debounceTimeoutRef.current = setTimeout(() => {
            if (searchTerm !== debouncedSearchTerm) {
                console.log(`Debounced Search Term Updated: "${searchTerm}"`);
                setDebouncedSearchTerm(searchTerm);
                setCurrentPage(1); // Reset về trang 1 khi tìm kiếm mới
            }
        }, 500);
        return () => { if (debounceTimeoutRef.current) { clearTimeout(debounceTimeoutRef.current); } };
    }, [searchTerm, debouncedSearchTerm]);

    // --- Effect chính để Fetch Data (Thêm filter IDs vào dependencies) ---
    useEffect(() => {
        if (recipientId) {
             // <<< Truyền thêm selectedHouseId và selectedRoomId >>>
            fetchReceivedNotifications(recipientId, currentPage, limit, debouncedSearchTerm, selectedHouseId, selectedRoomId);
        }
        setExpandedNotificationId(null);
    // <<< Thêm filter IDs vào dependencies >>>
    }, [recipientId, currentPage, limit, debouncedSearchTerm, selectedHouseId, selectedRoomId, fetchReceivedNotifications]);

    // --- Handlers cho Filter Dropdowns ---
    const handleHouseFilterChange = (event) => {
        const newHouseId = event.target.value;
        setSelectedHouseId(newHouseId);
        setSelectedRoomId(''); // Reset bộ lọc phòng khi nhà thay đổi
        setCurrentPage(1);    // Reset về trang 1 khi đổi filter
    };

    const handleRoomFilterChange = (event) => {
        const newRoomId = event.target.value;
        setSelectedRoomId(newRoomId);
        setCurrentPage(1); // Reset về trang 1 khi đổi filter
    };

    // --- Mark single notification as read (Giữ nguyên API endpoint) ---
    const markNotificationAsReadAPI = async (notificationId) => {
        console.log(`Marking notification ${notificationId} as read (API call)...`);
        try {
             // API này thường generic, backend sẽ kiểm tra quyền dựa trên user đang login
            await axios.patch(`/api/notifications/${notificationId}/read`); // Dùng PUT hoặc PATCH tùy backend
            console.log(`Marked ${notificationId} as read successfully.`);
            return true;
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
            alert(`Lỗi: ${error.response?.data?.message || 'Không thể đánh dấu đã đọc.'}`);
            return false;
        }
    }

    // --- Handle Click on Notification Item (Giữ nguyên logic) ---
    const handleNotificationClick = async (notificationId) => {
        const targetIndex = notifications.findIndex(n => n.MaThongBao === notificationId);
        if (targetIndex === -1) return;
        const targetNotification = notifications[targetIndex];

        setExpandedNotificationId(prevId => (prevId === notificationId ? null : notificationId));
        console.log(`Clicked notification ID: ${notificationId}, Expanded: ${expandedNotificationId !== notificationId}`); // Log trạng thái *sau khi* click

        if (!targetNotification.DaDoc) {
            const success = await markNotificationAsReadAPI(notificationId);
            if (success) {
                setNotifications(prevNotifications => {
                    const newNotifications = [...prevNotifications];
                    newNotifications[targetIndex] = { ...newNotifications[targetIndex], DaDoc: true };
                    return newNotifications;
                });
            }
        }
    };

    // --- Handle Mark All As Read (Có thể cần sửa API endpoint) ---
    const handleMarkAllRead = async () => {
        if (!recipientId) return;
        const unreadNotifications = notifications.filter(n => !n.DaDoc);
        if (unreadNotifications.length === 0) {
            alert("Không có thông báo mới nào để đánh dấu.");
            return;
        }

        setIsMarkingAll(true);
        console.log(`Marking all as read for user ${recipientId}...`);
        try {
            // *** THAY ĐỔI API ENDPOINT (Nếu cần) ***
            // Cách 1: Endpoint dựa trên user đang login (Backend tự biết user qua token)
            const response = await axios.patch(`/api/notifications/read-all`);
            // Cách 2: Endpoint cụ thể cho recipient (Ít phổ biến hơn cho action này)
            // const response = await axios.patch(`/api/notifications/received/${recipientId}/read-all`);

            console.log("Mark all as read response:", response.data);
            setNotifications(prev => prev.map(n => ({ ...n, DaDoc: true }))); // Cập nhật UI
            alert(response.data.message || `Đã đánh dấu ${unreadNotifications.length} thông báo là đã đọc.`);
        } catch (error) {
            console.error(`Error marking all as read for user ${recipientId}:`, error);
            alert(`Lỗi: ${error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc.'}`);
        } finally {
            setIsMarkingAll(false);
        }
    };

    // === HÀM ĐIỀU HƯỚNG TRANG (Giữ nguyên) ===
    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };
    const goToPreviousPage = () => { goToPage(currentPage - 1); };
    const goToNextPage = () => { goToPage(currentPage + 1); };
    // ============================

    // --- Handler cho ô tìm kiếm (Giữ nguyên) ---
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    // ============================

    // --- Styles (Giữ nguyên hoặc tùy chỉnh) ---
     const notificationListStyle = { padding: '0px' }; // Bỏ padding nếu component cha đã có
     const notificationItemStyle = {
         background: 'white',
         padding: '15px 20px',
         marginBottom: '10px',
         borderRadius: '6px',
         boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
         cursor: 'pointer',
         borderLeft: '5px solid transparent',
         transition: 'background-color 0.2s ease, border-left-color 0.2s ease', // Thêm transition
     };
     const unreadStyle = { borderLeftColor: '#007bff', fontWeight: 'bold', background: '#e7f3ff' }; // Thêm màu nền nhẹ cho chưa đọc
     const readStyle = { borderLeftColor: '#ccc' }; // Border xám nhẹ cho đã đọc
     const timeStyle = { fontSize: '0.8rem', color: '#888', marginTop: '8px', display: 'block' };
     const contentStyle = {
         margin: '8px 0 0 0', fontSize: '0.9rem', color: '#555',
         whiteSpace: 'pre-wrap', wordBreak: 'break-word'
     };
     const fullContentStyle = { ...contentStyle, maxHeight: 'none', overflow: 'visible' };
     const snippetContentStyle = {
         ...contentStyle,
         maxHeight: '3.6em', overflow: 'hidden', textOverflow: 'ellipsis',
         display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
     };
     const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
     const searchContainerStyle = { marginBottom: '20px', maxWidth: '400px' }; // Giữ lại search bar
     const paginationStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', paddingBottom: '10px', gap: '10px' }; // Giữ lại pagination


    // --- Render ---
    // Hiển thị loading ban đầu
    if (isLoading && notifications.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải thông báo...</div>;
    }

    // Hiển thị lỗi
    if (error && notifications.length === 0) { // Chỉ hiển thị lỗi nếu không có data cũ
        return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    const unreadCount = notifications.filter(n => !n.DaDoc).length;

    return (
        <div style={notificationListStyle}>
            {/* Header và nút Mark All Read */}
             <div style={headerStyle}>
                 <h4 style={{ margin: 0, fontWeight: 'bold' }}>
                     Thông báo đã nhận {unreadCount > 0 ? <span style={{ color: '#dc3545', fontWeight: 'bold' }}>({unreadCount} mới)</span> : ''}
                 </h4>
                 {notifications.length > 0 && unreadCount > 0 && (
                     <button className="grey-btn btn btn-sm" onClick={handleMarkAllRead} disabled={isMarkingAll || isLoading}>
                         {isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                     </button>
                 )}
            </div>
            
            {/* === KHU VỰC FILTER (Chỉ hiển thị cho Chủ trọ) === */}
            {isLandlordRecipient && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', padding: '15px', background: '#fdfdfd', border: '1px solid #eee', borderRadius: '6px' }}>
                    {/* House Filter */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label htmlFor="house-filter" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555', fontWeight: '500' }}>Nhà trọ:</label>
                        <select
                            id="house-filter"
                            value={selectedHouseId}
                            onChange={handleHouseFilterChange}
                            disabled={loadingHouses || isLoading} // Disable khi đang tải nhà hoặc tải thông báo
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                        >
                            <option value="">-- Tất cả nhà trọ --</option>
                            {houses.map(house => (
                                <option key={house.MaNhaTro} value={house.MaNhaTro}>
                                    {house.TenNhaTro || `Nhà ${house.MaNhaTro}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Room Filter */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                         <label htmlFor="room-filter" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555', fontWeight: '500' }}>Phòng:</label>
                         <select
                             id="room-filter"
                             value={selectedRoomId}
                             onChange={handleRoomFilterChange}
                             disabled={!selectedHouseId || loadingRooms || isLoading} // Disable khi chưa chọn nhà hoặc đang tải
                             style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', background: !selectedHouseId ? '#eee' : 'white' }}
                         >
                             <option value="">-- Tất cả phòng --</option>
                             {/* Chỉ hiển thị phòng khi loadingRooms=false và có phòng */}
                             {!loadingRooms && roomsInSelectedHouse.map(room => (
                                 <option key={room.MaPhong} value={room.MaPhong}>
                                     {room.TenPhong || `Phòng ${room.MaPhong}`}
                                 </option>
                             ))}
                             {/* Hiển thị loading nếu đang tải phòng */}
                             {loadingRooms && <option disabled>Đang tải phòng...</option>}
                         </select>
                     </div>
                </div>
            )}
            {/* ================================ */}

             {/* === Ô Tìm Kiếm === */}
             <div style={searchContainerStyle}>
                  <input
                      type="search"
                      placeholder="Tìm theo người gửi, tiêu đề, nội dung..." // Cập nhật placeholder
                      value={searchTerm}
                      onChange={handleSearchChange}
                      disabled={isLoading && notifications.length === 0} // Chỉ disable khi loading lần đầu
                      style={{
                          width: '100%', padding: '10px 12px',
                          border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem'
                      }}
                  />
             </div>
             {/* ================= */}

              {/* Hiển thị loading nhỏ khi đang fetch trang mới/search */}
             {isLoading && <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>Đang cập nhật...</p>}

             {/* Hiển thị danh sách hoặc thông báo không có kết quả */}
            {!isLoading && notifications.length === 0 ? (
                 <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666', marginTop: '20px' }}>
                      {debouncedSearchTerm ? `Không tìm thấy thông báo nào khớp với "${debouncedSearchTerm}".` : 'Bạn chưa có thông báo nào.'}
                 </p>
            ) : (
                 // Chỉ render list khi không loading hoặc đã có data sẵn (để tránh list biến mất khi loading)
                 notifications.length > 0 && (
                     <div>
                         {notifications.map(noti => {
                             const isExpanded = expandedNotificationId === noti.MaThongBao;
                             // Sử dụng style khác nhau cho đã đọc và chưa đọc
                             const itemStyle = noti.DaDoc
                                 ? { ...notificationItemStyle, ...readStyle }
                                 : { ...notificationItemStyle, ...unreadStyle };
                             return (
                                 <div
                                     key={noti.MaThongBao}
                                     style={itemStyle}
                                     onClick={() => handleNotificationClick(noti.MaThongBao)}
                                     title={noti.DaDoc ? 'Nhấn để xem lại' : 'Nhấn để xem và đánh dấu đã đọc'}
                                 >
                                     <h5 style={{ margin: '0 0 5px 0', fontSize:'1.05rem', ...(noti.DaDoc ? {fontWeight: 'normal'} : {fontWeight: 'bold'}) }}>
                                         {/* *** HIỂN THỊ NGƯỜI GỬI *** */}
                                         <span style={{ color: '#555', fontWeight: 'normal', fontSize:'0.9rem' }}>Từ: </span>
                                         {noti.SenderName || 'Không rõ'}
                                         <br />
                                         {loaiTaiKhoan === 'Chủ trọ' && (
                                             <div>
                                                 <span style={{ color: '#555', fontWeight: 'normal', fontSize: '0.9rem' }}> Nhà trọ: </span>
                                            {noti.SenderAccount.Tenants[0].Room.RentalHouse.TenNhaTro || 'Không rõ'}
                                            <br />
                                            <span style={{ color: '#555', fontWeight: 'normal', fontSize: '0.9rem' }}> Phòng: </span>
                                            {noti.SenderAccount.Tenants[0].Room.TenPhong || 'Không rõ'}
                                         <br />
                                            </div>
                         )}
                                            {/* *** HIỂN THỊ TIÊU ĐỀ *** */}
                                         <span style={{ color: '#888', fontWeight: 'normal', fontSize:'0.9rem' }}> Tiêu đề: </span>
                                         {noti.TieuDe}
                                     </h5>
                                     <p style={isExpanded ? fullContentStyle : snippetContentStyle}>
                                         {noti.NoiDung}
                                     </p>
                                     <span style={timeStyle}>
                                         {formatDateTime(noti.ThoiGian)}
                                          {/* Hiển thị dấu chấm đỏ nếu chưa đọc */}
                                         {!noti.DaDoc && <span style={{ color: 'red', marginLeft: '10px', fontSize: '1.2em' }}>●</span>}
                                     </span>
                                 </div>
                             );
                         })}
                     </div>
                 )
            )}


            {/* === KHỐI PHÂN TRANG === */}
             {!isLoading && totalPages > 1 && (
                  <div style={paginationStyle}>
                      <button className='grey-btn btn btn-sm' onClick={goToPreviousPage} disabled={currentPage === 1 || isLoading}>&laquo; Trước</button>
                      <span style={{ margin: '0 10px', fontSize: '0.9rem', fontWeight:'500' }}>
                          Trang {currentPage} / {totalPages}
                      </span>
                      <button className='grey-btn btn btn-sm' onClick={goToNextPage} disabled={currentPage === totalPages || isLoading}>Sau &raquo;</button>
                  </div>
             )}
             {/* ======================= */}
        </div>
    );
};

export default ReceivedNotificationView;