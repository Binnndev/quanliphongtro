import React from 'react'; // Bỏ useState nếu không dùng state nội bộ ở đây
import { useNavigate } from "react-router-dom";
import Button from './Button';
import axios from 'axios'; // Thêm axios nếu cần gọi API
// import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Bỏ comment nếu dùng react-icons
import { FaEdit, FaTrashAlt, FaUserCheck } from 'react-icons/fa'; // Thêm icon mới

// --- Component hiển thị nội dung cho Tab Thành viên ---
const MembersTabContent = ({ members, onAddMemberClick, onEditMemberClick, onDeleteMember, onChangeRepresentative, currentRepresentativeId, maxOccupancy }) => {
    const navigate = useNavigate(); // Vẫn giữ nếu cần cho việc khác

    // Gọi prop function thay vì xử lý trực tiếp
    const handleAddMember = () => {
        console.log("MembersTabContent: Nút Thêm được nhấn."); // Kiểm tra 1: Nút có hoạt động không?
        if (onAddMemberClick) {
            console.log("MembersTabContent: Gọi hàm onAddMemberClick từ props..."); // Kiểm tra 2: Có gọi prop không?
            onAddMemberClick(); // Gọi hàm được truyền từ RenterPage
        } else {
            console.error("MembersTabContent: Prop onAddMemberClick không tồn tại!"); // Lỗi nếu prop chưa được truyền xuống
        }
    };

    // Gọi prop function và truyền dữ liệu thành viên cần sửa
    const handleEditMember = (member) => { // Truyền cả object member
        if (onEditMemberClick) {
            onEditMemberClick(member);
        } else {
             console.warn("onEditMemberClick prop is missing!");
        }
    };

    const handleDeleteMember = (member) => {
        // Sử dụng ID nhất quán (MaKhachThue hoặc id)
        const memberId = member.MaKhachThue || member.id;
        if (!memberId) {
             console.error("Lỗi: Không xác định được ID thành viên để xóa.");
             return;
        }

        // Thay đổi thông báo xác nhận cho phù hợp với soft delete
        if (window.confirm(`Bạn có chắc muốn cập nhật trạng thái rời đi cho thành viên ID: ${memberId}?`)) {
            console.log("MembersTabContent: Yêu cầu xóa (cập nhật trạng thái) thành viên ID:", memberId);
            // Gọi hàm prop từ RenterPage thay vì gọi API trực tiếp
            if (onDeleteMember) {
                onDeleteMember(memberId); // Truyền ID lên cho component cha xử lý
            } else {
                console.error("MembersTabContent: Prop onDeleteMember không tồn tại!");
            }
        }
    };

    // --- Hàm xử lý khi nhấn nút đổi người đại diện ---
    const handleChangeRepresentativeClick = (member) => {
        const memberId = member.MaKhachThue || member.id;
         if (!memberId) {
             console.error("Lỗi: Không xác định được ID thành viên để đặt làm đại diện.");
             return;
         }
         // Không cần confirm ở đây nữa vì RenterPage sẽ confirm
         if (onChangeRepresentative) {
             console.log(`MembersTabContent: Yêu cầu đổi đại diện sang ID: ${memberId}`);
             onChangeRepresentative(memberId); // Gọi hàm prop từ RenterPage
         } else {
             console.error("MembersTabContent: Prop onChangeRepresentative không tồn tại!");
         }
    };
    // ----------------------------------------------


    const displayMembers = members && members.length > 0 ? members : [];
    // --- Kết thúc dữ liệu mẫu ---

    // --- Styles ---
    const thStyle = { padding: '12px 15px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap' };
    const tdLeftStyle = { padding: '10px 15px', textAlign: 'left', fontSize: '0.9rem', verticalAlign: 'middle', borderBottom: '1px solid #eee' };
    const tdCenterStyle = { ...tdLeftStyle, textAlign: 'center' };
    const actionButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', margin: '0 3px', fontSize: '1rem' };
    const tableContainerStyle = { width: '100%', overflowX: 'auto' };

    const formatDateForInput = (dateString) => {
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


    return (
        <div style={{ padding: '20px' }}>
            {/* Tiêu đề và Nút Thêm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                 <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>Danh sách thành viên</h3>
                 <button className='green-btn btn' onClick={handleAddMember}>+ Thêm thành viên</button>
            </div>

            {/* Bảng dữ liệu */}
            <div style={tableContainerStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={thStyle}>Họ và tên</th>
                            <th style={thStyle}>CCCD</th>
                            <th style={thStyle}>Số điện thoại</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Ngày sinh</th>
                            <th style={thStyle}>Giới tính</th>
                            <th style={thStyle}>Ghi chú</th>
                            {/* <th style={thStyle}>Ảnh giấy tờ</th> */}
                            <th style={thStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                    {displayMembers.length > 0 ? (
                            displayMembers.map((member, index) => {
                                const memberId = member.MaKhachThue || member.id;
                                // Kiểm tra xem thành viên này có phải là người đại diện hiện tại không
                                const isCurrentRep = String(memberId) === String(currentRepresentativeId);

                                return (
                                    <tr key={memberId || index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdLeftStyle}>{member.HoTen || 'N/A'}</td>
                                        <td style={tdCenterStyle}>{member.CCCD || 'N/A'}</td>
                                        <td style={tdCenterStyle}>{member.SoDienThoai || 'N/A'}</td>
                                        <td style={tdLeftStyle}>{member.Email || 'N/A'}</td>
                                        <td style={tdCenterStyle}>{formatDateForInput(member.NgaySinh)}</td>
                                        <td style={tdCenterStyle}>{member.GioiTinh || 'N/A'}</td>
                                        <td style={{ ...tdLeftStyle, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={member.GhiChu || ''}>
                                            {member.GhiChu || 'N/A'}
                                        </td>
                                        <td style={{ ...tdCenterStyle, whiteSpace: 'nowrap' }}>
                                            {/* Nút Sửa */}
                                            <button onClick={() => handleEditMember(member)} style={{ ...actionButtonStyle, color: '#007bff' }} title="Sửa">
                                                <FaEdit />
                                            </button>
                                            {/* Nút Xóa (Đánh dấu rời đi) */}
                                            <button onClick={() => handleDeleteMember(member)} style={{ ...actionButtonStyle, color: '#dc3545' }} title="Đánh dấu rời đi">
                                                <FaTrashAlt />
                                            </button>

                                            {/* === NÚT MỚI: ĐẶT LÀM NGƯỜI ĐẠI DIỆN === */}
                                            {/* Chỉ hiển thị nếu có hàm xử lý và thành viên này KHÔNG phải là đại diện hiện tại */}
                                            {onChangeRepresentative && !isCurrentRep && (
                                                <button
                                                    onClick={() => handleChangeRepresentativeClick(member)}
                                                    style={{ ...actionButtonStyle, color: '#28a745' }} // Màu xanh lá cây
                                                    title="Đặt làm người đại diện"
                                                >
                                                    <FaUserCheck />
                                                </button>
                                            )}
                                            {/* ====================================== */}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                                    Chưa có thành viên nào trong phòng này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembersTabContent;