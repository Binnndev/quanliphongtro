import React from 'react';

const SidebarItem = ({ title }) => {
    return (
        <div className='baritem' style={{height: 59, left: 0, background: '#1B2428', display: 'flex' }}>
            <div style={{ width: 36, height: 36, left: 18, margin: '0 20px', top: 12, background: '#1F3136', borderRadius: 6, border: '1px #254449 solid' }} />
            <div style={{ width: 251, color: 'white', fontSize: 20, fontWeight: '400', wordWrap: 'break-word' }}>
                {title}
            </div>
        </div>
    );
};

export default SidebarItem;