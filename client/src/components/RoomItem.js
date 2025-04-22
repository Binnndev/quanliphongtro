import React from "react";
import Button from "./Button";

// Helper function to format currency (optional, but recommended)
const formatCurrency = (value) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  // Helper function to determine status color (optional)
  const getStatusStyle = (status) => {
    switch (status) {
      case "Còn phòng":
        return { color: 'green', fontWeight: 'bold' };
      case "Hết phòng":
        return { color: 'red', fontWeight: 'bold' };
      case "Đang bảo trì":
        return { color: 'orange', fontWeight: 'bold' };
      default:
        return { color: 'grey' };
    }
  };

const RoomItem = ({ room, loaiTaiKhoan, onEdit, onDelete, onTenantAction }) => {
    // Ensure room object exists before trying to access properties
  if (!room) {
    return null; // Or return a placeholder/error component
  }
    
      // Tìm đối tượng khách thuê là người đại diện
    const representativeTenant = (Array.isArray(room.Tenants) && room.Tenants.length > 0)
    ? room.Tenants.find(tenant => tenant && tenant.LaNguoiDaiDien === true) // Tìm người có LaNguoiDaiDien = true
    : null; // Nếu không có mảng Tenants hoặc mảng rỗng, kết quả là null

    // Lấy tên của người đại diện nếu tìm thấy, ngược lại hiển thị thông báo phù hợp
    const tenantName = representativeTenant
    ? representativeTenant.HoTen // Lấy họ tên của người đại diện
    : (Array.isArray(room.Tenants) && room.Tenants.length > 0 ? "Chưa có người đại diện" : "Chưa có khách"); // Phân biệt trường hợp có khách nhưng không có ai là đại diện và trường hợp chưa có khách nào
    const { MaPhong, TenPhong = "N/A", TrangThai = "Không xác định" } = room;
    const isLandlord = loaiTaiKhoan === "Chủ trọ"; // Check if user is landlord
  const isAvailable = TrangThai === "Còn phòng";
  const isRented = TrangThai === "Hết phòng";
    const isUnderMaintenance = TrangThai === "Đang bảo trì";

    const handleEditClick = () => {
        if (onEdit) {
          onEdit(MaPhong); // Pass room ID back to parent handler
        } else {
          console.warn("onEdit handler not provided to RoomItem");
        }
    };
    
    const handleDeleteClick = () => {
        // Optional: Add confirmation dialog here
        if (window.confirm(`Bạn có chắc muốn xóa ${TenPhong} không?`)) {
            if (onDelete) {
                onDelete(MaPhong); // Pass room ID back to parent handler
            } else {
                console.warn("onDelete handler not provided to RoomItem");
            }
        }
      };
    
      const handleTenantClick = (e) => {
        e.stopPropagation();
        if (MaPhong && onTenantAction) {
            onTenantAction(MaPhong); // Gọi hàm từ props Home truyền xuống
        } else {
             console.warn("onTenantAction handler not provided or room ID missing in RoomItem");
        }
    };
    
    

      return (
        <div style={{ width: 275, minHeight: 230, marginBottom: '20px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", background: 'white', borderRadius: 10, overflow: 'hidden', border: '1px solid #eee', padding: '15px' }}>
    
          {/* Room Name */}
          <div style={{ width: '100%', textAlign: 'center', color: 'black', fontSize: 22, fontWeight: '600', marginBottom: '10px', wordWrap: 'break-word' }}>
            {TenPhong}
          </div>
    
          {/* Status */}
          <div style={{ width: "100%", marginBottom: '8px', display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <i className="fa-solid fa-door-open" style={{ margin: '0 10px 0 0', width: '15px', textAlign: 'center' }}></i>
            <span style={getStatusStyle(TrangThai)}>{TrangThai}</span>
          </div>
    
          {/* Tenant Info Placeholder */}
          <div style={{ width: "100%", marginBottom: '8px', display: "flex", justifyContent: "flex-start", alignItems: "center", minHeight: '20px' }}>
            <i className="fa-solid fa-user" style={{ margin: '0 10px 0 0', width: '15px', textAlign: 'center' }}></i>
            
                  
                  {<span>{tenantName}</span>}
                  
          </div>
    
          {/* Price */}
          <div style={{ width: "100%", marginBottom: '15px', display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <i className="fa-solid fa-money-bill-wave" style={{ margin: '0 10px 0 0', width: '15px', textAlign: 'center' }}></i>
            <span style={{ color: '#D84040', fontWeight: 600 }}>{formatCurrency(room.RoomType?.Gia)}</span>
          </div>
    
          {/* Action Buttons - Conditional Rendering */}
          {isLandlord && (
            <div style={{ width: "100%", borderTop: '1px solid #eee', paddingTop: '15px', marginTop: 'auto' }}>
            {/* Show "Thêm Khách" only if room is available */}
                      {isAvailable && (
                          <div style={{ marginBottom: '10px' }}>
                              <button className="blue-btn-item btn" onClick={handleTenantClick}>Thêm Khách</button>
                          </div>
                      )}
                      {isRented && (
                /* Show "Xem Khách" if room is not available */
                <div style={{ marginBottom: '10px' }}>
                    <button className="blue-btn-item btn" onClick={handleTenantClick}>Xem thông tin thuê</button>
                </div>
                      )}
                      
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <button className="green-btn-item btn" onClick={handleEditClick}>Chỉnh sửa</button>
                          <button className="delete-btn-item btn" onClick={handleDeleteClick}>Xóa</button>
              </div>
            </div>
              )}
              {!isLandlord && (
                <div style={{ width: "100%", borderTop: '1px solid #eee', paddingTop: '15px', marginTop: 'auto' }}>
                  <div style={{ marginBottom: '10px' }}>
                      <button className="blue-btn-item btn" onClick={handleTenantClick}>Xem thông tin thuê</button>
                  </div>
                </div>
              )}
    
           {/* View Mode for Tenant */}
           {!isLandlord && (
              <div style={{ width: "100%", textAlign:'center', color: 'grey', fontSize: '0.9em', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  {/* You can add more details here if needed for tenant view */}
                  <button></button>
              </div>
           )}
        </div>
      );
    };
    
    export default RoomItem;