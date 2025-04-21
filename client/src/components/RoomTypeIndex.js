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
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#fff',
    };
    const thStyle = {
        ...thTdStyle,
        backgroundColor: '#ebebeb',
        fontWeight: 'bold',
        textAlign: 'center',
    };
    const containerStyle = {
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
    };

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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection : 'column', padding: '20px' }}>
                        <button className='green-btn btn' onClick={onAdd}>
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
                                            <th style={thStyle}>Diện tích (m²)</th>
                                            <th style={thStyle}>Số người tối đa</th>
                                            <th style={thStyle}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roomTypes.map((type) => (
                                            <tr key={type.MaLoaiPhong}>
                                                <td style={thTdStyle}>{type.TenLoai}</td>
                                                <td style={thTdStyle}>{type.Gia ? type.Gia.toLocaleString('vi-VN') : 'N/A'}</td>
                                                <td style={thTdStyle}>{type.DienTich || 'N/A'}</td>
                                                <td style={thTdStyle}>{type.SoNguoiToiDa || 'N/A'}</td>
                                                <td style={thTdStyle}>
                                                    <button
                                                        className='blue-btn btn'
                                                        onClick={() => onEdit(type)}
                                                        title="Sửa loại phòng"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button
                                                        className='delete-btn btn'
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
        </div>
    );
};


export default RoomTypeIndex;