import React from "react";
import AnimatedSignature from "../components/AnimatedSignature";
import MainContainer from "../components/MainContainer";
import Header from "../components/Header";
import SubHeader from "../components/SubHeader";

const Homepage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <div style={{ width: 384, height: 84, left: 0, top: 0, background: '#1B2428', borderBottom: '1px #21373D solid' }}>
            <div style={{ width: 363, height: 65, left: 10, top: 9, position: 'absolute', textAlign: 'center', color: 'white', fontSize: 32, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word' }}>
                <AnimatedSignature text="Quản Lý Phòng Trọ" />
            </div>
        </div>
            <MainContainer />
            <Header />
            <SubHeader />
        </div>
    );
};

export default Homepage