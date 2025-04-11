// components/ModalDichVu.js
import React, { useState, useEffect } from 'react';

const ModalDichVu = ({ isOpen, onClose, onSave, dichVuData }) => {
    const [formData, setFormData] = useState({
        TenDV: '',
        LoaiDichVu: 'Cố định',
        DonViTinh: '',
        Gia: ''
    });

    useEffect(() => {
        if (dichVuData) setFormData(dichVuData);
        else setFormData({
            TenDV: '',
            LoaiDichVu: 'Cố định',
            DonViTinh: '',
            Gia: ''
        });
    }, [dichVuData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-dichvu">
            <div className="modal-dichvu__content">
                <h3 className="modal-dichvu__title">{dichVuData ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}</h3>

                <div className="modal-dichvu__field">
                    <label>Tên dịch vụ</label>
                    <input type="text" name="TenDV" value={formData.TenDV} onChange={handleChange} />
                </div>

                <div className="modal-dichvu__field">
                    <label>Loại dịch vụ</label>
                    <select name="LoaiDichVu" value={formData.LoaiDichVu} onChange={handleChange}>
                        <option value="Cố định">Cố định</option>
                        <option value="Theo số lượng">Theo số lượng</option>
                    </select>
                </div>

                <div className="modal-dichvu__field">
                    <label>Đơn vị tính</label>
                    <input type="text" name="DonViTinh" value={formData.DonViTinh} onChange={handleChange} />
                </div>

                <div className="modal-dichvu__field">
                    <label>Giá (VND)</label>
                    <input type="number" name="Gia" value={formData.Gia} onChange={handleChange} />
                </div>

                <div className="modal-dichvu__actions">
                    <button className="modal-dichvu__btn modal-dichvu__btn--save" onClick={handleSubmit}>Lưu</button>
                    <button className="modal-dichvu__btn modal-dichvu__btn--cancel" onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
};

export default ModalDichVu;
