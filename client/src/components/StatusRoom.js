import React from 'react';

const StatusRoom = () => {
    return (
        <div style={{ left: 53, top: 22, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex' }}>
            <div style={{width: '240px', alignSelf: 'stretch', height: 40, paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 12, background: 'white', borderRadius: 10, border: '1px #D9D9D9 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex' }}>
                <div style={{ flex: '1 1 0', color: '#B3B3B3', fontSize: 16, fontWeight: '400', wordWrap: 'break-word' }}>Trạng thái phòng</div>
                <div data-svg-wrapper style={{ position: 'relative' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default StatusRoom;