// --- File: components/RenterForm.js ---
import React, { useState, useRef, useEffect } from 'react';
import FormField from './FormField';
import Button from './Button';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from 'axios';

// Props:
// - renterData: Object (dữ liệu người thuê hiện tại) hoặc null/undefined (chế độ thêm mới)
// - roomId: String/Number (ID của phòng, bắt buộc)
// - onSaveSuccess: Function (callback khi lưu thành công, nhận renter mới/đã cập nhật làm tham số)
// - onDeleteRenter: Function (callback khi nhấn nút xóa/rời đi, nhận renterId làm tham số)
const RenterForm = ({ renterData, roomId, onSaveSuccess, onDeleteRenter }) => {
    // const navigate = useNavigate(); // Có thể không cần navigate ở đây nữa
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan"); // Lấy loại tài khoản từ localStorage
    const isReadOnly = loaiTaiKhoan !== "Chủ trọ"; // Kiểm tra xem có phải chủ trọ không
    console.log("RenterForm: Loại tài khoản:", loaiTaiKhoan); 
    const docPhotoInputRef = useRef(null);


    // Xác định chế độ hoạt động ban đầu
    const isEditMode = Boolean(renterData?.MaKhachThue || renterData?.id);

    const [formData, setFormData] = useState({
        // Khởi tạo state trống hoặc từ renterData
        fullName: '', cccd: '', phone: '', email: '', notes: '',
        dob: '', gender: '', rentDate: ''
        // Không cần photoFileName trong state, dùng existingPhotoName và selectedDocPhoto
    });
    const [selectedDocPhoto, setSelectedDocPhoto] = useState(null); // File ảnh mới chọn
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(''); // URL xem trước ảnh
    const [existingPhotoName, setExistingPhotoName] = useState(''); // Tên file ảnh đã có trên server
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // --- Định dạng ngày tháng ---
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        } catch (e) {
            console.error("Lỗi định dạng ngày:", dateString, e);
            return '';
        }
    };

    // --- Load data hoặc reset form khi renterData hoặc chế độ thay đổi ---
    useEffect(() => {
        const currentPreviewUrl = photoPreviewUrl; // Lưu url blob hiện tại để cleanup

        if (isEditMode && renterData) {
            console.log("RenterForm: Chế độ EDIT, đang load data:", renterData);
            setFormData({
                fullName: renterData.HoTen || '',
                cccd: renterData.CCCD || '',
                phone: renterData.SoDienThoai || '',
                email: renterData.Email || '',
                notes: renterData.GhiChu || '',
                dob: formatDateForInput(renterData.NgaySinh),
                gender: renterData.GioiTinh || '',
                rentDate: formatDateForInput(renterData.NgayThue), // Cần NgayThue trong renterData
            });
            const currentPhoto = renterData.AnhGiayTo || '';
            setExistingPhotoName(currentPhoto);
            setPhotoPreviewUrl(currentPhoto ? `/uploads/${currentPhoto}` : ''); // Cập nhật đường dẫn ảnh
             // Reset lỗi và ảnh chọn khi load data mới
             setSelectedDocPhoto(null);
             setErrorMessage('');

        } else {
            console.log("RenterForm: Chế độ ADD hoặc không có renterData.");
            // Reset form cho chế độ thêm mới
            setFormData({
                fullName: '', cccd: '', phone: '', email: '', notes: '',
                dob: '', gender: '', rentDate: formatDateForInput(new Date()) // Ngày thuê mặc định là hôm nay
            });
            setPhotoPreviewUrl('');
            setExistingPhotoName('');
            setSelectedDocPhoto(null);
            setErrorMessage('');
        }

        // Cleanup blob URL cũ
        return () => {
            if (currentPreviewUrl && currentPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPreviewUrl);
            }
        };
        // Phụ thuộc vào renterData để load lại khi có người thuê mới/cập nhật từ cha
    }, [renterData, isEditMode]); // Thêm isEditMode để đảm bảo reset đúng khi chuyển từ edit -> add

    // --- Xử lý thay đổi input ---
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (errorMessage) setErrorMessage(''); // Xóa lỗi khi người dùng bắt đầu sửa

        if (type === 'radio' && name === 'gender') {
            setFormData(prevData => ({ ...prevData, gender: value }));
        } else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    // --- Xử lý chọn ảnh ---
    const handleDocPhotoChange = (e) => {
        if (errorMessage) setErrorMessage('');
        const file = e.target.files?.[0];
        // Cleanup blob URL cũ trước khi tạo cái mới
        if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreviewUrl);
        }

        if (file) {
            // --- Validation ảnh cơ bản ---
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setErrorMessage('Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG!');
                setSelectedDocPhoto(null);
                // Giữ lại ảnh preview cũ nếu có
                 setPhotoPreviewUrl(existingPhotoName ? `/uploads/${existingPhotoName}` : '');
                e.target.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setErrorMessage('Kích thước file không được vượt quá 5MB!');
                setSelectedDocPhoto(null);
                 setPhotoPreviewUrl(existingPhotoName ? `/uploads/${existingPhotoName}` : '');
                e.target.value = null;
                return;
            }
            // --- Kết thúc validation ---

            setSelectedDocPhoto(file);
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreviewUrl(previewUrl);
            // Không cần xóa existingPhotoName ở đây, chỉ khi submit thành công mới cập nhật
        } else {
            // Nếu người dùng hủy chọn file, quay lại ảnh gốc (nếu có)
            setSelectedDocPhoto(null);
            setPhotoPreviewUrl(existingPhotoName ? `/uploads/${existingPhotoName}` : '');
        }
    };

    // --- Validation ngày hợp lệ ---
    const isValidDate = (dateString) => {
        if (!dateString) return true; // Cho phép rỗng nếu không bắt buộc
        const date = new Date(dateString);
        // const today = new Date(); today.setHours(0, 0, 0, 0); // So sánh ngày
        // return !isNaN(date.getTime()) && date <= today; // Ngày phải hợp lệ và không ở tương lai
        return !isNaN(date.getTime()); // Chỉ cần check ngày hợp lệ
    };

    // --- Xử lý Submit Form (Thêm mới hoặc Cập nhật) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        // --- Kiểm tra Room ID ---
         if (!roomId) {
             setErrorMessage("Lỗi: Không xác định được phòng cho người thuê này.");
             setIsLoading(false);
             return;
         }

        // --- 1. Client-side Validation ---
        const requiredFields = {
            fullName: 'Họ và tên', cccd: 'CCCD', phone: 'Số điện thoại',
            dob: 'Ngày sinh', gender: 'Giới tính', rentDate: 'Ngày thuê',
        };
        let missingFields = [];
        for (const fieldName in requiredFields) {
            const value = formData[fieldName];
            if (value === null || value === undefined || String(value).trim() === '') {
                missingFields.push(requiredFields[fieldName]);
            }
        }
        // Ảnh chỉ bắt buộc khi thêm mới
        if (!isEditMode && !selectedDocPhoto) {
             missingFields.push('Ảnh giấy tờ');
        } else if (isEditMode && !selectedDocPhoto && !existingPhotoName) {
             missingFields.push('Ảnh giấy tờ'); // Bắt buộc nếu đang sửa và không có ảnh cũ lẫn ảnh mới
        }


        if (missingFields.length > 0) {
            setErrorMessage(`Vui lòng điền/chọn đầy đủ: ${missingFields.join(', ')}`);
            setIsLoading(false);
            return;
        }

        // Các validation khác
        if (formData.cccd.length !== 12) {
             setErrorMessage('CCCD phải có đúng 12 ký tự!'); setIsLoading(false); return;
        }
        if (formData.phone.length < 10 || formData.phone.length > 11) {
             setErrorMessage('Số điện thoại phải có 10 hoặc 11 ký tự!'); setIsLoading(false); return;
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            setErrorMessage('Email không hợp lệ!'); setIsLoading(false); return;
        }
         if (!isValidDate(formData.dob) || !isValidDate(formData.rentDate)) {
             setErrorMessage('Ngày sinh hoặc Ngày thuê không hợp lệ!'); setIsLoading(false); return;
         }
        // --- Kết thúc Validation ---


        // --- 2. Chuẩn bị dữ liệu gửi đi ---
        const dataToSend = new FormData();
        dataToSend.append('MaPhong', roomId); // Thêm MaPhong
        dataToSend.append('HoTen', formData.fullName);
        dataToSend.append('CCCD', formData.cccd);
        dataToSend.append('SoDienThoai', formData.phone);
        dataToSend.append('Email', formData.email);
        dataToSend.append('GhiChu', formData.notes);
        dataToSend.append('NgaySinh', formData.dob);
        dataToSend.append('GioiTinh', formData.gender);
        dataToSend.append('NgayThue', formData.rentDate);
        dataToSend.append('LaNguoiDaiDien', 'true'); // Luôn là true khi dùng RenterForm
        dataToSend.append('TrangThai', 'Đang thuê'); // Mặc định hoặc lấy từ state nếu có

        // Chỉ thêm file nếu người dùng chọn file mới
        if (selectedDocPhoto) {
            dataToSend.append('documentPhoto', selectedDocPhoto, selectedDocPhoto.name); // Key phải khớp backend
        }
        // Nếu đang sửa và không chọn file mới, backend sẽ tự giữ file cũ (không cần gửi gì)
        // Nếu muốn xóa file ảnh khi sửa: cần thêm logic (ví dụ: checkbox "Xóa ảnh") và gửi tín hiệu cho backend.

        console.log(`Chuẩn bị ${isEditMode ? 'cập nhật' : 'thêm mới'} người thuê chính...`);
        // for (let pair of dataToSend.entries()) { console.log(pair[0]+ ': ' + pair[1]); } // Debug FormData

        // --- 3. Gọi API ---
        const renterId = isEditMode ? (renterData.MaKhachThue || renterData.id) : null;
        const url = isEditMode ? `/api/tenants/update/${renterId}` : '/api/tenants/add';
        const method = isEditMode ? 'patch' : 'post'; // Dùng patch cho update

        try {
            const response = await axios({
                method: method,
                url: url,
                data: dataToSend,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log(`API ${method.toUpperCase()} thành công:`, response.data);
            alert(`Đã ${isEditMode ? 'cập nhật' : 'thêm mới'} người thuê chính thành công!`);

            // Gọi callback để báo cho component cha cập nhật
            if (onSaveSuccess) {
                onSaveSuccess(response.data.tenant || response.data); // Gửi dữ liệu mới/cập nhật lên
            }

            // Reset chỉ ảnh đã chọn, giữ lại ảnh mới (nếu có) từ server
             setSelectedDocPhoto(null);
             // Cập nhật existingPhotoName và preview nếu API trả về tên file mới
            const returnedTenant = response.data.tenant || response.data;
             if(returnedTenant?.AnhGiayTo){
                 setExistingPhotoName(returnedTenant.AnhGiayTo);
                 // Chỉ cập nhật preview nếu nó không phải là blob URL (tức là không phải ảnh mới chọn)
                 if (!photoPreviewUrl.startsWith('blob:')) {
                    setPhotoPreviewUrl(`/uploads/${returnedTenant.AnhGiayTo}`);
                 }
             }


        } catch (error) {
            console.error(`❌ Lỗi khi ${method} ${url}:`, error);
            const errMsg = error.response?.data?.message || error.message || "Đã xảy ra lỗi không mong muốn.";
            setErrorMessage(errMsg);
            alert(`Lỗi: ${errMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Xử lý nút Xóa / Rời đi ---
    const handleDeleteClick = () => {
        if (!isEditMode || !renterData || !(renterData.MaKhachThue || renterData.id)) {
            console.error("Không có thông tin người thuê để xóa/cập nhật trạng thái.");
            // Có thể hiển thị thông báo hoặc disable nút nếu không ở chế độ sửa
            return;
        }
        const renterId = renterData.MaKhachThue || renterData.id;
        if (window.confirm(`Bạn có chắc muốn cập nhật trạng thái rời đi cho người thuê chính ID: ${renterId}?`)) {
            if (onDeleteRenter) {
                onDeleteRenter(renterId); // Gọi hàm xử lý của component cha
            } else {
                console.error("Prop onDeleteRenter không tồn tại!");
            }
        }
    };

    // --- Styles ---
    const fileInfoStyles = { marginTop: '5px', fontSize: '0.85rem', color: '#555', display: 'block' };
    const deleteButtonStyle = { /* ... style cho nút xóa ... */
         backgroundColor: '#dc3545', color: 'white', padding: '10px 15px', border: 'none',
         borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', marginLeft: '10px'
     };
     


    // --- Render Form ---
    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', fontSize: '1.3rem' }}>
                {isEditMode ? 'Thông tin người thuê chính' : 'Thêm người thuê chính'}
            </h3>
            {errorMessage && (
                 <div style={{ color: 'white', backgroundColor: 'red', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>
                     {errorMessage}
                 </div>
            )}

            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                    {/* --- Cột 1 --- */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <FormField label="Họ và tên" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} disabled={isReadOnly} />
                    <FormField label="CCCD" id="cccd" name="cccd" required value={formData.cccd} onChange={handleChange} maxLength={12} disabled={isReadOnly} />
                    <FormField label="Số điện thoại" id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} maxLength={11} disabled={isReadOnly} />
                    <FormField label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isReadOnly} />
                    <FormField label="Ghi chú" id="notes" name="notes">
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="5"
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
                            disabled={isReadOnly}
                            />
                        </FormField>
                    </div>

                    {/* --- Cột 2 --- */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FormField label="Ngày sinh" id="dob" name="dob" type="date" required value={formData.dob} onChange={handleChange} disabled={isReadOnly} />
                        <FormField label="Giới tính" id="gender" required>
                            <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                                <input type="radio" id="male" name="gender" value="Nam" checked={formData.gender === 'Nam'} onChange={handleChange} style={{ marginRight: '5px' }} disabled={isReadOnly} />
                                <label htmlFor="male" style={{ marginRight: '20px' }}>Nam</label>
                                <input type="radio" id="female" name="gender" value="Nữ" checked={formData.gender === 'Nữ'} onChange={handleChange} style={{ marginRight: '5px' }} disabled={isReadOnly} />
                                <label htmlFor="female">Nữ</label>
                            </div>
                        </FormField>
                        <FormField label="Ngày thuê" id="rentDate" name="rentDate" type="date" required value={formData.rentDate} onChange={handleChange} disabled={isReadOnly} />

                        {/* --- Ảnh giấy tờ --- */}
                        <FormField label="Ảnh giấy tờ" id="documentPhotoWrapper" required={!isEditMode || !existingPhotoName}>
                            <>
                                {/* Thêm thuộc tính disabled={isReadOnly} vào input file ẩn */}
                                <input
                                    type="file"
                                    id="documentPhotoInput"
                                    ref={docPhotoInputRef}
                                    onChange={handleDocPhotoChange}
                                    style={{ display: 'none' }}
                                    accept="image/png, image/jpeg, image/jpg"
                                    disabled={isReadOnly} // Thêm disable ở đây
                                />
                                <div style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '4px', textAlign: 'center', marginTop:'5px' }}>
                                    {photoPreviewUrl && (
                                        <img src={photoPreviewUrl} alt="Xem trước" style={{ maxWidth: '100%', maxHeight: '150px', marginBottom: '10px', display: 'block', marginLeft: 'auto', marginRight: 'auto', border: '1px solid #eee' }}/>
                                    )}
                                    {/* Logic này đã đúng: chỉ hiển thị label tải lên cho Chủ trọ */}
                                    {loaiTaiKhoan === "Chủ trọ" && (
                                        <label htmlFor="documentPhotoInput" style={{ cursor: isReadOnly ? 'default' : 'pointer', color: '#007bff', fontSize: '0.9rem', display: 'block', pointerEvents: isReadOnly ? 'none' : 'auto' }}> {/* Cập nhật style cho label khi bị disable */}
                                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '3px' }}>↑</span> Tải ảnh lên
                                        </label>
                                    )}
                                    {(selectedDocPhoto || existingPhotoName) && (
                                         <span style={fileInfoStyles}>
                                               {selectedDocPhoto ? `Mới: ${selectedDocPhoto.name}` : `Hiện có: ${existingPhotoName}`}
                                         </span>
                                     )}
                                </div>
                            </>
                        </FormField>
                    </div>
                </div>

                {/* --- Nút Lưu và Xóa --- */}
                {loaiTaiKhoan === "Chủ trọ" && (
                    <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <Button type="submit" label={isEditMode ? 'Cập nhật' : 'Thêm mới'} class_name='green-btn btn' disabled={isLoading} />
                    {/* Chỉ hiển thị nút xóa/rời đi khi đang ở chế độ sửa */}
                    {isEditMode && (
                        <button type='button' className='delete-btn btn' onClick={handleDeleteClick} disabled={isLoading}>
                            Đánh dấu rời đi
                        </button>
                    )}
                     {/* Có thể thêm nút Hủy/Quay lại nếu cần */}
                     {/* <button type="button" onClick={() => navigate(-1)} className="gray-btn btn" style={{marginLeft: '10px'}} disabled={isLoading}>Quay lại</button> */}
                    </div>
                )}
            </form>
        </div>
    );
};

export default RenterForm;