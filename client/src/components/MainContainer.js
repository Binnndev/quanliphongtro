import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import UserGreeting from './UserGreeting';

const MainContainer = ({ onSelectPage, currentPage }) => {
    return (
        <div style={{ width: 384, height: '835px', display: 'flex', flexDirection: 'column',alignItems: 'center', background: '#1B2428'}}>
            <UserGreeting name_user="Trần Đình Vũ"/>
            <Dashboard title='Chào mừng đến với nhà trọ'/>
            <Sidebar onSelectPage = {onSelectPage} currentPage={currentPage} />
            
        </div>
    );
};

export default MainContainer;