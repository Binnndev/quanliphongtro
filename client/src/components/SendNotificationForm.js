import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select'; // Import react-select
import FormField from './FormField';
import Button from './Button';
import axios, { all } from 'axios';
// Import các service functions cần thiết
import { getDsPhongByChuTro, getNhaTroByChuTro } from '../services/phongService'; // Dùng hàm này lấy tất cả phòng của chủ trọ
import { getAllTenantsByLandlord, getMyLandlordInfo } from '../services/taiKhoanService'; // <<< Cần tạo các hàm này

// --- Kiểu dữ liệu cho react-select ---
const createOption = (item, valueKey, labelKey, additionalData = {}) => ({
    value: item[valueKey],
    label: item[labelKey] || `ID ${item[valueKey]}`, // Fallback label
    ...additionalData // Lưu thêm dữ liệu nếu cần (ví dụ: MaNhaTro cho phòng)
});

const SendNotificationForm = () => {
    const currentUserMaTK = parseInt(localStorage.getItem("MaTK"), 10); // MaTK người đang đăng nhập
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const isLandlord = loaiTaiKhoan === 'Chủ trọ';

    // --- State cho Form ---
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [recipientType, setRecipientType] = useState(isLandlord ? 'allTenants' : 'landlord'); // Mặc định cho từng vai trò
    const [selectedHouses, setSelectedHouses] = useState([]); // Lưu object { value, label }
    const [selectedRooms, setSelectedRooms] = useState([]);   // Lưu object { value, label, MaNhaTro }

    // --- State cho Dữ liệu ---
    const [landlordHouses, setLandlordHouses] = useState([]);          // Chỉ dùng cho Chủ trọ
    const [allLandlordRooms, setAllLandlordRooms] = useState([]);      // Chỉ dùng cho Chủ trọ
    const [allLandlordTenants, setAllLandlordTenants] = useState([]);  // Chỉ dùng cho Chủ trọ
    const [myLandlordInfo, setMyLandlordInfo] = useState(null);       // Chỉ dùng cho Khách thuê { MaTK, HoTen }

    // --- State cho Trạng thái & Thông báo ---
    const [isSending, setIsSending] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- Fetch dữ liệu ban đầu ---
    const fetchInitialData = useCallback(async () => {
        if (!currentUserMaTK) {
            setError("Lỗi: Không xác định được tài khoản người dùng.");
            return;
        }
        setIsLoadingData(true);
        setError('');
        setSuccess('');

        if (isLandlord) {
            // --- Fetch data cho Chủ Trọ ---
            try {
                console.log(`Đang tải dữ liệu cho chủ trọ MaTK: ${currentUserMaTK}`);
                const [houseRes, roomRes, tenantRes] = await Promise.allSettled([
                    getNhaTroByChuTro(currentUserMaTK),
                    getDsPhongByChuTro(currentUserMaTK), // Lấy tất cả phòng
                    getAllTenantsByLandlord(currentUserMaTK) // <<< API mới: Lấy tất cả tenant có MaTK, MaPhong, MaNhaTro
                ]);

                // Xử lý Nhà Trọ
                if (houseRes.status === 'fulfilled' && Array.isArray(houseRes.value)) {
                    setLandlordHouses(houseRes.value);
                } else { throw new Error('Lỗi tải danh sách nhà trọ.'); }

                // Xử lý Phòng
                if (roomRes.status === 'fulfilled' && Array.isArray(roomRes.value)) {
                    setAllLandlordRooms(roomRes.value);
                } else { throw new Error('Lỗi tải danh sách phòng.'); }

                // Xử lý Khách Thuê
                if (tenantRes.status === 'fulfilled' && Array.isArray(tenantRes.value)) {
                    // Lọc những khách thuê có MaTK, MaPhong VÀ MaNhaTro (lồng trong Room)
                    const validTenants = tenantRes.value.filter(t =>
                        t &&
                        t.MaTK && // Check MaTK (Assume it exists directly or nested in User)
                        t.MaPhong && // Check MaPhong
                        t.Room?.MaNhaTro // <<< Check nested MaNhaTro using optional chaining
                    );
                     // *** QUAN TRỌNG: Gán MaNhaTro lên cấp cao nhất để filter sau này dễ hơn ***
                     const tenantsWithFlatHouseId = validTenants.map(t => ({
                         ...t,
                         MaNhaTro: t.Room?.MaNhaTro // Thêm MaNhaTro vào cấp cao nhất
                     }));
                
                     console.log("Raw tenant data from API:", tenantRes.value);
                     console.log("Filtered valid tenants (with flattened MaNhaTro):", tenantsWithFlatHouseId);
                     setAllLandlordTenants(tenantsWithFlatHouseId); // <<< Lưu dữ liệu đã xử lý
                } else { throw new Error('Lỗi tải danh sách khách thuê.'); }

            } catch (err) {
                console.error("Lỗi tải dữ liệu cho chủ trọ:", err);
                setError(err.message || 'Lỗi hệ thống khi tải dữ liệu.');
                setLandlordHouses([]);
                setAllLandlordRooms([]);
                setAllLandlordTenants([]);
            } finally {
                setIsLoadingData(false);
            }
        } else {
            // --- Fetch data cho Khách Thuê ---
            try {
                 console.log(`Đang tải thông tin chủ nhà cho khách thuê MaTK: ${currentUserMaTK}`);
                // <<< API mới: Lấy MaTK và HoTen của chủ nhà quản lý khách thuê này >>>
                const landlordInfo = await getMyLandlordInfo(currentUserMaTK);
                if (landlordInfo && landlordInfo.MaTK && landlordInfo.HoTen) {
                    setMyLandlordInfo(landlordInfo);
                } else {
                    throw new Error("Không tìm thấy thông tin chủ nhà.");
                }
            } catch (err) {
                 console.error("Lỗi tải thông tin chủ nhà:", err);
                 setError(err.message || 'Không thể lấy thông tin người nhận.');
                 setMyLandlordInfo(null);
            } finally {
                 setIsLoadingData(false);
            }
        }
    }, [currentUserMaTK, isLandlord]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // --- Options cho react-select ---
    const houseOptions = useMemo(() => landlordHouses.map(h => createOption(h, 'MaNhaTro', 'TenNhaTro')), [landlordHouses]);

    // Lọc và tạo options cho phòng dựa trên nhà đã chọn
    const roomOptionsFiltered = useMemo(() => {
        if (!isLandlord || recipientType !== 'byRooms' || selectedHouses.length === 0) {
            return []; // Trả về rỗng nếu không phải chọn theo phòng hoặc chưa chọn nhà
        }
        const selectedHouseValues = selectedHouses.map(h => h.value); // Lấy mảng ID nhà đã chọn
        return allLandlordRooms
            .filter(room => selectedHouseValues.includes(room.MaNhaTro)) // Lọc phòng thuộc nhà đã chọn
            .map(r => createOption(r, 'MaPhong', 'TenPhong', { MaNhaTro: r.MaNhaTro })); // Thêm MaNhaTro vào option
    }, [isLandlord, recipientType, selectedHouses, allLandlordRooms]);

    // Group room options theo nhà (nếu muốn)
    const groupedRoomOptions = useMemo(() => {
         if (!isLandlord || recipientType !== 'byRooms' || selectedHouses.length === 0) return [];

         const selectedHouseValues = selectedHouses.map(h => h.value);

         // Lọc ra các nhà đã chọn trước
         const relevantHouses = landlordHouses.filter(h => selectedHouseValues.includes(h.MaNhaTro));

         return relevantHouses.map(house => ({
             label: house.TenNhaTro || `Nhà ${house.MaNhaTro}`,
             options: allLandlordRooms
                 .filter(room => room.MaNhaTro === house.MaNhaTro) // Chỉ lấy phòng của nhà này
                 .map(room => createOption(room, 'MaPhong', 'TenPhong', { MaNhaTro: room.MaNhaTro }))
         }));
    }, [isLandlord, recipientType, selectedHouses, landlordHouses, allLandlordRooms]);


    // --- Xử lý gửi Form ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (!currentUserMaTK) { setError('Lỗi: Không xác định được người gửi.'); return; }
        if (!title.trim() || !message.trim()) { setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.'); return; }

        let recipientAccountIds = [];
        let targetDescription = "";

        // --- Xác định người nhận ---
        try {
            if (isLandlord) {
                // Chủ trọ gửi
                if (recipientType === 'allTenants') {
                    recipientAccountIds = allLandlordTenants.map(t => t.MaTK).filter(Boolean); // Lấy MaTK của tất cả tenant hợp lệ
                    targetDescription = `tất cả ${recipientAccountIds.length} khách thuê`;
                } else if (recipientType === 'byHouses') {
                    const houseIds = selectedHouses.map(opt => opt.value);
                    if (houseIds.length === 0) { setError('Vui lòng chọn ít nhất một nhà trọ.'); return; }
                    recipientAccountIds = allLandlordTenants
                       .filter(tenant => tenant.MaNhaTro && houseIds.includes(tenant.MaNhaTro)) // <<< NEW Way (works after fetchInitialData fix)
                       .map(t => t.MaTK)
                       .filter(Boolean);
                     const selectedNames = selectedHouses.map(opt => opt.label).join(', ');
                     targetDescription = `khách thuê (${recipientAccountIds.length} người) trong nhà trọ: ${selectedNames}`;
                } else if (recipientType === 'byRooms') {
                    const roomIds = selectedRooms.map(opt => opt.value);
                    if (roomIds.length === 0) { setError('Vui lòng chọn ít nhất một phòng.'); return; }
                     recipientAccountIds = allLandlordTenants
                        .filter(tenant => tenant.MaPhong && roomIds.includes(tenant.MaPhong))
                        .map(t => t.MaTK)
                        .filter(Boolean);
                     const selectedNames = selectedRooms.map(opt => opt.label).join(', ');
                     targetDescription = `khách thuê (${recipientAccountIds.length} người) trong các phòng: ${selectedNames}`;
                } else {
                     setError('Loại người nhận không hợp lệ.'); return;
                }
            } else {
                // Khách thuê gửi
                if (myLandlordInfo && myLandlordInfo.MaTK) {
                    recipientAccountIds = [myLandlordInfo.MaTK];
                    targetDescription = `Chủ nhà (${myLandlordInfo.HoTen})`;
                } else {
                    setError('Không tìm thấy thông tin chủ nhà để gửi.'); return;
                }
            }
        } catch (filterError) {
            console.error("Lỗi lọc người nhận:", filterError);
            setError("Lỗi xử lý danh sách người nhận."); return;
        }

        // Loại bỏ ID trùng và kiểm tra có người nhận không
        recipientAccountIds = [...new Set(recipientAccountIds)];
        if (recipientAccountIds.length === 0) {
             setError(`Không tìm thấy khách thuê nào có tài khoản hợp lệ cho lựa chọn của bạn.`);
             return;
        }

        // --- Bắt đầu gửi ---
        setIsSending(true);
        console.log(`Chuẩn bị gửi thông báo từ MaTK ${currentUserMaTK} đến ${recipientAccountIds.length} người nhận (${targetDescription}). IDs:`, recipientAccountIds);

        // Tạo một mảng các promises để gửi thông báo
        const notificationPromises = recipientAccountIds.map(recipientMaTK => {
             const payload = {
                 MaNguoiGui: currentUserMaTK,
                 MaNguoiNhan: recipientMaTK,
                 TieuDe: title,
                 NoiDung: message,
                 // ThoiGian: new Date().toISOString() // Backend nên tự xử lý thời gian
             };
             // Dùng endpoint POST /api/notifications/ (hoặc endpoint bạn đã tạo)
             return axios.post('/api/notifications/', payload) // Giả sử endpoint là /api/notifications/
                  .catch(err => ({ // Bắt lỗi cho từng request
                      status: 'rejected',
                      reason: err,
                      recipientInfo: `MaTK ${recipientMaTK}` // Lưu lại để báo lỗi
                 }));
        });

        // Chờ tất cả các promises hoàn thành
        try {
             const results = await Promise.allSettled(notificationPromises);
             let successCount = 0;
             let failedRecipients = [];

             results.forEach(result => {
                 if (result.status === 'fulfilled' && result.value?.status >= 200 && result.value?.status < 300) {
                     successCount++;
                 } else {
                     // Lấy thông tin người nhận bị lỗi
                     const recipientInfo = result.reason?.recipientInfo || 'Không xác định';
                     failedRecipients.push(recipientInfo);
                     console.error(`Gửi thất bại cho ${recipientInfo}:`, result.reason?.response?.data || result.reason?.message || result.reason || result.value?.data);
                 }
             });

            if (failedRecipients.length > 0) {
                 setError(`Gửi thành công ${successCount}/${recipientAccountIds.length} thông báo. Lỗi gửi đến: ${failedRecipients.join(', ')}.`);
                 setSuccess(''); // Xóa thông báo thành công cũ nếu có lỗi mới
             } else {
                 setSuccess(`Đã gửi thông báo thành công đến ${targetDescription}!`);
                 setError(''); // Xóa lỗi cũ
                 // Reset form nếu gửi thành công hết
                 setTitle('');
                 setMessage('');
                 if (isLandlord) {
                     setSelectedHouses([]);
                     setSelectedRooms([]);
                     setRecipientType('allTenants');
                 }
             }
         } catch (err) { // Lỗi của Promise.allSettled (rất hiếm)
             console.error("Lỗi không mong muốn khi gửi hàng loạt:", err);
             setError('Lỗi hệ thống khi gửi thông báo.');
         } finally {
             setIsSending(false);
         }
    };

    useEffect(() => {
        console.log(allLandlordTenants); // Debug log
    }, [allLandlordTenants]); // Chỉ log khi allLandlordTenants thay đổi

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
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}> {/* Tăng maxWidth */}
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px 40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 'bold', fontSize: '1.5rem', color: '#333' }}>
                    Soạn Thông Báo
                </h3>

                {/* Thông báo Loading/Error/Success */}
                {isLoadingData && <p>Đang tải dữ liệu...</p>}
                {error && !isLoadingData && <p className="error-message">{error}</p>} {/* Nên tạo class CSS */}
                {success && <p className="success-message">{success}</p>} {/* Nên tạo class CSS */}

                {/* === PHẦN CHỌN NGƯỜI NHẬN (CHỈ DÀNH CHO CHỦ TRỌ) === */}
                {isLandlord && (
                    <div style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '25px' }}>
                        <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', fontSize: '1.1rem' }}>Gửi đến:</label>
                         {/* Radio Buttons */}
                        <div style={{ display: 'flex', flexWrap:'wrap', gap: '15px 25px', marginBottom: '15px' }}>
                            <label style={{cursor:'pointer', display: 'inline-flex', alignItems: 'center'}}>
                                <input type="radio" name="recipientType" value="allTenants" /*...*/ checked={recipientType === 'allTenants'} onChange={(e) => setRecipientType(e.target.value)} />
                                Tất cả Khách thuê ({allLandlordTenants.length})
                            </label>
                            <label style={{cursor:'pointer', display: 'inline-flex', alignItems: 'center'}}>
                                <input type="radio" name="recipientType" value="byHouses" /*...*/ checked={recipientType === 'byHouses'} onChange={(e) => setRecipientType(e.target.value)} disabled={landlordHouses.length === 0}/>
                                Theo Nhà Trọ
                            </label>
                            <label style={{cursor:'pointer', display: 'inline-flex', alignItems: 'center'}}>
                                <input type="radio" name="recipientType" value="byRooms" /*...*/ checked={recipientType === 'byRooms'} onChange={(e) => setRecipientType(e.target.value)} disabled={allLandlordRooms.length === 0} />
                                Theo Phòng Trọ
                            </label>
                        </div>

                         {/* Dropdown Nhà Trọ */}
                        {(recipientType === 'byHouses' || recipientType === 'byRooms') && (
                             <FormField label={recipientType === 'byRooms' ? "Chọn Nhà Trọ (Để lọc phòng)" : "Chọn Nhà Trọ"} id="houseSelect" required={recipientType === 'byHouses'}>
                                 <Select
                                     isMulti
                                     options={houseOptions}
                                     value={selectedHouses}
                                     onChange={setSelectedHouses}
                                     placeholder="-- Chọn nhà trọ --"
                                     isDisabled={isLoadingData || isSending}
                                     isLoading={isLoadingData}
                                     styles={selectStyles}
                                     noOptionsMessage={() => 'Không có nhà trọ'}
                                     closeMenuOnSelect={false}
                                 />
                             </FormField>
                         )}

                        {/* Dropdown Phòng Trọ */}
                         {recipientType === 'byRooms' && (
                             <FormField label="Chọn Phòng Trọ" id="roomSelect" required={recipientType === 'rooms'}>
                                 <Select
                                     isMulti
                                     options={groupedRoomOptions} // <<< Dùng options đã nhóm
                                     value={selectedRooms}
                                     onChange={setSelectedRooms}
                                     placeholder={selectedHouses.length > 0 ? "-- Chọn phòng từ nhà đã chọn --" : "-- Vui lòng chọn nhà trọ trước --"}
                                     isDisabled={isLoadingData || isSending || selectedHouses.length === 0 || roomOptionsFiltered.length === 0} // Disable nếu chưa chọn nhà hoặc không có phòng
                                     isLoading={isLoadingData} // Hoặc isLoadingRooms nếu có
                                     styles={selectStyles}
                                     noOptionsMessage={() => selectedHouses.length > 0 ? 'Nhà trọ đã chọn không có phòng' : 'Chọn nhà trọ để thấy phòng'}
                                     closeMenuOnSelect={false}
                                 />
                             </FormField>
                         )}
                    </div>
                )}
                 {/* === PHẦN HIỂN THỊ NGƯỜI NHẬN (CHO KHÁCH THUÊ) === */}
                 {!isLandlord && (
                      <div style={{ marginBottom: '25px' }}>
                           <label style={{ fontWeight: 'bold', display: 'block', fontSize: '1.1rem' }}>Gửi đến:</label>
                           <p style={{ marginLeft: '10px', fontStyle: 'italic', color: '#333' }}>
                                Chủ nhà ({myLandlordInfo ? myLandlordInfo.HoTen : 'Đang tải...'})
                           </p>
                       </div>
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
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Button
                        type="submit"
                        label={isSending ? 'Đang gửi...' : 'Gửi Thông Báo'}
                        class_name='green-btn btn'
                        disabled={isSending || isLoadingData || /* Thêm điều kiện disable nếu chưa chọn gì khi cần */
                                  (isLandlord && recipientType === 'byHouses' && selectedHouses.length === 0) ||
                                  (isLandlord && recipientType === 'byRooms' && selectedRooms.length === 0) ||
                                  (!isLandlord && !myLandlordInfo)
                        }
                    />
                </div>
            </form>
        </div>
    );
};

export default SendNotificationForm;