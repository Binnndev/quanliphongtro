import React from 'react';

const Dashboard = ({title}) => {
    return (
        <div style={{ width: 384, left: 0, top: 0, borderBottom: '#1F3136 1px solid', paddingBottom: '10px' }}>
            <div style={{left: 15, top: 0, color: '#F5ECD5', textAlign: 'center', fontSize: 22, fontWeight: '400', wordWrap: 'break-word' }}>
                {title}
            </div>
            {/* Add more dashboard components here if needed */}
        </div>
    );
};

export default Dashboard;