import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select'; // Import react-select
import FormField from './FormField'; // Giả sử component này tồn tại
import Button from './Button';       // Giả sử component này tồn tại
import axios from 'axios';

// --- Kiểu dữ liệu cho react-select ---
const createOption = (item, valueKey, labelKey) => ({
    value: item[valueKey],
    label: item[labelKey] || `ID ${item[valueKey]}` // Fallback label
});

const SendNotificationForm = () => {
    // --- ID Chủ Trọ Đang Đăng Nhập (Lấy từ Context/Props/...) ---
    const landlordId = 1; // <<<< THAY BẰNG MaTK CỦA CHỦ TRỌ THỰC TẾ >>>>
    // ----------------------------------------------------------

    // --- State cho Form ---
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [recipientType, setRecipientType] = useState('all'); // 'all', 'houses', 'rooms'

    // --- State cho Dữ liệu & Lựa chọn ---
    const [landlordHouses, setLandlordHouses] = useState([]); // { MaNhaTro, TenNhaTro }
    const [allLandlordRooms, setAllLandlordRooms] = useState([]); // { MaPhong, TenPhong, MaNhaTro }
    const [allLandlordTenants, setAllLandlordTenants] = useState([]); // { ..., MaTK, MaPhong, MaNhaTro }
    const [selectedHouses, setSelectedHouses] = useState([]); // Lưu các object option của react-select
    const [selectedRooms, setSelectedRooms] = useState([]);   // Lưu các object option của react-select

    // --- State cho Trạng thái & Thông báo ---
    const [isSending, setIsSending] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- Options cho react-select ---
    const houseOptions = landlordHouses.map(h => createOption(h, 'MaNhaTro', 'TenNhaTro'));
    const roomOptions = allLandlordRooms.map(r => createOption(r, 'MaPhong', 'TenPhong'));
    // Có thể nhóm room theo nhà trọ nếu muốn:
    // const groupedRoomOptions = landlordHouses.map(house => ({
    //     label: house.TenNhaTro || `Nhà ${house.MaNhaTro}`,
    //     options: allLandlordRooms
    //         .filter(room => String(room.MaNhaTro) === String(house.MaNhaTro))
    //         .map(room => createOption(room, 'MaPhong', 'TenPhong'))
    // }));

    // --- Fetch dữ liệu ban đầu ---
    const fetchLandlordData = useCallback(async () => {
        if (!landlordId) {
            setError("Lỗi: Không xác định được thông tin chủ trọ.");
            return;
        }
        setIsLoadingData(true);
        setError('');
        setSuccess(''); // Reset thông báo
        try {
            console.log(`Đang tải dữ liệu cho chủ trọ ID (MaTK): ${landlordId}`);
            const [houseRes, roomRes, tenantRes] = await Promise.allSettled([
                axios.get(`/api/landlords/${landlordId}/houses`),      // API lấy nhà trọ
                axios.get(`/api/rooms/landlord/${landlordId}`),       // API lấy tất cả phòng
                axios.get(`/api/landlords/${landlordId}/tenants`)     // API lấy tất cả tenant có MaTK
            ]);

            // Xử lý Nhà Trọ
            if (houseRes.status === 'fulfilled' && Array.isArray(houseRes.value?.data)) {
                setLandlordHouses(houseRes.value.data);
                console.log("Loaded houses:", houseRes.value.data.length);
            } else {
                console.error("Failed loading houses:", houseRes.reason || houseRes.value?.data);
                setError(prev => prev + '\nLỗi tải danh sách nhà trọ.');
                setLandlordHouses([]);
            }

            // Xử lý Phòng
            if (roomRes.status === 'fulfilled' && Array.isArray(roomRes.value?.data)) {
                setAllLandlordRooms(roomRes.value.data);
                 console.log("Loaded rooms:", roomRes.value.data.length);
            } else {
                console.error("Failed loading rooms:", roomRes.reason || roomRes.value?.data);
                setError(prev => prev + '\nLỗi tải danh sách phòng.');
                setAllLandlordRooms([]);
            }

            // Xử lý Khách Thuê (Cần MaTK, MaPhong, MaNhaTro)
            if (tenantRes.status === 'fulfilled' && Array.isArray(tenantRes.value?.data)) {
                // Quan trọng: Lọc bỏ những tenant không có MaTK ngay từ đầu nếu API chưa làm
                const validTenants = tenantRes.value.data.filter(t => t.MaTK);
                setAllLandlordTenants(validTenants);
                console.log("Loaded tenants with account:", validTenants.length);
                // *** KIỂM TRA NẾU API KHÔNG TRẢ VỀ MaNhaTro TRONG TENANT ***
                // if (validTenants.length > 0 && !validTenants[0].MaNhaTro && allLandlordRooms.length > 0) {
                //    console.warn("API did not return MaNhaTro for tenants. Mapping manually...");
                //    const roomMap = allLandlordRooms.reduce((acc, room) => {
                //        acc[room.MaPhong] = room.MaNhaTro;
                //        return acc;
                //    }, {});
                //    const tenantsWithHouseId = validTenants.map(tenant => ({
                //        ...tenant,
                //        MaNhaTro: roomMap[tenant.MaPhong]
                //    }));
                //    setAllLandlordTenants(tenantsWithHouseId);
                //}
            } else {
                console.error("Failed loading tenants:", tenantRes.reason || tenantRes.value?.data);
                setError(prev => prev + '\nLỗi tải danh sách khách thuê.');
                setAllLandlordTenants([]);
            }

        } catch (err) {
            console.error("Critical error loading landlord data:", err);
            setError('Lỗi hệ thống khi tải dữ liệu.');
            setLandlordHouses([]);
            setAllLandlordRooms([]);
            setAllLandlordTenants([]);
        } finally {
            setIsLoadingData(false);
        }
    }, [landlordId]); // Phụ thuộc vào landlordId

    useEffect(() => {
        fetchLandlordData();
    }, [fetchLandlordData]);

    // --- Xử lý gửi Form ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (!landlordId) {
             setError('Lỗi: Không xác định được người gửi.'); return;
        }
        if (!title.trim() || !message.trim()) {
            setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.'); return;
        }

        // --- Xác định danh sách MaTK người nhận ---
        let recipientTenantAccounts = [];
        let targetDescription = "";

        try { // Bọc try-catch để bắt lỗi logic lọc nếu dữ liệu không đúng cấu trúc
            if (recipientType === 'all') {
                recipientTenantAccounts = allLandlordTenants.map(t => t.MaTK).filter(Boolean);
                targetDescription = `tất cả ${recipientTenantAccounts.length} khách thuê`;
            } else if (recipientType === 'houses') {
                const houseIds = selectedHouses.map(opt => String(opt.value)); // Lấy mảng ID nhà đã chọn
                if (houseIds.length === 0) {
                    setError('Vui lòng chọn ít nhất một nhà trọ.'); return;
                }
                recipientTenantAccounts = allLandlordTenants
                    .filter(tenant => tenant.Room?.MaNhaTro && houseIds.includes(String(tenant.Room.MaNhaTro)))
                    .map(t => t.MaTK)
                    .filter(Boolean);
                const selectedNames = selectedHouses.map(opt => opt.label).join(', ');
                targetDescription = `khách thuê (${recipientTenantAccounts.length} người) trong nhà trọ: ${selectedNames}`;
            } else if (recipientType === 'rooms') {
                 const roomIds = selectedRooms.map(opt => String(opt.value)); // Lấy mảng ID phòng đã chọn
                if (roomIds.length === 0) {
                    setError('Vui lòng chọn ít nhất một phòng.'); return;
                }
                recipientTenantAccounts = allLandlordTenants
                    .filter(tenant => tenant.MaPhong && roomIds.includes(String(tenant.MaPhong))) // Lọc theo MaPhong
                    .map(t => t.MaTK)
                    .filter(Boolean);
                 const selectedNames = selectedRooms.map(opt => opt.label).join(', ');
                targetDescription = `khách thuê (${recipientTenantAccounts.length} người) trong các phòng: ${selectedNames}`;
            } else {
                setError('Loại người nhận không hợp lệ.'); return;
            }
        } catch (filterError) {
             console.error("Error filtering recipients:", filterError);
             setError("Lỗi xử lý danh sách người nhận. Kiểm tra cấu trúc dữ liệu.");
             return;
        }

        // Loại bỏ MaTK trùng lặp và kiểm tra
        recipientTenantAccounts = [...new Set(recipientTenantAccounts)];
        if (recipientTenantAccounts.length === 0) {
            setError(`Không tìm thấy khách thuê nào có tài khoản hợp lệ cho lựa chọn của bạn.`);
            return;
        }

        // --- Bắt đầu gửi ---
        setIsSending(true);
        console.log(`Chuẩn bị gửi thông báo từ Chủ trọ MaTK ${landlordId} đến ${recipientTenantAccounts.length} người nhận (${targetDescription}).`);

        const notificationPromises = recipientTenantAccounts.map(recipientMaTK => {
            const payload = {
                MaNguoiGui: landlordId,
                MaNguoiNhan: recipientMaTK,
                TieuDe: title,
                NoiDung: message,
                ThoiGian: new Date().toISOString() // Gửi thời gian theo chuẩn ISO
            };
            return axios.post('/api/notifications/', payload)
                .catch(err => ({
                    status: 'rejected',
                    reason: err,
                    recipientInfo: `MaTK ${recipientMaTK}`
                }));
        });

        try {
            const results = await Promise.allSettled(notificationPromises);
            let successCount = 0;
            let failedRecipients = [];

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value?.status >= 200 && result.value?.status < 300) {
                    successCount++;
                } else {
                    const recipientInfo = result.reason?.recipientInfo || (result.value?.config?.data ? JSON.parse(result.value.config.data).MaNguoiNhan : 'unknown');
                    failedRecipients.push(recipientInfo);
                    console.error(`Gửi thất bại cho ${recipientInfo}:`, result.reason?.response?.data || result.reason?.message || result.reason || result.value?.data);
                }
            });

            if (failedRecipients.length > 0) {
                 setError(`Gửi thành công ${successCount}/${recipientTenantAccounts.length} thông báo. Lỗi gửi đến MaTK: ${failedRecipients.join(', ')}.`);
                 setSuccess(''); // Xóa thông báo thành công nếu có lỗi
            } else {
                setSuccess(`Đã gửi thông báo thành công đến ${targetDescription}!`);
                setError(''); // Xóa lỗi nếu thành công hoàn toàn
                // Reset form
                setTitle('');
                setMessage('');
                setSelectedHouses([]);
                setSelectedRooms([]);
                setRecipientType('all');
            }
        } catch (err) {
            console.error("Lỗi không mong muốn khi gửi hàng loạt:", err);
            setError('Lỗi hệ thống khi gửi thông báo.');
        } finally {
            setIsSending(false);
        }
    };

    // --- Styles cho react-select (Tùy chọn) ---
    const selectStyles = {
        control: (provided) => ({
            ...provided,
            borderColor: '#ccc',
            minHeight: '38px',
            height: 'auto', // Cho phép tự động giãn chiều cao
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '2px 8px',
        }),
        multiValue: (provided) => ({
             ...provided,
            backgroundColor: '#e0e0e0',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#333',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#555',
            ':hover': {
                backgroundColor: '#d32f2f', // Màu đỏ khi hover nút xóa
                color: 'white',
            },
        }),
    };

    // --- Render ---
    return (
        <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', fontSize: '1.4rem', color: '#333' }}>
                    Soạn Thông Báo Gửi Khách Thuê
                </h3>

                {isLoadingData && <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>Đang tải dữ liệu...</p>}
                {error && !isLoadingData && <p style={{ color: '#dc3545', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px 15px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>{error}</p>}
                {success && <p style={{ color: '#155724', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: '10px 15px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}

                {/* === Lựa chọn Người nhận === */}
                 <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Gửi đến:</label>
                    <div style={{ display: 'flex', flexWrap:'wrap', gap: '20px', marginBottom: '10px' }}>
                        <label style={{cursor:'pointer'}}>
                             <input type="radio" name="recipientType" value="all"
                                checked={recipientType === 'all'}
                                onChange={(e) => setRecipientType(e.target.value)}
                                disabled={isLoadingData || isSending} style={{marginRight:'5px'}}/>
                             Tất cả ({allLandlordTenants.length} người)
                         </label>
                         <label style={{cursor:'pointer'}}>
                             <input type="radio" name="recipientType" value="houses"
                                checked={recipientType === 'houses'}
                                onChange={(e) => setRecipientType(e.target.value)}
                                disabled={isLoadingData || isSending || landlordHouses.length === 0} style={{marginRight:'5px'}}/>
                             Theo Nhà Trọ
                         </label>
                         <label style={{cursor:'pointer'}}>
                             <input type="radio" name="recipientType" value="rooms"
                                checked={recipientType === 'rooms'}
                                onChange={(e) => setRecipientType(e.target.value)}
                                disabled={isLoadingData || isSending || allLandlordRooms.length === 0} style={{marginRight:'5px'}}/>
                             Theo Phòng
                         </label>
                    </div>
                </div>

                {/* === Dropdown Chọn Nhà Trọ (Multi-select) === */}
                {recipientType === 'houses' && (
                    <FormField label="Chọn Nhà Trọ" id="houseSelect" required={recipientType === 'houses'}>
                        <Select
                            id="houseSelect"
                            isMulti
                            options={houseOptions}
                            value={selectedHouses}
                            onChange={setSelectedHouses}
                            placeholder="-- Chọn một hoặc nhiều nhà trọ --"
                            isDisabled={isLoadingData || isSending}
                            isLoading={isLoadingData}
                            styles={selectStyles}
                            noOptionsMessage={() => 'Không có nhà trọ nào'}
                            closeMenuOnSelect={false} // Giữ menu mở khi chọn
                        />
                    </FormField>
                )}

                 {/* === Dropdown Chọn Phòng (Multi-select) === */}
                {recipientType === 'rooms' && (
                     <FormField label="Chọn Phòng" id="roomSelect" required={recipientType === 'rooms'}>
                        <Select
                            id="roomSelect"
                            isMulti
                            options={roomOptions} // Hoặc dùng groupedRoomOptions
                            value={selectedRooms}
                            onChange={setSelectedRooms}
                            placeholder="-- Chọn một hoặc nhiều phòng --"
                            isDisabled={isLoadingData || isSending}
                            isLoading={isLoadingData}
                            styles={selectStyles}
                             noOptionsMessage={() => 'Không có phòng nào'}
                            closeMenuOnSelect={false} // Giữ menu mở khi chọn
                         />
                    </FormField>
                )}

                {/* === Trường Tiêu đề === */}
                <FormField
                    label="Tiêu đề" id="notificationTitle" name="notificationTitle" required
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', marginBottom: '15px', marginTop: recipientType !== 'all' ? '15px' : '0' }}
                    disabled={isSending || isLoadingData}
                    maxLength={255}
                    inputType="text" // Đảm bảo FormField hỗ trợ inputType hoặc render input mặc định
                />

                {/* === Trường Nội dung === */}
                <FormField label="Nội dung" id="notificationMessage" name="notificationMessage" required style={{ width: '100%', marginBottom: '20px' }}>
                     <textarea
                        id="notificationMessage" name="notificationMessage"
                        value={message} onChange={(e) => setMessage(e.target.value)}
                        rows="8"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical', fontSize: '1rem' }}
                        disabled={isSending || isLoadingData}
                    />
                </FormField>

                {/* === Nút Gửi === */}
                 <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <Button
                        type="submit"
                        label={isSending ? 'Đang gửi...' : 'Gửi Thông Báo'}
                        class_name='green-btn btn' // Đảm bảo class này tồn tại và được style
                        disabled={
                            isSending || isLoadingData ||
                            (recipientType === 'all' && allLandlordTenants.length === 0) ||
                            (recipientType === 'houses' && selectedHouses.length === 0) ||
                            (recipientType === 'rooms' && selectedRooms.length === 0)
                        }
                    />
                </div>
            </form>
        </div>
    );
};

export default SendNotificationForm;