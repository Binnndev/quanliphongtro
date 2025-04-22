import React, { useState, useEffect, useRef } from 'react';
import FormField from './FormField'; // Đảm bảo đường dẫn đúng
import Button from './Button'; // Đảm bảo component Button đã sửa lỗi type/onClick
import axios from 'axios'; // Chỉ cần nếu gọi API trực tiếp (ví dụ: tải file)

// Props: contractData, onSave, onTerminate, roomId
const ContractTabContent = ({ contractData, onSave, onTerminate, roomId, representativeTenantId }) => {
    const fileInputRef = useRef(null);
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan") || ''; // Lấy loại tài khoản từ localStorage

    // --- State ---
    const [mode, setMode] = useState('loading'); // 'loading', 'display', 'add', 'edit'
    const [formData, setFormData] = useState({
        creationDate: '', startDate: '', endDate: '', deposit: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentFileName, setCurrentFileName] = useState('');
    const [currentFileUrl, setCurrentFileUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading cho việc submit
    const [errorMessage, setErrorMessage] = useState('');

    // --- Định dạng ngày lưu database ---
    const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';

    // --- Định dạng ngày hiển thị từ formData ---
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) {
            console.error("Lỗi định dạng ngày:", dateString, e);
            return '';
        }
    };

    // --- Tính toán trạng thái hiển thị ---
    const getDisplayStatus = (contract) => {
        if (!contract) return 'Chưa có hợp đồng';
        if (contract.TrangThai === 'Đã hủy') return 'Đã hủy'; // Ưu tiên trạng thái hủy

        const today = new Date(); today.setHours(0, 0, 0, 0); // Chỉ so sánh ngày
        const endDate = new Date(contract.NgayKetThuc); endDate.setHours(0, 0, 0, 0);

        if (endDate < today) return 'Hết hiệu lực';
        return contract.TrangThai || 'Có hiệu lực'; // Mặc định nếu không có trạng thái
    };

    const displayStatus = getDisplayStatus(contractData);
    const isViewOnly = mode === 'display'; // Check if in display mode

    // --- Effect để khởi tạo state và mode ---
    useEffect(() => {
        console.log("ContractTabContent useEffect, contractData:", contractData);
        if (contractData) {
            setFormData({
                creationDate: formatDate(contractData.NgayLap),
                startDate: formatDate(contractData.NgayBatDau),
                endDate: formatDate(contractData.NgayKetThuc),
                deposit: contractData.TienCoc || '',
                // status: contractData.TrangThai || 'Có hiệu lực',
                // Thêm các trường khác nếu cần
            });
           // --- CẬP NHẬT LẤY THÔNG TIN FILE TỪ FileHopDong ---
           const fileNameFromDb = contractData.FileHopDong || ''; // Lấy tên file từ field mới
           const contractId = contractData.MaHopDong || contractData.id; // Lấy ID hợp đồng

           setCurrentFileName(fileNameFromDb);

           if (fileNameFromDb && contractId) {
               // Cách 1: Ưu tiên URL đầy đủ nếu backend cung cấp (ví dụ: presigned URL)
               // const fullUrlFromBackend = contractData.FileHopDongUrl; // Giả sử có trường này
               // if (fullUrlFromBackend) {
               //     setCurrentFileUrl(fullUrlFromBackend);
               //     console.log("Sử dụng URL file đầy đủ từ server:", fullUrlFromBackend);
               // } else {
                   // Cách 2: Xây dựng URL trỏ đến API download dựa trên ID hợp đồng
                   const downloadUrl = `/api/contracts/download/${contractId}`;
                   setCurrentFileUrl(downloadUrl);
                   console.log("Xây dựng URL download API:", downloadUrl);
               // }
               // Cách 3 (Nếu dùng static serving và FileHopDong chỉ là tên file):
               // const staticFileUrl = `/uploads/${fileNameFromDb}`;
               // setCurrentFileUrl(staticFileUrl);
               // console.log("Xây dựng URL file tĩnh:", staticFileUrl);

           } else {
               // Không có file hoặc không có ID -> không có URL tải
               setCurrentFileUrl('');
               console.log("Không có file hợp đồng hoặc thiếu ID để tạo link tải.");
           }
           // --- KẾT THÚC CẬP NHẬT FILE INFO ---
            setMode('display'); // Có dữ liệu -> hiển thị
            setSelectedFile(null);
            setErrorMessage('');
        } else {
            // Không có dữ liệu -> chế độ chuẩn bị thêm mới (hoặc hiện nút thêm)
            setFormData({ creationDate: '', startDate: '', endDate: '', deposit: '' });
            setCurrentFileName('');
            setCurrentFileUrl('');
            setSelectedFile(null);
            setMode('add'); // Hoặc 'none' để hiển thị nút "Thêm"
            setErrorMessage('');
        }
        setIsLoading(false); // Kết thúc loading ban đầu
    }, [contractData]); // Chạy lại khi contractData từ props thay đổi

    // --- Handlers ---
    const handleChange = (e) => {
        if (!isViewOnly) { // Chỉ cho phép thay đổi khi không ở chế độ xem
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errorMessage) setErrorMessage(''); // Xóa lỗi khi sửa
        }
    };

    const handleFileChange = (e) => {
        if (!isViewOnly) {
            const file = e.target.files?.[0];
            if (file) {
                // Validation cơ bản (có thể thêm)
                setSelectedFile(file);
                setCurrentFileName(file.name); // Cập nhật tên file hiển thị tạm thời
                console.log("Đã chọn file mới:", file.name);
                 if (errorMessage) setErrorMessage('');
            }
        }
    };

    const handleUploadButtonClick = () => fileInputRef.current?.click();

    // --- HÀM XỬ LÝ TẢI FILE ---
    const handleDownloadFile = () => {
        if (!currentFileUrl) {
            console.error("Không có URL file để tải xuống.");
            alert("Chưa có file hợp đồng hoặc không thể xác định đường dẫn tải.");
            return;
        }
        console.log("Yêu cầu tải file từ URL:", currentFileUrl);
        try {
            // Cách 1: Dùng window.open (đơn giản, phụ thuộc server gửi header Content-Disposition)
            window.open(currentFileUrl, '_blank');

            // Cách 2: Tạo thẻ <a> ẩn (đáng tin cậy hơn nếu server không gửi header đúng)
            // const link = document.createElement('a');
            // link.href = currentFileUrl;
            // // Trình duyệt sẽ cố gắng lấy tên file từ URL hoặc header Content-Disposition
            // // Bạn có thể gợi ý tên file nếu muốn và có currentFileName
            // if (currentFileName) {
            //     link.setAttribute('download', currentFileName);
            // }
            // link.target = '_blank'; // Có thể thêm để mở tab mới nếu không tải được
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link); // Dọn dẹp thẻ a

        } catch (error) {
            console.error("Lỗi khi khởi tạo tải file:", error);
            alert("Không thể bắt đầu tải file.");
        }
    };
    // --- KẾT THÚC HÀM TẢI FILE ---

    // Hàm thêm mới / gia hạn
    const handleAddNewClick = (isRenewal = false) => {
        let initialFormData = { creationDate: '', startDate: formatDate(new Date()), endDate: '', deposit: '' };
        if (isRenewal && contractData) {
             // ... (logic tính ngày mới) ...
              const oldEndDate = new Date(contractData.NgayKetThuc);
              const newStartDate = new Date(oldEndDate.setDate(oldEndDate.getDate() + 1));
              const newEndDate = new Date(newStartDate);
              newEndDate.setFullYear(newStartDate.getFullYear() + 1);

            initialFormData = {
                creationDate: '',
                startDate: formatDate(newStartDate),
                endDate: formatDate(newEndDate),
                deposit: contractData.TienCoc || '',
                // status: 'Đang hiệu lực', // <= BỎ DÒNG NÀY
            };
        }
        setFormData(initialFormData);
        // ... (reset file, set mode 'add') ...
         setSelectedFile(null);
         setCurrentFileName('');
         setCurrentFileUrl('');
         setErrorMessage('');
         setMode('add');
    };

    const handleEditClick = () => {
        if (contractData) { // Chỉ sửa khi có dữ liệu gốc
             // Đảm bảo formData được cập nhật từ contractData trước khi vào edit mode
             setFormData({
                creationDate: formatDate(contractData.NgayLap),
                startDate: formatDate(contractData.NgayBatDau),
                endDate: formatDate(contractData.NgayKetThuc),
                deposit: contractData.TienCoc || '',
                // status: contractData.TrangThai || 'Có hiệu lực',
            });
            setSelectedFile(null); // Reset file chọn khi bắt đầu sửa
            setErrorMessage('');
            setMode('edit');
        }
    };

   // Hàm hủy form 
   const handleCancelClick = () => {
        setErrorMessage(''); // Luôn xóa lỗi khi hủy

        if (contractData) {
            // Nếu có dữ liệu hợp đồng gốc (dù trước đó là 'edit' hay 'add' từ gia hạn)
            // Luôn quay về trạng thái hiển thị với dữ liệu gốc đó.
            console.log("Cancel clicked: Reverting to display mode with original data.");

            // 1. Reset formData về đúng giá trị của contractData prop
            setFormData({
                creationDate: formatDate(contractData.NgayLap),
                startDate: formatDate(contractData.NgayBatDau),
                endDate: formatDate(contractData.NgayKetThuc),
                deposit: contractData.TienCoc || '',
                // Không cần set status ở đây nữa
            });

            // 2. Reset thông tin file về đúng trạng thái của contractData prop
            setSelectedFile(null); // Bỏ chọn file mới (nếu có)
            const originalFileName = contractData.FileHopDong || '';
            const contractId = contractData.MaHopDong || contractData.id;
            setCurrentFileName(originalFileName);
            setCurrentFileUrl(originalFileName && contractId ? `/api/contracts/download/${contractId}` : ''); // Tạo lại URL download gốc

            // 3. Đặt lại mode thành display
            setMode('display');

        } else {
            // Nếu không có contractData gốc (nghĩa là đang thêm mới từ đầu và hủy)
            // Thì quay lại trạng thái ban đầu (hiển thị nút "Thêm hợp đồng mới")
            console.log("Cancel clicked: No original data, reverting to initial add state/button.");
            setMode('add'); // Đặt lại mode để RenterPage có thể hiển thị nút Thêm
            // Xóa trắng form đề phòng người dùng đã nhập gì đó
            setFormData({ creationDate: '', startDate: '', endDate: '', deposit: '' });
            setSelectedFile(null);
            setCurrentFileName('');
            setCurrentFileUrl('');
        }
    };

    const handleTerminateClick = () => {
        if (!contractData?.MaHopDong) return; // Cần ID để hủy
        if (window.confirm(`Bạn có chắc muốn HỦY hợp đồng ID: ${contractData.MaHopDong}? Hành động này không thể hoàn tác trực tiếp.`)) {
            if (onTerminate) {
                setIsLoading(true);
                onTerminate(contractData.MaHopDong) // Gọi prop từ cha để xử lý API
                    .catch(() => setIsLoading(false)); // Xử lý loading nếu cha không xử lý
            } else {
                console.warn("Prop 'onTerminate' is missing!");
                alert("Chức năng Hủy hợp đồng chưa được kết nối.");
            }
        }
    };

    const handleRenewClick = () => {
        if (!contractData) return;
        console.log("Chuẩn bị gia hạn hợp đồng...");
        const oldEndDate = new Date(contractData.NgayKetThuc);
        const newStartDate = new Date(oldEndDate.setDate(oldEndDate.getDate() + 1)); // Ngày bắt đầu mới là ngày sau ngày kết thúc cũ

        // Gợi ý ngày kết thúc mới (ví dụ: 1 năm sau ngày bắt đầu mới)
        const newEndDate = new Date(newStartDate);
        newEndDate.setFullYear(newStartDate.getFullYear() + 1);

        setFormData({
            creationDate: '', // Ngày lập sẽ là ngày tạo mới
            startDate: formatDate(newStartDate),
            endDate: formatDate(newEndDate),
            deposit: contractData.TienCoc || '', // Giữ lại tiền cọc cũ (hoặc cho phép sửa)
            status: 'Có hiệu lực', // Hợp đồng mới sẽ có hiệu lực
        });
        setSelectedFile(null); // Bỏ file cũ, có thể cần upload file mới
        setCurrentFileName('');
        setCurrentFileUrl('');
        setErrorMessage('');
        setMode('add'); // Chuyển sang mode thêm mới để tạo HĐ mới
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        // --- Validation cơ bản ---
        if (!formData.startDate || !formData.endDate) {
            setErrorMessage("Vui lòng nhập Ngày bắt đầu và Ngày kết thúc.");
            setIsLoading(false); return;
        }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            setErrorMessage("Ngày kết thúc phải sau Ngày bắt đầu.");
            setIsLoading(false); return;
        }
        // Thêm validation khác nếu cần (tiền cọc, file...)
        if (mode === 'add' && !selectedFile) {
            // Có thể bắt buộc file khi thêm mới?
            setErrorMessage("Vui lòng chọn file hợp đồng khi thêm mới.");
            setIsLoading(false); return;
        }
        // Validation tiền cọc tồn tại và không âm
        if (formData.deposit && (isNaN(formData.deposit) || formData.deposit < 0)) {
            setErrorMessage("Tiền cọc không hợp lệ. Vui lòng nhập số dương.");
            setIsLoading(false); return;
        }


        // --- Chuẩn bị dữ liệu ---
        const dataToSend = new FormData();
        // Map từ formData sang tên field của backend Model (ví dụ)
        dataToSend.append('NgayLap', formData.creationDate || formatDate(new Date())); // Nếu ngày lập trống, lấy ngày hiện tại
        dataToSend.append('NgayBatDau', formData.startDate);
        dataToSend.append('NgayKetThuc', formData.endDate);
        dataToSend.append('TienCoc', formData.deposit || 0);
        // dataToSend.append('TrangThai', formData.status || 'Có hiệu lực');
        if (roomId) dataToSend.append('MaPhong', roomId); // Gửi MaPhong khi thêm mới

        // Gửi ID nếu là chỉnh sửa
        const isEdit = mode === 'edit' && contractData?.MaHopDong;
        if (isEdit) {
            // dataToSend.append('contractId', contractData.MaHopDong); // Không cần gửi ID trong body nếu URL đã có
        }

        // *** THÊM MÃ NGƯỜI THUÊ CHÍNH KHI TẠO MỚI ***
        if (!isEdit) { // Chỉ khi thêm mới
            if (representativeTenantId) {
                dataToSend.append('MaKhachThue', representativeTenantId);
                console.log("Thêm MaKhachThue vào FormData:", representativeTenantId);
            } else {
                 // Xử lý trường hợp không có ID người thuê chính khi thêm HĐ
                 console.error("Lỗi: Không có ID người thuê chính để tạo hợp đồng.");
                 setErrorMessage("Không thể tạo hợp đồng vì thiếu thông tin người thuê chính.");
                 setIsLoading(false);
                 return; // Dừng lại không gọi onSave
            }
        }
        // ---------------------------------------------

        // Thêm file nếu có chọn mới
        if (selectedFile) {
            dataToSend.append('contractFile', selectedFile, selectedFile.name); // Key 'contractFile' cho backend
        }

        console.log(`Đang gửi dữ liệu HĐ (${mode})...`);
        // for(let pair of dataToSend.entries()) console.log(pair[0]+ ': '+ pair[1]);

        // --- Gọi hàm onSave từ props ---
        if (onSave) {
            try {
                // onSave cần trả về promise để biết thành công/thất bại
                await onSave(dataToSend, isEdit, selectedFile);
                // Nếu thành công, component cha sẽ cập nhật contractData,
                // useEffect sẽ chạy lại và tự chuyển về mode 'display'
                // Reset file đã chọn sau khi lưu thành công
                 setSelectedFile(null);
            } catch (error) {
                console.error("Lỗi từ onSave callback:", error);
                setErrorMessage(error.message || "Lỗi khi lưu hợp đồng.");
            } finally {
                setIsLoading(false);
            }
        } else {
            console.warn("Prop 'onSave' is missing!");
            alert("Chức năng Lưu chưa được kết nối.");
            setIsLoading(false);
        }
    };

    // --- Styles ---
    const fileInfoStyles = { display: 'inline-block', marginLeft: '10px', fontStyle: 'italic', color: '#555', fontSize: '0.9rem'};

    // --- Render ---
    if (mode === 'loading') {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
    }

    // Nếu không có hợp đồng và không ở mode 'add' -> hiện nút thêm
    if (!contractData && mode !== 'add') {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '15px' }}>
                    Chưa có thông tin hợp đồng cho phòng này.
                </p>
                <Button label='Thêm hợp đồng mới' class_name='green-btn btn' onClick={handleAddNewClick} />
            </div>
        );
    }

    // Hiển thị Form khi thêm hoặc sửa
    if (mode === 'add' || mode === 'edit') {
        return (
            <div style={{ padding: '20px' }}>
                 <h4 style={{ textAlign: 'center', marginBottom: '20px' }}>
                     {mode === 'add' ? 'Thêm hợp đồng mới' : `Chỉnh sửa hợp đồng ID: ${contractData?.MaHopDong}`}
                 </h4>
                 {errorMessage && <div style={{color: 'red', marginBottom: '15px', textAlign: 'center'}}>{errorMessage}</div>}
                 <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {/* ... Form fields như cũ ... */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                         {/* Cột 1 */}
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <FormField label="Ngày lập" id="creationDate" name="creationDate" type="date" required value={formData.creationDate} onChange={handleChange} />
                            <FormField label="Ngày bắt đầu" id="startDate" name="startDate" type="date" required value={formData.startDate} onChange={handleChange} />
                            
                         </div>
                         {/* Cột 2 */}
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                             <FormField label="Tiền cọc" id="deposit" name="deposit" type="number" min="0" value={formData.deposit} onChange={handleChange} />
                             <FormField label="Ngày kết thúc" id="endDate" name="endDate" type="date" required value={formData.endDate} onChange={handleChange} />
                             {/* Phần Upload File */}
                             <div>
                                 <label style={{ /* ... */ }}>File Hợp đồng:</label>
                                 <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"/>
                                 <button type="button" className='blue-btn btn' onClick={handleUploadButtonClick} disabled={isLoading}>
                                     {currentFileName || selectedFile ? 'Chọn file khác' : 'Chọn file'}
                                 </button>
                                 <span style={fileInfoStyles}>
                                     {selectedFile ? `Mới: ${selectedFile.name}` : (currentFileName ? `Hiện có: ${currentFileName}` : 'Chưa chọn file')}
                                 </span>
                             </div>
                         </div>
                     </div>
                     {/* Nút Lưu và Hủy */}
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <Button type="submit" label='Lưu' class_name='green-btn btn' disabled={isLoading}/>
                        {/* <Button type="button" label='Hủy' class_name='grey-btn btn' onClick={handleCancelClick} disabled={isLoading}/> */}
                        <button className='delete-btn btn' onClick={handleCancelClick} disabled={isLoading}>Hủy</button>
                    </div>
                </form>
            </div>
        );
    }

    // Hiển thị thông tin chi tiết (display mode)
    if (mode === 'display' && contractData) {
         return (
             <div style={{ padding: '20px' }}>
                 {/* --- Nút tải file (chỉ hiện khi HĐ chưa hủy VÀ có file) --- */}
                {displayStatus !== 'Đã hủy' && currentFileUrl && (
                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                        <button className='blue-btn btn' onClick={handleDownloadFile} disabled={isLoading}>
                             Tải Hợp Đồng {currentFileName ? `(${currentFileName})` : ''}
                        </button>
                    </div>
                )}
                {/* ----------------------------------------------- */}
                 <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '25px' }}>Chi tiết hợp đồng ID: {contractData.MaHopDong}</h4>
                    {/* Hiển thị thông tin chỉ đọc */}
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 10px', marginBottom: '20px' }}>
                         <strong>Trạng thái:</strong> <strong style={{ color: displayStatus === 'Có hiệu lực' ? 'green' : (displayStatus === 'Hết hiệu lực' ? 'orange' : 'red') }}>{displayStatus}</strong>
                         <strong>Ngày lập:</strong> <span>{formatDateForDisplay(formData.creationDate) || 'N/A'}</span>
                         <strong>Ngày bắt đầu:</strong> <span>{formatDateForDisplay(formData.startDate) || 'N/A'}</span>
                         <strong>Ngày kết thúc:</strong> <span>{formatDateForDisplay(formData.endDate) || 'N/A'}</span>
                         <strong>Tiền cọc:</strong> <span>{formData.deposit ? Number(formData.deposit).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}</span>
                         <strong>File đính kèm:</strong>
                         <span>
                             {currentFileName ? (
                                 <>
                                    {currentFileName}
                                    {/* Chỉ hiện link tải nhỏ khi chưa hủy và có URL */}
                                    {displayStatus !== 'Đã hủy' && currentFileUrl && (
                                        <button onClick={handleDownloadFile} className='link-btn' style={{marginLeft: '10px', background:'none', border:'none', color:'blue', textDecoration:'underline', cursor:'pointer'}}>(Tải xuống)</button>
                                    )}
                                 </>
                             ) : 'Không có file'}
                         </span>
                    </div>             
                     {/* === CÁC NÚT HÀNH ĐỘNG DỰA VÀO TRẠNG THÁI === */}
                     {loaiTaiKhoan === "Chủ trọ" && (
                         <div style={{ textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                         {displayStatus === 'Có hiệu lực' && (
                             <>
                                  <button className='blue-btn btn' onClick={handleEditClick} disabled={isLoading}>Chỉnh sửa</button>
                                  <button className='delete-btn btn' onClick={handleTerminateClick} disabled={isLoading}>Hủy hợp đồng</button>
                                  <button className='green-btn btn' onClick={() => handleAddNewClick(true)} disabled={isLoading}>Gia hạn</button>
                             </>
                         )}
                          {displayStatus === 'Hết hiệu lực' && (
                              <>
                                 {/* Có thể vẫn cho tải file nếu muốn */}
                                 <button className='green-btn btn' onClick={() => handleAddNewClick(true)} disabled={isLoading}>Gia hạn</button>
                                 {/* Nút Thêm mới cũng có thể hiển thị ở đây nếu muốn */}
                                  <button className='green-btn btn' onClick={() => handleAddNewClick(false)} disabled={isLoading}>Thêm mới</button>
                              </>
                          )}
                          {displayStatus === 'Đã hủy' && (
                             <>
                                 <p style={{fontStyle: 'italic', color: '#888', marginBottom: '15px'}}>Hợp đồng này đã bị hủy.</p>
                                 {/* Nút THÊM MỚI thay thế */}
                                 <button className='green-btn btn' onClick={() => handleAddNewClick(false)} disabled={isLoading}>Thêm mới</button>
                             </>
                          )}
                     </div>
                    )}
                     {/* === KẾT THÚC CÁC NÚT HÀNH ĐỘNG === */}
                 </div>
             </div>
         );
    }

    // Fallback nếu không rơi vào trường hợp nào
    return <div style={{ padding: '20px', textAlign: 'center' }}>Không có dữ liệu hợp đồng hoặc trạng thái không xác định.</div>;
};

export default ContractTabContent;