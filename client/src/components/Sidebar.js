// src/components/Sidebar.js
import React from 'react';
import SidebarItem from './SidebarItem';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ onSelectPage, currentPage }) => {
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const navigate = useNavigate(); // <<< Initialize navigate
    const location = useLocation(); // <<< Get current location
    const roomId = localStorage.getItem("roomId");

    return (
        // Bỏ style cố định chiều cao nếu muốn sidebar co giãn theo nội dung
        <div style={{ width: 384, /* height: 912, */ background: '#1B2428' }}>
            <SidebarItem
                title="Home" // Trang chủ/Dashboard tùy loại TK
                inconName='fa-solid fa-house'
                isActive={currentPage === "home"}
                onClick={() => onSelectPage("home")}
            />
            {/* Mục chỉ có Chủ trọ thấy */}
            {loaiTaiKhoan === "Chủ trọ" && (
                <>
                    <SidebarItem
                        title="Dashboard" // Thống kê chung
                        inconName="fa-solid fa-chart-pie"
                        isActive={currentPage === "thongke"}
                        onClick={() => onSelectPage("thongke")}
                    />
                     <SidebarItem
                         title="Loại phòng"
                         inconName="fa-solid fa-bed"
                         isActive={currentPage === "loaiPhong"}
                         onClick={() => onSelectPage("loaiPhong")}
                     />
                </>
            )}

            {/* Mục chung cho cả hai */}
            
            {loaiTaiKhoan === "Khách thuê" && (
                <SidebarItem
                    title="Thông Tin Thuê" // Hoặc "Hồ sơ thuê"
                    inconName="fa-solid fa-address-card" // Icon thẻ căn cước/hồ sơ
                    isActive={currentPage === "khachthue"} // Đặt key cho trang mới là 'profile'
                    onClick={() => onSelectPage("khachthue")} // Gọi hàm để chuyển sang trang 'profile'
                />
            )}
            <SidebarItem
                title="Dịch vụ"
                inconName='fa-solid fa-hands-holding-circle'
                isActive={currentPage === "dichVu"}
                onClick={() => onSelectPage("dichVu")}
            />
             <SidebarItem
                 title="Chỉ số điện"
                 inconName='fa-solid fa-bolt'
                 isActive={currentPage === "dien"}
                 onClick={() => onSelectPage("dien")}
             />
             <SidebarItem
                 title="Chỉ số nước"
                 inconName='fa-solid fa-faucet-drip'
                 isActive={currentPage === "nuoc"}
                 onClick={() => onSelectPage("nuoc")}
             />
            <SidebarItem
                // Đổi tên tùy theo loại tài khoản
                title={loaiTaiKhoan === "Chủ trọ" ? "Tính tiền & Hóa đơn" : "Hóa đơn & Thanh toán"}
                // Đổi icon nếu muốn
                inconName={loaiTaiKhoan === "Chủ trọ" ? 'fa-solid fa-calculator' : 'fa-solid fa-file-invoice-dollar'}
                isActive={currentPage === "tinhTien"} // Giữ key page là "tinhTien"
                onClick={() => onSelectPage("tinhTien")}
            />
            <SidebarItem
                title="Thông báo"
                inconName='fa-solid fa-bell' // Đổi icon thành chuông?
                isActive={currentPage === "thongbao"}
                onClick={() => onSelectPage("thongbao")}
            />

            

        </div>
    );
};

export default Sidebar;