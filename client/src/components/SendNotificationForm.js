import React, { useState, useEffect } from 'react';
import FormField from './FormField';
import Button from './Button';
import axios from 'axios';
// import { useAuth } from './AuthContext'; // Import context nếu dùng

const SendNotificationForm = () => {
    // const { currentUser } = useAuth();
    // const senderId = currentUser?.MaTK; // <<< THAY ID CHỦ TRỌ THỰC TẾ (MaTK)
    const senderId = 1; // Giả lập

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [allActiveTenants, setAllActiveTenants] = useState([]); // Danh sách tất cả khách đang thuê
    const [rooms, setRooms] = useState([]);                     // Danh sách các phòng
    const [recipientType, setRecipientType] = useState('all');   // 'all' hoặc 'room'
    const [selectedRoomId, setSelectedRoomId] = useState('');    // Phòng được chọn nếu gửi theo phòng

    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false); // Loading data ban đầu

    // Fetch danh sách khách thuê và phòng
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!senderId) return;

            setIsLoadingData(true);
            setError('');
            try {
                // Gọi song song 2 API
                const [tenantResponse, roomResponse] = await Promise.allSettled([
                    axios.get('/api/tenants/'), // API lấy khách thuê đang hoạt động
                    axios.get('/api/rooms/')    // API lấy danh sách phòng
                ]);

                // Xử lý kết quả khách thuê
                if (tenantResponse.status === 'fulfilled' && tenantResponse.value.data && Array.isArray(tenantResponse.value.data)) {
                    setAllActiveTenants(tenantResponse.value.data);
                    console.log("Loaded active tenants:", tenantResponse.value.data.length);
                } else {
                    setAllActiveTenants([]);
                    console.error("Failed to load tenants:", tenantResponse.reason || 'No data');
                    setError(prev => prev ? prev + '\nKhông tải được danh sách người thuê.' : 'Không tải được danh sách người thuê.');
                }

                // Xử lý kết quả phòng
                if (roomResponse.status === 'fulfilled' && roomResponse.value.data && Array.isArray(roomResponse.value.data)) {
                    setRooms(roomResponse.value.data);
                    console.log("Loaded rooms:", roomResponse.value.data.length);
                } else {
                    setRooms([]);
                     console.error("Failed to load rooms:", roomResponse.reason || 'No data');
                     setError(prev => prev ? prev + '\nKhông tải được danh sách phòng.' : 'Không tải được danh sách phòng.');
                }

            } catch (err) { // Lỗi chung khi gọi Promise.allSettled (hiếm)
                console.error("Error loading initial data:", err);
                setError('Lỗi tải dữ liệu ban đầu.');
                setAllActiveTenants([]);
                setRooms([]);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchInitialData();
    }, [senderId]); // Chỉ fetch khi có senderId

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (!senderId || !title.trim() || !message.trim()) {
            setError('Thiếu người gửi, tiêu đề hoặc nội dung.'); return;
        }

        // --- Xác định danh sách người nhận ---
        let recipientList = [];
        let targetDescription = "";

        if (recipientType === 'all') {
            recipientList = allActiveTenants;
            targetDescription = `${recipientList.length} người thuê đang hoạt động`;
            if (recipientList.length === 0) {
                setError('Không có người thuê nào đang hoạt động.'); return;
            }
        } else if (recipientType === 'room') {
            if (!selectedRoomId) {
                setError('Vui lòng chọn phòng nhận thông báo.'); return;
            }
            // Lọc những người thuê đang hoạt động VÀ thuộc phòng đã chọn
            recipientList = allActiveTenants.filter(t => String(t.MaPhong) === String(selectedRoomId));
            const selectedRoom = rooms.find(r => String(r.MaPhong) === String(selectedRoomId));
            targetDescription = `người thuê trong phòng ${selectedRoom?.TenPhong || selectedRoomId} (${recipientList.length} người)`;
            if (recipientList.length === 0) {
                setError(`Không có người thuê nào đang hoạt động trong phòng ${selectedRoom?.TenPhong || selectedRoomId}.`); return;
            }
        } else {
            setError('Loại người nhận không hợp lệ.'); return;
        }
        // ------------------------------------

        setIsSending(true);
        console.log(`Chuẩn bị gửi thông báo từ Chủ trọ ID ${senderId} đến ${targetDescription}.`);

        const notificationPromises = recipientList.map(tenant => {
            const payload = {
                MaNguoiGui: senderId,
                MaNguoiNhan: tenant.MaTK || tenant.MaKhachThue, // <<< SỬ DỤNG MaTK nếu đã refactor
                TieuDe: title,
                NoiDung: message
            };
            return axios.post('/api/notifications/', payload)
                       .catch(err => ({ // Bắt lỗi riêng từng request
                           status: 'rejected',
                           reason: err,
                           recipientInfo: `ID ${tenant.MaTK || tenant.MaKhachThue} (${tenant.HoTen || 'N/A'})` // Thêm thông tin người nhận bị lỗi
                       }));
        });

        try {
            const results = await Promise.allSettled(notificationPromises);

            let successCount = 0;
            let failedRecipients = [];

            results.forEach((result, index) => {
                 if (result.status === 'fulfilled' && result.value.status >= 200 && result.value.status < 300) {
                     successCount++;
                 } else {
                    failedRecipients.push(result.reason?.recipientInfo || `Người thứ ${index + 1}`);
                    console.error(`Gửi thất bại cho ${result.reason?.recipientInfo || `Người thứ ${index + 1}`}:`, result.reason?.response?.data || result.reason?.message || result.reason);
                }
            });

            if (failedRecipients.length > 0) {
                setError(`Gửi thành công ${successCount}/${recipientList.length} thông báo. Lỗi gửi đến: ${failedRecipients.join(', ')}.`);
            } else {
                setSuccess(`Đã gửi thông báo thành công đến ${targetDescription}!`);
                setTitle(''); setMessage(''); // Reset form
                setSelectedRoomId('');      // Reset chọn phòng
                setRecipientType('all');   // Reset về mặc định
            }
        } catch (err) {
            console.error("Lỗi không mong muốn khi gửi hàng loạt:", err);
            setError('Lỗi hệ thống khi gửi thông báo.');
        } finally {
            setIsSending(false);
        }
    };

    // --- Render ---
    return (
        <div style={{ padding: '20px' }}>
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', fontSize: '1.3rem' }}>
                    Soạn Thông Báo Gửi Khách Thuê
                </h3>

                {isLoadingData && <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>Đang tải dữ liệu...</p>}
                {!isLoadingData && error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>} {/* Hiển thị lỗi tải data */}

                {/* === Lựa chọn Người nhận === */}
                <FormField label="Gửi đến" id="recipientType" required>
                    <div style={{ display: 'flex', flexWrap:'wrap', gap: '15px', marginBottom: '10px', alignItems: 'center' }}>
                        <label style={{cursor:'pointer'}}>
                            <input
                                type="radio" name="recipientType" value="all"
                                checked={recipientType === 'all'}
                                onChange={(e) => setRecipientType(e.target.value)}
                                disabled={isLoadingData || isSending}
                                style={{marginRight:'5px'}}
                            />
                            Tất cả ({allActiveTenants.length} người)
                        </label>
                        <label style={{cursor:'pointer'}}>
                            <input
                                type="radio" name="recipientType" value="room"
                                checked={recipientType === 'room'}
                                onChange={(e) => setRecipientType(e.target.value)}
                                disabled={isLoadingData || isSending || rooms.length === 0} // Disable nếu không có phòng
                                style={{marginRight:'5px'}}
                            />
                            Theo phòng
                        </label>
                        {/* Thêm lựa chọn 'Cá nhân' ở đây nếu muốn */}
                    </div>
                </FormField>

                {/* Dropdown Chọn phòng (hiện khi chọn 'Theo phòng') */}
                {recipientType === 'room' && (
                    <FormField label="Chọn phòng" id="roomSelect" required={recipientType === 'room'}>
                        <select
                            id="roomSelect" name="roomId" // Thêm name
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            required={recipientType === 'room'} // Bắt buộc nếu chọn gửi theo phòng
                            disabled={isLoadingData || isSending}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', height: '38px' }}
                        >
                            <option value="" disabled>-- Vui lòng chọn phòng --</option>
                            {rooms.map(room => (
                                <option key={room.MaPhong} value={room.MaPhong}>
                                    {room.TenPhong || `Phòng ${room.MaPhong}`} {/* Hiển thị tên phòng */}
                                </option>
                            ))}
                        </select>
                    </FormField>
                )}
                {/* =========================== */}

                {/* Trường Tiêu đề */}
                <FormField
                    label="Tiêu đề" id="notificationTitle" name="notificationTitle" required
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', marginBottom: '15px', marginTop: recipientType === 'room' ? '15px' : '0' }} // Thêm margin top nếu có dropdown phòng
                    disabled={isSending || isLoadingData}
                    maxLength={255} // Giới hạn độ dài tiêu đề
                />

                {/* Trường Nội dung */}
                <FormField label="Nội dung" id="notificationMessage" name="notificationMessage" required style={{ width: '100%', marginBottom: '20px' }}>
                    <textarea
                        id="notificationMessage" name="notificationMessage"
                        value={message} onChange={(e) => setMessage(e.target.value)}
                        rows="8"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
                        disabled={isSending || isLoadingData}
                    />
                </FormField>

                {/* Hiển thị lỗi hoặc thành công khi gửi */}
                {error && !isLoadingData && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                {success && <p style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}

                {/* Nút Gửi */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Button
                        type="submit"
                        label={isSending ? 'Đang gửi...' : 'Gửi Thông Báo'}
                        class_name='green-btn btn'
                        disabled={isSending || isLoadingData || (recipientType === 'all' && allActiveTenants.length === 0) || (recipientType === 'room' && !selectedRoomId)}
                    />
                </div>
            </form>
        </div>
    );
};

export default SendNotificationForm;