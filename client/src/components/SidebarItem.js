import React from 'react';

const SidebarItem = ({ title, inconName = 'fa-solid fa-house', onClick, isActive }) => {

    const backgroundColorIsActive = isActive ? '#2C3E50' : '#1B2428';
    const textColorIsActive = isActive ? '#00D8FF' : 'white';

    return (
        <div className='baritem' onClick={onClick} style={{height: 59, left: 0, background: backgroundColorIsActive, display: 'flex', cursor:'pointer' }}>
            <div style={{ width: 36, lineHeight:'36px', textAlign:'center', height: 36, left: 18, margin: '0 20px', top: 12, background: '#1F3136', borderRadius: 6, border: '1px #254449 solid' }}>
            <i className={inconName + " baritem-icon"}></i>
            </div>
            <div style={{ width: 251, color: textColorIsActive, fontSize: 20, fontWeight: '400', wordWrap: 'break-word' }}>
                {title}
            </div>
        </div>
    );
};

export default SidebarItem;