import React from 'react';
import SidebarItem from './SidebarItem';

const Sidebar = ({ onSelectPage, currentPage }) => {
    return (
        <div style={{ width: 384, height: 912, left: 0, top: 168, background: '#1B2428' }}>
            <SidebarItem title="Dashboard" inconName='fa-solid fa-chart-pie' />
            <SidebarItem title="Home" inconName='fa-solid fa-house' isActive={currentPage === "home"} onClick={() => onSelectPage("home")} />
            <SidebarItem title="Dịch vụ" inconName='fa-solid fa-hands-holding-circle' isActive={currentPage === "dichVu"} onClick={() => onSelectPage("dichVu")} />
            <SidebarItem title="Chỉ số điện" inconName='fa-solid fa-bolt' isActive={currentPage === "dien"} onClick={() => onSelectPage("dien")} />
            <SidebarItem title="Chỉ số nước" inconName='fa-solid fa-faucet-drip' isActive={currentPage === "nuoc"} onClick={() => onSelectPage("nuoc")} />
            <SidebarItem title="Tính tiền" inconName='fa-solid fa-calculator' isActive={currentPage === "tinhTien"} onClick={() => onSelectPage("tinhTien")} />
            <SidebarItem title="Lịch sử gửi Email/SMS" inconName='fa-solid fa-clock-rotate-left' />
            <SidebarItem title="Báo cáo" />
        </div>
    );
};

export default Sidebar;