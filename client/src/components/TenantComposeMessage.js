// src/components/TenantComposeMessage.js
import React, { useState } from 'react';
import axios from 'axios';
// Import các component UI nếu cần (FormField, Button)
// import FormField from './FormField';
// import Button from './Button';

const TenantComposeMessage = ({ tenantId, landlordMaTK }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim() || !message.trim()) {
            setError("Vui lòng nhập đầy đủ Tiêu đề và Nội dung.");
            return;
        }
        if (!tenantId || !landlordMaTK) {
             setError("Lỗi: Không xác định được người gửi hoặc người nhận.");
             return;
        }

        const payload = {
            MaNguoiGui: tenantId,
            MaNguoiNhan: landlordMaTK,
            TieuDe: title,
            NoiDung: message,
        };

        setIsSending(true);
        try {
            await axios.post('/api/notifications', payload);
            setSuccess("Đã gửi yêu cầu/phản hồi thành công!");
            setTitle(''); // Xóa form sau khi gửi
            setMessage('');
        } catch (err) {
            console.error("Lỗi khi gửi yêu cầu/phản hồi:", err);
            setError(err.response?.data?.message || "Gửi thất bại. Vui lòng thử lại.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: 'auto' }}> {/* Giới hạn chiều rộng form */}
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', fontSize: '1.4rem', color: '#333' }}>
                    Gửi Yêu cầu / Phản hồi cho Chủ trọ
                </h3>

                {error && <p style={{ color: '#dc3545', backgroundColor: '#f8d7da', /*...*/ padding: '10px 15px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                {success && <p style={{ color: '#155724', backgroundColor: '#d4edda', /*...*/ padding: '10px 15px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}


                {/* Trường Tiêu đề */}
                 <div style={{ marginBottom: '15px' }}>
                     <label htmlFor="composeTitle" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tiêu đề:</label>
                     <input
                         type="text"
                         id="composeTitle"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         required
                         maxLength={255}
                         disabled={isSending}
                         style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
                     />
                 </div>


                {/* Trường Nội dung */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="composeMessage" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nội dung:</label>
                    <textarea
                        id="composeMessage"
                        rows="8"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập nội dung yêu cầu hoặc phản hồi của bạn..."
                        required
                        disabled={isSending}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' }}
                    />
                </div>

                {/* Nút Gửi */}
                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                     <button
                         type="submit"
                         className='green-btn btn' // Sử dụng class nút của bạn
                         disabled={isSending}
                     >
                        {isSending ? 'Đang gửi...' : 'Gửi đi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantComposeMessage;