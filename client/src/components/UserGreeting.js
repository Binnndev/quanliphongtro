import React from 'react';

const UserGreeting = ({name_user}) => {
    return (
        <div style={{ left: 0, top: 0, textAlign: 'center', margin: '10px 0 -2px 0' }}>
            <span style={{ color: 'white', fontSize: 20, fontWeight: '400', wordWrap: 'break-word' }}>Xin chào, </span>
            <span style={{ color: 'white', fontSize: 20, fontStyle: 'italic', fontWeight: '400', wordWrap: 'break-word' }}>{name_user}</span>
        </div>
    );
};

export default UserGreeting;