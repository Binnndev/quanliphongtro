import React, { useState, useRef, useEffect } from 'react';
import FormField from './FormField'; // Đảm bảo import đúng đường dẫn
import Button from './Button';     // Đảm bảo import đúng đường dẫn
// Giả sử bạn có một component Select cho việc chọn phòng
// import RoomSelect from './RoomSelect';

// Props:
// - initialData: null (thêm mới) hoặc object chứa dữ liệu thành viên hiện tại (lấy từ API, khớp với Model Tenant)
// - roomId: ID của phòng mà thành viên này thuộc về (cần thiết khi thêm mới)
// - onSave: async function(formData, memberId) // Hàm gọi khi Lưu. Trả về Promise để form biết thành công/lỗi. memberId là null nếu thêm mới.
// - onClose: Hàm gọi khi nhấn Quay lại/Hủy

const MemberForm = ({ initialData, roomId, onSave, onClose }) => {
    const docPhotoInputRef = useRef(null);
    const [formData, setFormData] = useState({
            roomId, fullName: '', cccd: '', phone: '', email: '', notes: '',
            dob: '', gender: '', rentDate: ''
        });
    const [selectedDocPhoto, setSelectedDocPhoto] = useState(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
    const [existingPhotoName, setExistingPhotoName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isEditMode = Boolean(initialData?.MaKhachThue); // Kiểm tra dựa trên ID của thành viên (MaKhachThue)
    // console.log("isEditMode:", isEditMode); // Kiểm tra chế độ sửa hay thêm mới

    // --- Hàm định dạng ngày tháng (Giống RenterForm) ---
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error("Lỗi định dạng ngày:", dateString, e);
            return '';
        }
    };

    // Kiểm tra thời gian có hợp lệ không (không lớn hơn ngày hôm nay)
    const isValidDate = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        return date <= today;
    };


    useEffect(() => {
        const currentPreviewUrl = photoPreviewUrl;

        if (isEditMode) {
            console.log("Đang sửa thông tin thành viên:", initialData);
            setFormData({
                // --- Map từ initialData (Model fields) sang state (Form fields) ---
                roomId: roomId || initialData.MaPhong, // Nếu không có roomId từ props, lấy từ initialData
                fullName: initialData.HoTen || '',
                cccd: initialData.CCCD || '',
                phone: initialData.SoDienThoai || '',
                email: initialData.Email || '',
                dob: formatDateForInput(initialData.NgaySinh),
                gender: initialData.GioiTinh || '',
                notes: initialData.GhiChu || '',
                rentDate: initialData.NgayThue || ''
            });

            

            const photoFileName = initialData.AnhGiayTo || '';
            setExistingPhotoName(photoFileName);
            // Sử dụng đường dẫn /uploads/ giống RenterForm
            setPhotoPreviewUrl(photoFileName ? `/uploads/${photoFileName}` : '');

            setSelectedDocPhoto(null);
            setErrorMessage('');
        } else {
            // Reset form khi chuyển sang chế độ thêm mới hoặc initialData là null
            console.log("Đang thêm thành viên mới cho phòng:", roomId);
            setFormData({
                roomId: roomId || '', fullName: '', cccd: '', phone: '', email: '', notes: '', rentDate: formatDateForInput(new Date()),
            });
            console.log('Ngày thuê',formData.rentDate);
            setPhotoPreviewUrl('');
            setExistingPhotoName('');
            setSelectedDocPhoto(null);
            setErrorMessage('');
        }

        return () => {
            if (currentPreviewUrl && currentPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPreviewUrl);
            }
        };
        // Phụ thuộc vào initialData để load lại khi dữ liệu sửa thay đổi
        // Phụ thuộc vào roomId để cập nhật nếu phòng thay đổi (ít xảy ra khi form đang mở)
    }, [initialData, isEditMode, roomId]);


    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (errorMessage) setErrorMessage('');

        if (type === 'radio' && name === 'GioiTinh') { // Đổi name thành GioiTinh
            setFormData(prevData => ({ ...prevData, GioiTinh: value }));
        } else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    // --- handleDocPhotoChange (Giống RenterForm, có validation cơ bản) ---
    const handleDocPhotoChange = (e) => {
         if (errorMessage) setErrorMessage('');
        const file = e.target.files?.[0];
        if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreviewUrl);
        }

        if (file) {
             if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                 setErrorMessage('Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG!');
                 setSelectedDocPhoto(null);
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
            setSelectedDocPhoto(file);
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreviewUrl(previewUrl);
            setExistingPhotoName('');
        } else {
            setSelectedDocPhoto(null);
            const currentPhoto = initialData?.AnhGiayTo;
            setPhotoPreviewUrl(currentPhoto ? `/uploads/${currentPhoto}` : '');
            setExistingPhotoName(currentPhoto || '');
        }
    };

    // --- handleSubmit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
 
         // --- 1. Client-side Validation ---
         const requiredFields = {
            fullName: 'Họ và tên',
            cccd: 'CCCD',
            phone: 'Số điện thoại',
            dob: 'Ngày sinh',
             gender: 'Giới tính',
        };

        console.log("Dữ liệu form trước khi gửi:", formData);
 
         let missingFields = [];
         for (const fieldName in requiredFields) {
             // Kiểm tra giá trị null, undefined, hoặc chuỗi rỗng (sau khi cắt khoảng trắng)
             const value = formData[fieldName];
             if (value === null || value === undefined || String(value).trim() === '') {
                  missingFields.push(requiredFields[fieldName]); // Thêm tên Tiếng Việt của trường bị thiếu
             }
         }
 
         // Nếu có trường bị thiếu
         if (missingFields.length > 0) {
             setErrorMessage(`Vui lòng điền đầy đủ các thông tin bắt buộc: ${missingFields.join(', ')}`);
            //  kiểm tra có ảnh chưa
             // setIsLoading(false); // Đặt lại loading nếu đã set true trước đó
            //  alert(`Vui lòng điền đầy đủ các thông tin bắt buộc: ${missingFields.join(', ')}`);
             return; // Ngăn chặn việc gửi form
        }
        
        if (selectedDocPhoto === null && !existingPhotoName) {
            setErrorMessage('Chưa chọn ảnh');
            // setIsLoading(false); // Đặt lại loading nếu đã set true trước đó
            // alert('Vui lòng tải ảnh giấy tờ lên!');
            return; // Ngăn chặn việc gửi form
        }

        if (formData.cccd.length != 12) {
            setErrorMessage('CCCD phải có độ dài từ 9 đến 12 ký tự!');
            // setIsLoading(false); // Đặt lại loading nếu đã set true trước đó
            // alert('CCCD phải có độ dài từ 9 đến 12 ký tự!');
            return; // Ngăn chặn việc gửi form
        }

        if (formData.phone.length < 10 || formData.phone.length > 11) {
            setErrorMessage('Số điện thoại phải có độ dài từ 10 đến 11 ký tự!');
            // setIsLoading(false); // Đặt lại loading nếu đã set true trước đó
            // alert('Số điện thoại phải có độ dài từ 10 đến 11 ký tự!');
            return; // Ngăn chặn việc gửi form
        }

        if (formData.email != '' && !/\S+@\S+\.\S+/.test(formData.email)) {
            setErrorMessage('Email không hợp lệ!');
            // setIsLoading(false); // Đặt lại loading nếu đã set true trước đó
            // alert('Email không hợp lệ!');
            return; // Ngăn chặn việc gửi form
        }

        if (formData.dob && !isValidDate(formData.dob)) {
            setErrorMessage('Ngày sinh không hợp lệ!');
            // setIsLoading(false); // Đặt lại loading nếu đã set true trước đó
            // alert('Ngày sinh không hợp lệ!');
            return; // Ngăn chặn việc gửi form
        }
 
         // --- Nếu validation thành công, tiếp tục xử lý ---
         setIsLoading(true); // Bắt đầu loading sau khi validation thành công

        const dataToSend = new FormData();

        // --- Map từ state (Form fields) sang keys của Model (Backend fields) ---
        // Lưu ý: Đảm bảo các key này khớp với những gì backend (controller addTenant/updateTenant) mong đợi trong req.body
        dataToSend.append('MaPhong', formData.roomId);
        dataToSend.append('HoTen', formData.fullName);
        dataToSend.append('CCCD', formData.cccd);
        dataToSend.append('SoDienThoai', formData.phone);
        dataToSend.append('Email', formData.email);
        if (formData.dob) dataToSend.append('NgaySinh', formData.dob); // Ngày sinh có thể là null
        dataToSend.append('GioiTinh', formData.gender);
        dataToSend.append('GhiChu', formData.notes);
        dataToSend.append('NgayThue', formData.rentDate); // Ngày thuê có thể là null

        // --- Set các trường mặc định cho thành viên ---
        dataToSend.append('LaNguoiDaiDien', 'false'); // Thành viên không phải người đại diện
        dataToSend.append('TrangThai', 'Đang thuê'); // Giả sử trạng thái mặc định là đang thuê
        // NgayThue có thể để backend tự xử lý hoặc lấy từ ngày đăng ký phòng/đại diện

        // --- Append file ảnh nếu có chọn file mới ---
        if (selectedDocPhoto) {
            dataToSend.append('documentPhoto', selectedDocPhoto, selectedDocPhoto.name);
        }

        console.log("Chuẩn bị gửi dữ liệu thành viên:", Object.fromEntries(dataToSend));

        const memberId = isEditMode ? initialData.MaKhachThue : null;

        try {
            // Gọi hàm onSave từ props, truyền dữ liệu và ID (nếu có)
            await onSave(dataToSend, memberId); // Component cha sẽ xử lý POST/PATCH và URL

            // Reset state hoặc đóng form (tuỳ logic của component cha)
             if (!isEditMode) { // Reset form nếu là thêm mới thành công
                 setFormData({ roomId, fullName: '', cccd: '', phone: '', email: '', notes: '' });
                 setSelectedDocPhoto(null);
                 setPhotoPreviewUrl('');
                 setExistingPhotoName('');
                 // Không gọi onClose ở đây, để component cha quyết định
             }
             // onClose(); // Có thể gọi onClose nếu muốn tự động đóng form sau khi lưu thành công

        } catch (error) {
             console.error("❌ Lỗi khi gọi onSave từ MemberForm:", error);
             // Hiển thị lỗi trả về từ onSave (API call)
             setErrorMessage(error.message || "Đã xảy ra lỗi khi lưu thông tin.");
             // Không alert lỗi ở đây, để component cha xử lý nếu muốn
        } finally {
            setIsLoading(false);
        }
    };

    // --- Styles ---
    const fileInfoStyles = { marginTop: '5px', fontSize: '0.85rem', color: '#555', display: 'block' };

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', fontSize: '1.3rem' }}>
                {isEditMode ? 'Sửa thông tin thành viên' : 'Thêm thành viên mới'}
            </h3>
            {errorMessage && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>{errorMessage}</div>}

            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>

                    {/* Cột 1 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FormField label="Họ và tên" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} style={{ width: '100%', marginBottom: 0 }}/>
                        <FormField label="CCCD" id="cccd" name="cccd" required value={formData.cccd} onChange={handleChange} style={{ width: '100%', marginBottom: 0 }}/>
                        <FormField label="Số điện thoại" id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} style={{ width: '100%', marginBottom: 0 }}/>
                        <FormField label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', marginBottom: 0 }}/>
                        <FormField label="Ghi chú" id="notes" name="notes" style={{ width: '100%', marginBottom: 0 }}>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="5" style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }} />
                        </FormField>
                    </div>

                    {/* Cột 2 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FormField label="Ngày sinh" id="dob" name="dob" type="date" required value={formData.dob} onChange={handleChange} style={{ width: '100%', marginBottom: 0 }}/>
                        <FormField label="Giới tính" id="gender" required style={{ width: '100%', marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                                <input type="radio" id="male" name="gender" value="Nam" checked={formData.gender === 'Nam'} onChange={handleChange} style={{ marginRight: '5px' }} />
                                <label htmlFor="male" style={{ marginRight: '20px' }}>Nam</label>
                                <input type="radio" id="female" name="gender" value="Nữ" checked={formData.gender === 'Nữ'} onChange={handleChange} style={{ marginRight: '5px' }} />
                                <label htmlFor="female">Nữ</label>
                            </div>
                        </FormField>
                        <FormField label="Ngày thuê" id="rentDate" name="rentDate" type="date" required value={formData.rentDate} onChange={handleChange} style={{ width: '100%', marginBottom: 0 }}/>

                        {/* --- Phần Ảnh giấy tờ (Sử dụng label như cũ) --- */}
                        <FormField label="Ảnh giấy tờ" id="documentPhotoWrapper" required style={{ width: '100%', marginBottom: 0 }}>
                             {/* Bỏ children mặc định, tự render nội dung bên trong FormField */}
                            <>
                                 {/* Input file ẩn */}
                                 <input
                                     type="file"
                                     id="documentPhotoInput" // ID này phải khớp với label htmlFor
                                     ref={docPhotoInputRef}
                                     onChange={handleDocPhotoChange}
                                     style={{ display: 'none' }}
                                     accept="image/png, image/jpeg, image/jpg"
                                 />
                                 {/* Khu vực hiển thị ảnh và label trigger */}
                                 <div style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                                     {/* Xem trước ảnh */}
                                     {photoPreviewUrl && (
                                         <img
                                             src={photoPreviewUrl}
                                             alt="Xem trước ảnh giấy tờ"
                                             style={{ maxWidth: '100%', maxHeight: '150px', marginBottom: '10px', display: 'block', marginLeft: 'auto', marginRight: 'auto', border: '1px solid #eee' }}
                                         />
                                     )}

                                     {/* Label hoạt động như nút upload, giống thiết kế gốc */}
                                     <label htmlFor="documentPhotoInput" style={{ cursor: 'pointer', color: '#007bff', fontSize: '0.9rem', display: 'block' }}>
                                         {/* Icon và Text */}
                                         <span style={{fontSize: '1.5rem', display:'block', marginBottom: '3px'}}>↑</span>
                                         Tải ảnh lên
                                     </label>

                                      {/* Hiển thị tên file (tùy chọn) */}
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

                {/* Nút Lưu */}
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Button type="submit" label='Lưu' class_name='green-btn btn' />
                    <button type="button" onClick={onClose} className="delete-btn btn">Quay lại</button>
                </div>
            </form>
        </div>
    );
};

export default MemberForm;