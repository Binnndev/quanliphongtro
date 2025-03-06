import React from 'react';
import SearchBar from './SearchBar';
import StatusRoom from './StatusRoom';
import StatusFee from './StatusFee';
import RoomLabel from './RoomLabel';
import UserIcon from './UserIcon';
import UserGreeting from './UserGreeting';

const Header = () => {
    return (
        <div style={{ width: '80%', height: 83, right: 0, top: 0, position: 'fixed', background: 'white', borderBottom: '1px #D2D2D2 solid' }}>
            <SearchBar />
            <StatusRoom />
            <StatusFee />
            <RoomLabel />
            <UserIcon />
        </div>
    );
};

export default Header;