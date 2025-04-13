import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddRoomServiceModal = ({ isOpen, onClose, roomId, onConfirm }) => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
const [selectedServiceIds, setSelectedServiceIds] = useState([]);
const toggleServiceSelection = (serviceId) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      }
    };

    if (isOpen) {
      fetchServices();
      setSelectedServices({});
    }
  }, [isOpen]);

  const handleCheckboxChange = (serviceId, checked) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {}),
        selected: checked,
        quantity: prev[serviceId]?.quantity || 1
      }
    }));
  };

  const handleQuantityChange = (serviceId, value) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {}),
        selected: true,
        quantity: Number(value)
      }
    }));
  };

  const handleConfirm = async () => {
    try {
      const selected = Object.entries(selectedServices)
        .filter(([_, val]) => val.selected)
        .map(([serviceId, val]) => ({
          MaPhong: roomId,
          MaDV: serviceId,
          SoLuong: val.quantity,
          NgaySuDung: new Date().toISOString().slice(0, 10)
        }));

      await axios.post('/api/room-services', selected);
      onConfirm();
      onClose();
    } catch (error) {
      console.error('Lỗi khi thêm dịch vụ:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-service-modal">
      <div className="add-service-modal__container">
        <div className="add-service-modal__title">Thêm dịch vụ cho phòng</div>

        <div className="add-service-modal__list">
        {Array.isArray(services) && services.map((service) => (
  <tr key={service.MaDV}>
    <td>{service.TenDV}</td>
    <td>{service.Gia.toLocaleString()}</td>
    <td>{service.DonViTinh}</td>
    <td>
      <input
        type="number"
        min={1}
        defaultValue={1}
        onChange={(e) => handleQuantityChange(service.MaDV, e.target.value)}
      />
    </td>
    <td>
      <input
        type="checkbox"
        checked={selectedServiceIds.includes(service.MaDV)}
        onChange={() => toggleServiceSelection(service.MaDV)}
      />
    </td>
  </tr>
))}
        </div>

        <div className="add-service-modal__actions">
          <button className="add-service-modal__button add-service-modal__button--cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="add-service-modal__button add-service-modal__button--confirm" onClick={handleConfirm}>
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoomServiceModal;