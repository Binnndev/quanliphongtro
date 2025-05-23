import React, { useState, useEffect, use } from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer";
import Button from "../components/Button";
import UserIcon from "../components/UserIcon";
import { useNavigate, useParams, useLocation } from "react-router-dom"; // Thêm useParams nếu cần lấy ID từ URL
import axios from "axios"; // Nếu bạn sử dụng axios để gọi API

// Import các component nội dung tab và form mới
import RenterForm from "../components/RenterForm";
import MembersTabContent from "../components/MembersTabContent";
import ContractTabContent from "../components/ContractTabContent";
import InvoiceDetailPopup from "../components/invoiceDetailPopup";
import ServiceTabContent from "../components/ServiceTabContent";
import MemberForm from "../components/MemberForm"; // Import form thành viên

const RenterPage = ({ roomId, setPage }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    // const roomId = localStorage.getItem("roomId"); // Lấy ID phòng từ URL
    console.log(roomId);  // Kiểm tra giá trị của roomId

    const [activeTab, setActiveTab] = useState('renter'); // Ví dụ bắt đầu ở tab thành viên

    // State phòng
    const [roomData, setRoomData] = useState(null); // Dữ liệu phòng

    // State cho dữ liệu (ví dụ)
    const [renterData, setRenterData] = useState(null);
    const [membersData, setMembersData] = useState([]);
    const [contractData, setContractData] = useState(null);

    // State quản lý hiển thị form Thêm/Sửa thành viên
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null); // null: Thêm mới, object: Sửa

    const [isChangingRepresentative, setIsChangingRepresentative] = useState(false); // State loading mới
    const [selectedService, setSelectedService] = useState(null);
    const [showInvoiceDetailPopup, setShowInvoiceDetailPopup] = useState(false);

    

    // --- Gọi API để lấy dữ liệu ---
    useEffect(() => {
        const fetchData = async () => {
            if (roomId) {
                console.log(`RenterPage: Fetching data for room ${roomId}`);
                setIsLoading(true); // Bắt đầu loading tổng
                try {
                    const results = await Promise.allSettled([
                        getRoomData(roomId),
                        getRenterData(roomId),
                        getMembersData(roomId),
                        getContractData(roomId)
                    ]);
                    // Xử lý kết quả...
                    if (results[0].status === 'fulfilled') { console.log("Dữ liệu phòng đã được tải thành công."); }
                    if (results[1].status === 'rejected') { console.warn("Không tải được renter data."); setRenterData(null); }
                    if (results[2].status === 'rejected') { console.error("Lỗi tải members data."); setMembersData([]); }
                    if (results[3].status === 'rejected') { console.warn("Không tải được contract data."); setContractData(null); }

                } catch (error) {
                    console.error("Lỗi fetch data trang:", error);
                    setRenterData(null); setMembersData([]); setContractData(null);
                } finally {
                    setIsLoading(false); // Kết thúc loading tổng
                }
            }
        };
        if (roomId) { // Chỉ fetch nếu có roomId
            fetchData();
       } else {
            console.warn("RenterPage: Không có roomId, không fetch data.");
            // Reset state nếu cần khi không có roomId
            setRoomData(null);
            setRenterData(null);
            setMembersData([]);
            setContractData(null);
            setIsLoading(false);
       }
    }, [roomId]);

    useEffect(() => {
        console.log("RenterPage STATE UPDATE: membersData changed to:", membersData);
    }, [membersData]);

    const [isLoading, setIsLoading] = useState(true);
    const maxOccupancy = roomData?.RoomType?.SoNguoiToiDa;

    const getRoomData = async (roomId) => {
        const response = await axios.get(`/api/rooms/${roomId}`);
        if (response.status === 200) {
            setRoomData(response.data);
        } else {
            console.error("Lỗi khi lấy dữ liệu phòng:", response.statusText);
        }
    };

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

    const handleViewInvoiceDetail = (service) => {
        setSelectedService(service);
        setShowInvoiceDetailPopup(true);
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

    const handleSaveMember = async (memberFormData, isEditMode) => { // Loại bỏ selectedDocPhoto vì không dùng trực tiếp ở đây

        // Xác định ID thành viên cần cập nhật (chỉ khi sửa)
        const memberIdToUpdate = isEditMode ? (editingMember?.MaKhachThue || editingMember?.id) : null;

        // Kiểm tra ID nếu đang ở chế độ sửa
        if (isEditMode && !memberIdToUpdate) {
            console.error("RenterPage - Lỗi khi sửa: Không tìm thấy ID của thành viên đang sửa trong state 'editingMember'.");
            alert("Lỗi: Không thể xác định thành viên cần cập nhật.");
            return; // Ngăn chặn gọi API
        }

        // Xác định endpoint và method dựa trên chế độ
        const endpoint = isEditMode ? `/api/tenants/update/${memberIdToUpdate}` : '/api/tenants/add';
        const method = isEditMode ? 'PATCH' : 'POST'; // Dùng PATCH cho update

        console.log(`RenterPage: Chuẩn bị gọi ${method} ${endpoint}`);
        // Log dữ liệu FormData một cách an toàn (không hiển thị file trực tiếp)
        console.log("RenterPage: Dữ liệu gửi đi (FormData entries):", Object.fromEntries(memberFormData));

        try {
            // --- Gọi API Thực Tế ---
            const response = await axios({
                method: method,
                url: endpoint,
                data: memberFormData, // Gửi FormData
                headers: {
                   'Content-Type': 'multipart/form-data',
                    // Thêm header Authorization nếu API yêu cầu
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log("✅ RenterPage - API Response Status:", response.status);
            console.log("✅ RenterPage - API Response Data (Raw):", response.data);

            // Giả sử backend trả về object tenant đã lưu/cập nhật
            const savedDataFromApi = response.data?.tenant || response.data; // Kiểm tra nếu backend gói trong key 'tenant'

            // --- KIỂM TRA DỮ LIỆU TRẢ VỀ TỪ API ---
            if (!savedDataFromApi || typeof savedDataFromApi !== 'object' || !savedDataFromApi.MaKhachThue) {
                console.error("‼️ RenterPage - Dữ liệu trả về từ API không hợp lệ hoặc thiếu MaKhachThue!", savedDataFromApi);
                throw new Error("Dữ liệu trả về từ máy chủ không hợp lệ sau khi lưu thành viên."); // Ném lỗi để dừng
            }
            console.log("📝 RenterPage - Dữ liệu thành viên đã lưu từ API:", savedDataFromApi);

            // --- Format lại dữ liệu để nhất quán với state (nếu cần) ---
            // Đảm bảo có 'id' và các trường khác cần cho bảng hiển thị
            const formattedMember = {
                ...savedDataFromApi,
                id: savedDataFromApi.MaKhachThue, // <<< Quan trọng: Dùng MaKhachThue làm id chính
                // Các trường khác có thể đã được backend trả về đúng tên hoặc cần map lại ở đây
                HoTen: savedDataFromApi.HoTen,
                CCCD: savedDataFromApi.CCCD,
                SoDienThoai: savedDataFromApi.SoDienThoai,
                Email: savedDataFromApi.Email,
                NgaySinh: savedDataFromApi.NgaySinh,
                GioiTinh: savedDataFromApi.GioiTinh,
                GhiChu: savedDataFromApi.GhiChu,
                MaPhong: savedDataFromApi.MaPhong, // Giữ lại MaPhong nếu cần
                MaTK: savedDataFromApi.MaTK,     // Giữ lại MaTK nếu cần
                // Không cần lưu lại Room, RentalHouse,... trừ khi bảng cần trực tiếp
            };
            console.log("👍 RenterPage - Dữ liệu đã format để cập nhật state:", formattedMember);

            // --- CẬP NHẬT STATE membersData ---
            console.log("🔄 RenterPage - Chuẩn bị cập nhật state membersData...");
            if (isEditMode) {
                console.log("   -> Cập nhật state (chế độ sửa)...");
                setMembersData(prevMembers => {
                    console.log("   -> State trước khi sửa (prevMembers):", prevMembers);
                    const updated = prevMembers.map(m => {
                        // So sánh bằng MaKhachThue (ID chính)
                        const oldId = String(m.MaKhachThue || m.id);
                        const newId = String(formattedMember.MaKhachThue); // formattedMember đảm bảo có MaKhachThue
                        console.log(`   -> So sánh: oldId=<span class="math-inline">\{oldId\} vs newId\=</span>{newId}`);
                        if (oldId === newId) {
                             console.log(`   -> Match found! Thay thế bằng:`, formattedMember);
                             return formattedMember; // <<< Trả về object MỚI đã format
                        } else {
                             return m; // Giữ nguyên object cũ
                        }
                    });
                    console.log("   -> State sau khi sửa (kết quả map):", updated);
                    return updated; // Trả về mảng mới
                });
            } else { // Chế độ Thêm mới
                console.log("   -> Cập nhật state (chế độ thêm mới)...");
                setMembersData(prevMembers => {
                     console.log("   -> State trước khi thêm (prevMembers):", prevMembers);
                    // Thêm thành viên mới vào cuối mảng
                    const added = [...prevMembers, formattedMember];
                    console.log("   -> State sau khi thêm:", added);
                    return added; // Trả về mảng mới
                });
            }
            console.log("🟢 RenterPage - Đã gọi setMembersData.");

            // --- Thông báo và đóng form ---
            alert(`Đã ${isEditMode ? 'cập nhật' : 'thêm'} thành viên thành công!`);
            handleCloseMemberForm(); // Đóng form sau khi thành công

        } catch (error) { // Bắt lỗi từ axios hoặc lỗi ném ra ở trên
            console.error("❌ RenterPage - Lỗi trong quá trình handleSaveMember:", error);
            let displayMessage = "Đã xảy ra lỗi khi lưu thông tin thành viên.";
            if (error.response) { // Lỗi từ phản hồi API
                console.error("❌ Dữ liệu lỗi từ server:", error.response.data);
                displayMessage = error.response.data?.message || `Lỗi ${error.response.status} từ máy chủ.`;
            } else { // Lỗi khác (validation, logic, network...)
                displayMessage = error.message || displayMessage;
            }
            alert(`Lỗi: ${displayMessage}`);
            // Không đóng form nếu có lỗi để người dùng có thể sửa
        }
        // Không cần finally setIsLoading ở đây vì state đó thuộc về MemberForm
    };
    // --- KẾT THÚC HÀM LƯU THÀNH VIÊN ---
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

    // --- HÀM MỚI: XỬ LÝ THAY ĐỔI NGƯỜI ĐẠI DIỆN ---
    const handleChangeRepresentative = async (newRepresentativeId) => {
        if (!roomId || !newRepresentativeId) {
            console.error("Thiếu thông tin phòng hoặc ID người đại diện mới.");
            alert("Lỗi: Không thể thực hiện thay đổi người đại diện.");
            return;
        }

        // Lấy tên người được chọn để hiển thị xác nhận (tùy chọn)
        const memberToPromote = membersData.find(m => String(m.MaKhachThue || m.id) === String(newRepresentativeId));
        const memberName = memberToPromote?.HoTen || `ID ${newRepresentativeId}`;

        if (!window.confirm(`Bạn có chắc muốn đặt "${memberName}" làm người đại diện mới cho phòng này?`)) {
            return; // Hủy nếu người dùng không xác nhận
        }

        console.log(`RenterPage: Requesting representative change. Room: ${roomId}, New Rep ID: ${newRepresentativeId}`);
        setIsChangingRepresentative(true); // Bắt đầu loading

        try {
            // Gọi API backend
            const response = await axios.patch(`/api/tenants/change-representative/${roomId}/${newRepresentativeId}`);

            console.log("RenterPage: Change representative API success:", response.data);
            alert(response.data.message || `Đã đặt "${memberName}" làm người đại diện mới thành công!`);

            // --- Cập nhật lại dữ liệu sau khi thay đổi thành công ---
            // Cách đơn giản và an toàn nhất: Fetch lại cả renter và members
            setIsLoading(true); // Hiển thị loading tổng thể
            try {
                await Promise.allSettled([
                    getRenterData(roomId), // Fetch lại người đại diện mới
                    getMembersData(roomId)  // Fetch lại danh sách thành viên (đã loại bỏ người mới)
                ]);
                 setActiveTab('renter'); // Chuyển sang tab người thuê để xem kết quả
            } catch (fetchError) {
                console.error("Lỗi fetch lại dữ liệu sau khi đổi đại diện:", fetchError);
                // Dù fetch lại lỗi, vẫn cố gắng hiển thị thông báo thành công ban đầu
            } finally {
                 setIsLoading(false); // Kết thúc loading tổng thể
            }
             // ---------------------------------------------------------

        } catch (error) {
            console.error(`RenterPage: Error changing representative to ID ${newRepresentativeId}:`, error);
            alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể thay đổi người đại diện.'}`);
        } finally {
            setIsChangingRepresentative(false); // Kết thúc loading của việc đổi đại diện
        }
    };
    // --- KẾT THÚC HÀM THAY ĐỔI NGƯỜI ĐẠI DIỆN ---


    const handleTabClick = (tabName) => {
        if (showMemberForm) return; // Không cho chuyển tab khi form đang mở (tùy chọn)
        setActiveTab(tabName);
    };

    const tabStyle = { padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent', color: '#666', fontWeight: '500' };
    const activeTabStyle = { ...tabStyle, color: '#007bff', borderBottom: '3px solid #007bff' };

    return (
        <div style={{ display: "flex", height: '100vh', position: 'fixed', top:0, justifyContent: 'center', width: "100%", overflow: 'hidden' }}>
            {/* Sidebar */}
            

            

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
                {isLoading && <div className="loading-overlay">Đang tải dữ liệu...</div>} {/* Thêm overlay loading */}
                {isChangingRepresentative && <div className="loading-overlay">Đang đổi người đại diện...</div>} {/* Thêm overlay loading */}
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
                            <div
                                style={activeTab === 'service' ? activeTabStyle : tabStyle}
                                onClick={() => handleTabClick('service')}
                            >
                                Dịch vụ
                            </div>
                        </div>
                        {/* --- Kết thúc phần Tab --- */}

                        {/* Nút Quay lại */}
                        {loaiTaiKhoan === 'Chủ trọ' && (
                            <button className="delete-btn btn" onClick={() => setPage('home')}>Quay lại</button>
                        )}
                        
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
                            {activeTab === 'member' && !showMemberForm && ( // Đảm bảo không hiển thị khi form member đang mở
                             <MembersTabContent
                                    members={membersData}
                                    onAddMemberClick={handleShowAddMemberForm}
                                    onEditMemberClick={handleShowEditMemberForm}
                                    onDeleteMember={handleSoftDeleteTenant}
                                    onChangeRepresentative={handleChangeRepresentative}
                                    currentRepresentativeId={renterData?.MaKhachThue || renterData?.id}
                                    maxOccupancy={maxOccupancy}
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
                            {activeTab === 'service' && (
                                <ServiceTabContent
                                roomId={roomId}
                                    // onViewInvoiceDetail={handleViewInvoiceDetail}
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
            {showInvoiceDetailPopup && (
  <InvoiceDetailPopup
    service={selectedService}
    onClose={() => setShowInvoiceDetailPopup(false)}
  />
)}
        </div>
    );
};

export default RenterPage;