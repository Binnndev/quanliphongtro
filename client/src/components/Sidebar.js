import React from 'react';
import SidebarItem from './SidebarItem';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ onSelectPage, currentPage }) => {
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");
    const navigate = useNavigate();
    return (
        <div style={{ width: 384, height: 912, left: 0, top: 168, background: '#1B2428' }}>
            {loaiTaiKhoan === "Chủ trọ" && (
                <SidebarItem
                    title="Dashboard"
                    inconName="fa-solid fa-chart-pie"
                    isActive={currentPage === "thongke"}
                    onClick={() => onSelectPage("thongke")}
                />  
            )}
            
            <SidebarItem title="Home" inconName='fa-solid fa-house' isActive={currentPage === "home"} onClick={() => onSelectPage("home")} />
            {loaiTaiKhoan === "Chủ trọ" && (
                <SidebarItem
                    title="Loại phòng"
                    inconName="fa-solid fa-bed"
                    isActive={currentPage === "loaiPhong"}
                    onClick={() => onSelectPage("loaiPhong")}
                />
            )}
            <SidebarItem title="Dịch vụ" inconName='fa-solid fa-hands-holding-circle' isActive={currentPage === "dichVu"} onClick={() => onSelectPage("dichVu")} />
            <SidebarItem title="Chỉ số điện" inconName='fa-solid fa-bolt' isActive={currentPage === "dien"} onClick={() => onSelectPage("dien")} />
            <SidebarItem title="Chỉ số nước" inconName='fa-solid fa-faucet-drip' isActive={currentPage === "nuoc"} onClick={() => onSelectPage("nuoc")} />
            <SidebarItem title="Tính tiền" inconName='fa-solid fa-calculator' isActive={currentPage === "tinhTien"} onClick={() => onSelectPage("tinhTien")} />
            <SidebarItem title="Thông báo" inconName='fa-solid fa-clock-rotate-left' isActive={currentPage === "thongbao"} onClick={() => onSelectPage("thongbao")}/>
        </div>
    );
};

export default Sidebar;