import React, { useState, useEffect, use } from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer";
import Button from "../components/Button";
import UserIcon from "../components/UserIcon";
import { useNavigate, useParams } from "react-router-dom"; // Thêm useParams nếu cần lấy ID từ URL
import axios from "axios"; // Nếu bạn sử dụng axios để gọi API

// Import các component nội dung tab và form mới
import RenterForm from "../components/RenterForm";
import MembersTabContent from "../components/MembersTabContent";
import ContractTabContent from "../components/ContractTabContent";
import MemberForm from "../components/MemberForm"; // Import form thành viên

const RenterPage = () => {
    const navigate = useNavigate();
    const { roomId } = useParams(); // Lấy ID phòng từ URL
    console.log(roomId);  // Kiểm tra giá trị của roomId

    const [activeTab, setActiveTab] = useState('renter'); // Ví dụ bắt đầu ở tab thành viên

    // State cho dữ liệu (ví dụ)
    const [renterData, setRenterData] = useState(null);
    const [membersData, setMembersData] = useState([]);
    const [contractData, setContractData] = useState(null);

    // State quản lý hiển thị form Thêm/Sửa thành viên
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null); // null: Thêm mới, object: Sửa

    // --- Gọi API để lấy dữ liệu ---
    useEffect(() => {
        const fetchData = async () => {
            if (roomId) {
                console.log(`RenterPage: Fetching data for room ${roomId}`);
                setIsLoading(true); // Bắt đầu loading tổng
                try {
                    const results = await Promise.allSettled([
                        getRenterData(roomId),
                        getMembersData(roomId),
                        getContractData(roomId)
                    ]);
                     // Xử lý kết quả...
                    if (results[0].status === 'rejected') { console.warn("Không tải được renter data."); setRenterData(null); }
                    if (results[1].status === 'rejected') { console.error("Lỗi tải members data."); setMembersData([]); }
                    if (results[2].status === 'rejected') { console.warn("Không tải được contract data."); setContractData(null); }

                } catch (error) {
                    console.error("Lỗi fetch data trang:", error);
                    setRenterData(null); setMembersData([]); setContractData(null);
                } finally {
                    setIsLoading(false); // Kết thúc loading tổng
                }
            }
        };
        fetchData();
    }, [roomId]);

    const [isLoading, setIsLoading] = useState(true);
    

    const getRenterData = async (roomId) => {
        const response = await axios.get(`/api/tenants/room/${roomId}/representative`);
        if (response.status === 200 && response.data) {
            // Gán cả id để dùng nhất quán trong component con nếu cần
            setRenterData({ ...response.data, id: response.data.MaKhachThue });
        } else {
           setRenterData(null); // Quan trọng: set null nếu không tìm thấy
           // Không throw error ở đây nữa nếu 404 là hợp lệ (phòng trống)
            if (response.status !== 404 && response.status !== 204) {
               throw new Error(`Failed to get renter data, status: ${response.status}`);
            }
        }
    };
    const getMembersData = async (roomId) => {
        const response = await axios.get(`/api/tenants/room/${roomId}/members`);
        if (response.status === 200) {
           setMembersData(response.data.map(m => ({ ...m, id: m.MaKhachThue })));
        } else {
            throw new Error(`Failed to get members data, status: ${response.status}`);
        }
    };

    const getContractData = async (roomId) => {
        try {
            const response = await axios.get(`/api/contracts/room/${roomId}`); // Gọi API để lấy dữ liệu hợp đồng
            if (response.status === 200) {
                setContractData(response.data); // Giả lập dữ liệu hợp đồng
            } else {
                console.error("Lỗi khi lấy dữ liệu hợp đồng:", response.statusText);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    };
       

    // --- Hàm xử lý cho Member Form ---
    const handleShowAddMemberForm = () => {
        if (!renterData) { // Vẫn nên kiểm tra có renter chính chưa
            alert("Vui lòng thêm người thuê chính trước."); return;
        }
        setEditingMember(null);
        setShowMemberForm(true); // Mở form dành cho thành viên
    };

    const handleShowEditMemberForm = (memberToEdit) => {
        console.log("RenterPage: handleShowEditMemberForm được gọi với memberToEdit:", memberToEdit); // Kiểm tra 5: Dữ liệu có được truyền đúng không?
        setEditingMember(memberToEdit); // Lưu dữ liệu thành viên cần sửa
        setShowMemberForm(true); // Hiện form
        console.log("RenterPage: setShowMemberForm(true) đã được gọi."); // Kiểm tra 6: State có được set không?
    };

    const handleCloseMemberForm = () => {
        console.log("--- RenterPage: handleCloseMemberForm được gọi (từ MemberForm) ---");
        setShowMemberForm(false); // Ẩn form
        setEditingMember(null); // Reset trạng thái sửa
    };

    // --- HÀM XỬ LÝ KHI LƯU THÀNH CÔNG TỪ RENTER FORM ---
    const handleRenterSaveSuccess = (savedRenter) => {
        console.log("RenterPage: Nhận được renter đã lưu từ RenterForm:", savedRenter);
        // Cập nhật lại state renterData với dữ liệu mới nhất
         // Đảm bảo gán lại id nếu cần
        setRenterData({ ...savedRenter, id: savedRenter.MaKhachThue || savedRenter.id });
        // Có thể fetch lại members hoặc contract nếu việc thay đổi renter ảnh hưởng
    };
    // ----------------------------------------------------

     // --- HÀM XỬ LÝ KHI LƯU THÀNH CÔNG TỪ MEMBER FORM ---
     const handleMemberSaveSuccess = (savedMember, isEditMode) => {
        console.log("RenterPage: Nhận được member đã lưu từ MemberForm:", savedMember);
        if (isEditMode) {
            setMembersData(prev => prev.map(m =>
                String(m.id || m.MaKhachThue) === String(savedMember.MaKhachThue || savedMember.id)
                    ? { ...savedMember, id: savedMember.MaKhachThue || savedMember.id } // Cập nhật và đảm bảo có id
                    : m
            ));
        } else {
            setMembersData(prev => [...prev, { ...savedMember, id: savedMember.MaKhachThue || savedMember.id }]); // Thêm và đảm bảo có id
        }
        handleCloseMemberForm(); // Đóng form member sau khi lưu
   };
    // ----------------------------------------------------

    const handleSaveMember = async (memberFormData, isEditMode, selectedDocPhoto) => {
        const endpoint = isEditMode ? `/api/tenants/update/${editingMember.MaKhachThue}` : '/api/tenants/add';
        const method = isEditMode ? 'PATCH' : 'POST';

        console.log(`🚀 [${method}] Calling endpoint: ${endpoint}`);

        console.log("--- Debugging Edit Save ---");
console.log("Editing Member State:", editingMember); // Kiểm tra toàn bộ object
console.log("ID being used for endpoint:", editingMember?.MaKhachThue); // Kiểm tra ID
console.log("Endpoint URL constructed:", endpoint); // Kiểm tra URL cuối cùng
console.log("HTTP Method:", method); // Kiểm tra phương thức
console.log("Data being sent:", Object.fromEntries(memberFormData)); // Xem dữ liệu gửi đi (lưu ý: file sẽ không hiển thị trực tiếp)


        try {
            // --- Gọi API Thực Tế ---
            console.log("📡 Chuẩn bị gọi API...");
            const response = await axios({
                 method: method,
                 url: endpoint,
                 data: memberFormData,
                 headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("✅ API Response Status:", response.status);
            console.log("✅ API Response Data (Raw):", response.data);

            const savedDataFromApi = response.data;
            if (!savedDataFromApi) {
                 console.error("‼️ Dữ liệu trả về từ API trống!");
                 throw new Error("Dữ liệu trả về từ API trống!"); // Dừng lại nếu API không trả về gì
            }
            console.log("📝 Dữ liệu thật sự từ API:", savedDataFromApi);

            // --- Xử lý dữ liệu THẬT từ API ---
            console.log("🔄 Chuẩn bị định dạng dữ liệu THẬT...");
            // Map dữ liệu từ API (savedDataFromApi) sang cấu trúc cần thiết cho state/UI
            // Đảm bảo các trường cần thiết cho bảng (ví dụ: id, name) có mặt
            const formattedMember = {
                // Lấy các trường trực tiếp từ API response nếu tên khớp
                ...savedDataFromApi,
                // Map hoặc đảm bảo các trường quan trọng cho UI tồn tại
                id: savedDataFromApi.MaKhachThue || savedDataFromApi.id, // Ưu tiên MaKhachThue nếu có, lấy ID thật
                name: savedDataFromApi.HoTen, // Map HoTen sang name để hiển thị nhất quán
                cccd: savedDataFromApi.CCCD,
                phone: savedDataFromApi.SoDienThoai,
                email: savedDataFromApi.Email,
                dob: savedDataFromApi.NgaySinh, // Giữ nguyên hoặc format lại ngày nếu cần hiển thị khác
                gender: savedDataFromApi.GioiTinh,
                notes: savedDataFromApi.GhiChu,
                // Xác định trạng thái ảnh dựa trên tên file trả về từ API
                photo: savedDataFromApi.AnhGiayTo ? 'Có' : 'Không', // Cập nhật trạng thái ảnh đúng
                documentPhotoName: savedDataFromApi.AnhGiayTo || '', // Lưu tên file ảnh thật
            };
            console.log("👍 Dữ liệu THẬT đã định dạng:", formattedMember);

            // --- Xóa bỏ khối code giả lập ở đây ---
            // KHÔNG CÒN KHỐI GIẢ LẬP NỮA

            // --- Cập nhật state với dữ liệu THẬT ---
            console.log("🔄 Chuẩn bị cập nhật state với dữ liệu THẬT:", formattedMember);
            if (isEditMode) {
                console.log("   -> Cập nhật state (chế độ sửa)...");
                 // Cập nhật logic sửa nếu cần, dùng formattedMember
                 setMembersData(prevMembers => prevMembers.map(m => m.MaKhachThue === formattedMember.MaKhachThue ? formattedMember : m));
            } else {
                 console.log("   -> Cập nhật state (chế độ thêm mới)...");
                 setMembersData(prevMembers => {
                     console.log("      -> State cũ:", prevMembers);
                     // *** Thêm dữ liệu THẬT đã format vào state ***
                     const newState = [...prevMembers, formattedMember];
                     console.log("      -> State mới (dự kiến):", newState);
                     return newState;
                 });
            }
            console.log("🟢 Đã gọi setMembersData.");

            // --- Các bước tiếp theo ---
            console.log("🔔 Chuẩn bị hiển thị alert thành công...");
            alert(`Đã ${isEditMode ? 'cập nhật' : 'thêm'} thành viên thành công!`);
            console.log("👍 Đã hiển thị alert.");

            console.log("🚪 Chuẩn bị đóng form...");
            handleCloseMemberForm();
            console.log("🔒 Đã gọi handleCloseMemberForm.");

            console.log("🎉 Xử lý thành công hoàn tất trong try block.");

        } catch (error) {
            console.error("❌ Lỗi gốc bị bắt trong handleSaveMember:", error);
            let displayMessage = "Đã xảy ra lỗi khi xử lý dữ liệu.";
            if (error.response) {
                console.error("❌ Dữ liệu lỗi từ server:", error.response.data);
                console.error("❌ Status lỗi từ server:", error.response.status);
                displayMessage = error.response.data?.message || `Lỗi ${error.response.status} từ server`;
            } else if (error.request) {
                 console.error("❌ Không nhận được phản hồi:", error.request);
                 displayMessage = "Không nhận được phản hồi từ máy chủ.";
            } else {
                 console.error('❌ Lỗi khác trong quá trình xử lý:', error.message);
                 displayMessage = error.message || displayMessage;
            }
            alert(`Lỗi: ${displayMessage}`);
            console.log(`(Log tại catch) Đã rơi vào catch với lỗi: ${displayMessage}`);
        }
    };
    // --- Kết thúc hàm xử lý Member Form ---

    // --- HÀM XỬ LÝ XÓA (CẬP NHẬT TRẠNG THÁI) ---
    const handleDeleteMemberApiCall = async (memberIdToDelete) => {
        console.log(`RenterPage: Nhận yêu cầu xóa (cập nhật trạng thái) cho ID: ${memberIdToDelete}`);
        try {
            // Gọi API để thực hiện soft delete (cập nhật NgayRoiDi/TrangThai)
            const response = await axios.delete(`/api/tenants/delete/${memberIdToDelete}`);

            console.log("RenterPage: API soft delete thành công:", response.data);

            // *** CẬP NHẬT STATE ĐỂ XÓA THÀNH VIÊN KHỎI DANH SÁCH HIỂN THỊ ***
            setMembersData(prevMembers => {
                // Lọc bỏ thành viên có ID trùng với ID vừa xóa
                const updatedMembers = prevMembers.filter(member =>
                    // So sánh ID nhất quán (MaKhachThue hoặc id)
                    String(member.MaKhachThue || member.id) !== String(memberIdToDelete)
                );
                console.log("RenterPage: Cập nhật state membersData sau khi xóa:", updatedMembers);
                return updatedMembers; // Trả về mảng mới không chứa thành viên đã xóa
            });

            alert(response.data.message || "Cập nhật trạng thái thành viên thành công!");

        } catch (error) {
            console.error(`RenterPage: Lỗi khi gọi API xóa (cập nhật trạng thái) cho ID ${memberIdToDelete}:`, error);
            alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái thành viên.'}`);
            // Không thay đổi state nếu API thất bại
        }
    };
    // --- KẾT THÚC HÀM XỬ LÝ XÓA ---
    
    // --- REFACTORED SOFT DELETE HANDLER ---
    const handleSoftDeleteTenant = async (tenantIdToDelete) => {
        if (!tenantIdToDelete) return;
         console.log(`RenterPage: Soft delete request for ID: ${tenantIdToDelete}`);
         try {
             const response = await axios.delete(`/api/tenants/delete/${tenantIdToDelete}`);
             const successMessage = response.data.message || "Cập nhật trạng thái thành công!";
             const renterCurrentId = renterData?.MaKhachThue || renterData?.id;

             if (renterCurrentId && String(renterCurrentId) === String(tenantIdToDelete)) {
                 console.log("RenterPage: Main renter marked as departed.");
                 setRenterData(null); // Xóa dữ liệu renter khỏi state
                 alert(successMessage + " Đang quay lại..."); // Thông báo
             } else {
                 console.log("RenterPage: Member marked as departed.");
                 // Xóa thành viên khỏi state membersData
                 setMembersData(prev => prev.filter(m => String(m.id || m.MaKhachThue) !== String(tenantIdToDelete)));
                 alert(successMessage); // Thông báo cho thành viên
             }
         } catch (error) {
             console.error(`RenterPage: Error soft deleting tenant ID ${tenantIdToDelete}:`, error);
             alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái.'}`);
         }
    };
    // --- END SOFT DELETE HANDLER ---

    // --- HÀM XỬ LÝ LƯU HỢP ĐỒNG (Thêm/Sửa) ---
    // Hàm này được gọi bởi onSave của ContractTabContent
    const handleSaveContract = async (contractFormData, isEdit, selectedFile) => {
        const contractId = isEdit ? contractData?.MaHopDong : null; // Lấy ID nếu là sửa
        const endpoint = isEdit ? `/api/contracts/update/${contractId}` : '/api/contracts/add';
        // Dùng PATCH cho update thường phù hợp hơn PUT
        const method = isEdit ? 'patch' : 'post';

        console.log(`RenterPage: Calling ${method} ${endpoint} for contract...`);

        try {
            const response = await axios({
                method: method,
                url: endpoint,
                data: contractFormData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("RenterPage: Save contract response:", response.data);
            const savedContract = response.data?.contract || response.data; // Adapt based on API response

            if (!savedContract || typeof savedContract !== 'object') {
                 throw new Error("Dữ liệu hợp đồng trả về không hợp lệ.");
            }

            // Cập nhật state với dữ liệu mới nhất
            setContractData(savedContract);

            alert(`Đã ${isEdit ? 'cập nhật' : 'thêm mới'} hợp đồng thành công!`);
            // ContractTabContent sẽ tự chuyển về display mode nhờ useEffect chạy lại

            // Không cần return gì vì ContractTabContent tự xử lý loading
            // return Promise.resolve(); // Có thể trả về để báo thành công

        } catch (error) {
            console.error("RenterPage: Lỗi khi lưu hợp đồng:", error);
            // Ném lỗi để ContractTabContent có thể bắt và hiển thị
             throw new Error(error.response?.data?.message || error.message || 'Lỗi lưu hợp đồng.');
        }
    };
    // --- KẾT THÚC HÀM LƯU HỢP ĐỒNG ---

    // --- HÀM XỬ LÝ HỦY HỢP ĐỒNG ---
    const handleTerminateContract = async (contractIdToTerminate) => {
        console.log(`RenterPage: Requesting termination for contract ID: ${contractIdToTerminate}`);
        const endpoint = `/api/contracts/terminate/${contractIdToTerminate}`; // Endpoint API hủy
        try {
            // Gọi API để cập nhật trạng thái thành 'Đã hủy'
            const response = await axios.patch(endpoint); // Dùng PATCH để cập nhật trạng thái

            console.log("RenterPage: Terminate contract response:", response.data);
            const updatedContract = response.data?.contract || response.data;
            console.log('[DEBUG] Frontend - Dữ liệu nhận được từ API hủy:', updatedContract);
            console.log('[DEBUG] Frontend - FileHopDong nhận được:', updatedContract?.FileHopDong);

            if (!updatedContract || typeof updatedContract !== 'object') {
                throw new Error("Dữ liệu hợp đồng trả về không hợp lệ sau khi hủy.");
            }

            // Cập nhật state với hợp đồng đã cập nhật trạng thái
            setContractData(updatedContract);

            alert(response.data.message || "Đã hủy hợp đồng thành công!");
            // return Promise.resolve(); // Báo thành công

        } catch (error) {
            console.error(`RenterPage: Lỗi khi hủy hợp đồng ID ${contractIdToTerminate}:`, error);
            alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể hủy hợp đồng.'}`);
            // return Promise.reject(error); // Báo thất bại
             throw new Error(error.response?.data?.message || error.message || 'Lỗi hủy hợp đồng.'); // Ném lỗi để ContractTabContent xử lý loading
        }
    };
    // --- KẾT THÚC HÀM HỦY HỢP ĐỒNG ---


    const handleTabClick = (tabName) => {
        if (showMemberForm) return; // Không cho chuyển tab khi form đang mở (tùy chọn)
        setActiveTab(tabName);
    };

    const tabStyle = { padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent', color: '#666', fontWeight: '500' };
    const activeTabStyle = { ...tabStyle, color: '#007bff', borderBottom: '3px solid #007bff' };

    return (
        <div style={{ display: "flex", height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
             <div style={{ background: '#1B2428', width: "20%", minWidth: '250px', color: 'white', display: 'flex', flexDirection: 'column' }}>
                 {/* ... code sidebar ... */}
                 <div style={{ height: 84, background: '#1B2428', borderBottom: '1px #21373D solid', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
                     <AnimatedSignature text="QUẢN LÝ PHÒNG TRỌ" />
                 </div>
                 <div style={{ flexGrow: 1, overflowY: 'auto' }}> <MainContainer /> </div>
                 <div style={{ padding: '15px', borderTop: '1px solid #21373D' }}> <input type="search" placeholder="Search" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: 'none', background: '#2C3A40', color: 'white' }} /> </div>
             </div>

            {/* Right Content Area */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
                 {/* Fixed Header */}
                  <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>Thông tin khách thuê</p>
                      <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
                  </div>

                  
                    {/* === KHU VỰC TAB VÀ NÚT QUAY LẠI === */}
                {/* Chỉ hiển thị khi không mở form thành viên (hoặc logic tương tự nếu RenterForm giờ phức tạp hơn) */}
                {/* Hiện tại, giả sử chỉ form thành viên mới ẩn khu vực này */}
                {!showMemberForm && (
                    <div style={{
                        height: 50,
                        width: 'calc(80% - 0px)', // Điều chỉnh nếu cần
                        background: 'white',
                        borderBottom: '1px #E0E0E0 solid',
                        display: 'flex',
                        justifyContent: 'space-between', // Đẩy nút Quay lại sang phải
                        alignItems: 'center',
                        position: 'fixed',
                        top: 83, // Ngay dưới header
                        right: 0,
                        zIndex: 9,
                        padding: '0 20px' // Padding hai bên
                    }}>
                        {/* --- Phần hiển thị các Tab --- */}
                        <div style={{ display: 'flex' }}>
                            <div
                                style={activeTab === 'renter' ? activeTabStyle : tabStyle}
                                onClick={() => handleTabClick('renter')}
                            >
                                Người thuê
                            </div>
                            <div
                                style={activeTab === 'member' ? activeTabStyle : tabStyle}
                                onClick={() => handleTabClick('member')}
                            >
                                Thành viên
                            </div>
                            <div
                                style={activeTab === 'contract' ? activeTabStyle : tabStyle}
                                onClick={() => handleTabClick('contract')}
                            >
                                Hợp đồng
                            </div>
                        </div>
                        {/* --- Kết thúc phần Tab --- */}

                        {/* Nút Quay lại */}
                        <Button label='Quay lại' class_name='delete-btn btn' onClick={() => navigate(-1)} />
                    </div>
                )}
                 {/* === KẾT THÚC KHU VỰC TAB === */}

                 {/* Scrollable Content Area */}
                 {/* Tăng padding top nếu đang hiển thị form và không có tabs */}
                <div style={{ paddingTop: showMemberForm ? '90px' : '140px', flexGrow: 1, overflowY: 'auto' }}>
                    
                    {/* Fixed Tabs and Back Button Area - Chỉ hiển thị khi không mở form thành viên */}
                  {!showMemberForm && (
                         <>
                            {activeTab === 'renter' && (
                                // Luôn render RenterForm, nó sẽ tự xử lý add/edit mode
                                <RenterForm
                                    renterData={renterData} // Truyền null nếu là thêm mới
                                    roomId={roomId}       // Luôn truyền roomId
                                    onSaveSuccess={handleRenterSaveSuccess} // Callback khi lưu renter thành công
                                    onDeleteRenter={handleSoftDeleteTenant} // Hàm xử lý xóa/rời đi
                                />
                            )}
                            {activeTab === 'member' && (
                                <MembersTabContent
                                    members={membersData}
                                    onAddMemberClick={handleShowAddMemberForm} // Mở MemberForm để thêm member
                                    onEditMemberClick={handleShowEditMemberForm} // Mở MemberForm để sửa member
                                    onDeleteMember={handleSoftDeleteTenant} // Hàm xóa member
                                />
                            )}
                            {activeTab === 'contract' && (
                                <ContractTabContent
                                contractData={contractData}
                                roomId={roomId} // Truyền roomId để biết thêm mới cho phòng nào
                                onSave={handleSaveContract} // Hàm xử lý lưu
                                    onTerminate={handleTerminateContract} // Hàm xử lý hủy
                                    representativeTenantId={renterData?.MaKhachThue || renterData?.id}
                           />
                            )}
                         </>
                     )}
                    {/* Thêm log để xem giá trị state ngay trước khi render */}
                    {console.log("RenterPage - Rendering content area, showMemberForm:", showMemberForm)}

                     {/* Chỉ render MemberForm khi cần thêm/sửa THÀNH VIÊN */}
                     {showMemberForm && (
                         <MemberForm
                             initialData={editingMember} // Dữ liệu thành viên cần sửa (null nếu thêm)
                             roomId={roomId}
                             // isRepresentative phải là FALSE vì form này chỉ dùng cho thành viên
                             isRepresentative={false}
                             // Callback riêng cho lưu thành viên thành công
                             onSave={handleSaveMember}
                             onClose={handleCloseMemberForm}
                         />
                     )}
                </div>
            </div>
        </div>
    );
};

export default RenterPage;