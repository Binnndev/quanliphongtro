// components/ModalConfirm.js
import React from 'react';

const ModalConfirm = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal">
            <div className="confirm-modal__content">
                <h3 className="confirm-modal__title">{title}</h3>
                <p className="confirm-modal__message">{message}</p>
                <div className="confirm-modal__actions">
                    <button className="confirm-modal__btn confirm-modal__btn--yes" onClick={onConfirm}>Xác nhận</button>
                    <button className="confirm-modal__btn confirm-modal__btn--no" onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirm;
