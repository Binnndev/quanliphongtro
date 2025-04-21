// src/components/LoaiPhongIndex.js
import React from 'react';
import UserIcon from './UserIcon'; // Giả sử bạn có một component UserIcon để hiển thị icon người dùng

const RoomTypeIndex = ({
    roomTypes,
    loading,
    onAdd, // Hàm để mở modal thêm
    onEdit, // Hàm để mở modal sửa, nhận vào data loại phòng
    onDelete, // Hàm xử lý xóa, nhận vào id và tên loại phòng
}) => {
  // --- Style cơ bản ---
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };
  const thTdStyle = {
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'center',
  };
  const thStyle = {
    ...thTdStyle,
    backgroundColor: '#f2f2f2',
      fontWeight: 'bold',
    textAlign: 'center',
  };
  const buttonStyle = {
    marginRight: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
  };
  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6', // Blue
  };
  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444', // Red
  };
  const addButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#10b981', // Green
    marginBottom: '15px',
    float: 'right', // Đặt nút Thêm bên phải
  };
  const containerStyle = {
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: '#fff',
  };
  // --- Kết thúc Style ---

  if (loading) {
    return (
        <div style={containerStyle}>
            <p style={{ textAlign: 'center', marginTop: '30px' }}>Đang tải danh sách loại phòng...</p>
        </div>
    );
  }

    return (
        <div style={{ display: "flex", height: '100vh', position: 'fixed', top: 0, justifyContent: 'center', width: "100%", overflow: 'hidden' }}>
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
                <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>Quản lý Loại Phòng</p> {/* Tiêu đề chung */}
                    <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
                </div>
                
                <div style={{ paddingTop: '83px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <button style={addButtonStyle} onClick={onAdd}>
                        <i className="fa-solid fa-plus"></i> Thêm Loại Phòng
                    </button>
                    {roomTypes.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'grey' }}>
          Bạn chưa định nghĩa loại phòng nào.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Tên Loại Phòng</th>
              <th style={thStyle}>Giá (VNĐ)</th>
              {/* *** THÊM CỘT MỚI *** */}
              <th style={thStyle}>Diện tích (m²)</th>
              <th style={thStyle}>Số người tối đa</th>
              <th style={thStyle}>Mô Tả</th>
              <th style={thStyle}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map((type) => (
              <tr key={type.MaLoaiPhong}>
                {/* Sửa lại tên trường từ model: TenLoai */}
                <td style={thTdStyle}>{type.TenLoai}</td>
                <td style={thTdStyle}>{type.Gia ? type.Gia.toLocaleString('vi-VN') : 'N/A'}</td>
                {/* *** THÊM DỮ LIỆU CỘT MỚI *** */}
                <td style={thTdStyle}>{type.DienTich || 'N/A'}</td>
                <td style={thTdStyle}>{type.SoNguoiToiDa || 'N/A'}</td>
                <td style={thTdStyle}>{type.MoTa || 'Không có'}</td>
                <td style={thTdStyle}>
                  <button
                    style={editButtonStyle}
                    // Đổi tên trường TenLoaiPhong -> TenLoai nếu hàm onDelete dùng tên
                    onClick={() => onEdit(type)}
                    title="Sửa loại phòng"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    style={deleteButtonStyle}
                    // Đổi tên trường TenLoaiPhong -> TenLoai nếu hàm onDelete dùng tên
                    onClick={() => onDelete(type.MaLoaiPhong, type.TenLoai)}
                    title="Xóa loại phòng"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
                </div>
      
          </div>
      
    </div>
  );
};


export default RoomTypeIndex;