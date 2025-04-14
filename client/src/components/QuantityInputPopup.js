// components/QuantityInputPopup.js
import React, { useState, useEffect } from 'react';

const QuantityInputPopup = ({ isOpen, onClose, onSave, serviceInfo, isSaving }) => {
  const [quantity, setQuantity] = useState('1'); // Khởi tạo số lượng là 1
  const [error, setError] = useState('');

  // Reset số lượng khi mở popup mới
  useEffect(() => {
    if (isOpen) {
      setQuantity('1');
      setError('');
    }
  }, [isOpen]);

  const handleQuantityChange = (event) => {
    const value = event.target.value;
    // Chỉ cho phép nhập số nguyên không âm
    if (/^\d*$/.test(value)) {
        setQuantity(value);
        setError(''); // Xóa lỗi nếu người dùng bắt đầu nhập lại
    }
  };

  const handleSaveClick = () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ (lớn hơn 0).');
      return;
    }
    setError('');
    onSave(numQuantity); // Gọi hàm onSave truyền số lượng đã parse
  };

  if (!isOpen) return null;

  return (
    <div className="qip-modal-overlay">
      <div className="qip-modal-content">
        <h4>Thêm sử dụng: {serviceInfo?.TenDV || 'Dịch vụ'}</h4>
        <div className="qip-input-group">
          <label htmlFor="quantityInput">Số lượng sử dụng:</label>
          <input
            type="number"
            id="quantityInput"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            step="1"
            autoFocus // Tự động focus vào input khi mở
            onKeyDown={(e) => {if(e.key === 'Enter') handleSaveClick()}} // Cho phép nhấn Enter để lưu
          />
        </div>
        {error && <p className="qip-error-message">{error}</p>}
        <div className="qip-button-group">
          <button onClick={onClose} disabled={isSaving} className="qip-button-cancel">
            Hủy
          </button>
          <button onClick={handleSaveClick} disabled={isSaving} className="qip-button-save">
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityInputPopup;