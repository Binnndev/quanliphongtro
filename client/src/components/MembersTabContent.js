import React from 'react'; // Bỏ useState nếu không dùng state nội bộ ở đây
import { useNavigate } from "react-router-dom";
import Button from './Button';
import axios from 'axios'; // Thêm axios nếu cần gọi API
// import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Bỏ comment nếu dùng react-icons

// --- Component hiển thị nội dung cho Tab Thành viên ---
const MembersTabContent = ({ members, onAddMemberClick, onEditMemberClick, onDeleteMember  }) => {
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
            {/* Nút Thêm */}
            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                 {/* Sử dụng Button component hoặc button thường */}
                 {/* <Button label='Thêm' class_name='green-btn btn' onClick={handleAddMember} /> */}
                 <button className='green-btn btn' onClick={handleAddMember} >Thêm</button>
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
                            displayMembers.map((member, index) => (
                                <tr key={member.id || index} >
                                    <td style={tdCenterStyle}>{member.HoTen}</td>
                                    <td style={tdCenterStyle}>{member.CCCD}</td>
                                    <td style={tdCenterStyle}>{member.SoDienThoai}</td>
                                    <td style={tdCenterStyle}>{member.Email}</td>
                                    <td style={tdCenterStyle}>{formatDateForInput(member.NgaySinh)}</td>
                                    <td style={tdCenterStyle}>{member.GioiTinh}</td>
                                    <td style={{...tdCenterStyle, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={member.GhiChu}>{member.GhiChu}</td>
                                    {/* <td style={tdCenterStyle}>{member.AnhGiayTo}</td> */}
                                    <td style={{...tdCenterStyle, whiteSpace: 'nowrap'}}>
                                        <button onClick={() => handleEditMember(member)} style={actionButtonStyle} title="Sửa">✏️</button>
                                        <button onClick={() => handleDeleteMember(member)} style={{ ...actionButtonStyle, color: 'red' }} title="Xóa">🗑️</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                                    Chưa có thành viên nào.
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