import React from 'react';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
    return (
        <div style={{ width: 384, height: 912, left: 0, top: 168, background: '#1B2428' }}>
            <SidebarItem title="Home" />
            <SidebarItem title="Dịch vụ" />
            <SidebarItem title="Chỉ số điện" />
            <SidebarItem title="Chỉ số nước" />
            <SidebarItem title="Phát sinh" />
            <SidebarItem title="Tính tiền" />
            <SidebarItem title="Lịch sử gửi Email/SMS" />
            <SidebarItem title="Báo cáo" />
            <SidebarItem title="Nhân viên" />
        </div>
    );
};

export default Sidebar;