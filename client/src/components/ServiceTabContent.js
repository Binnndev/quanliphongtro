// components/ServiceTabContent.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaTrash } from "react-icons/fa";
import InvoiceDetailPopup from "./invoiceDetailPopup";
import AddRoomServiceModal from "./AddRoomServiceModal";

const ServiceTabContent = ({ roomId, renterId }) => {
  const [services, setServices] = useState([]);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchServices();
    }
  }, [roomId]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`/api/room-services/room/${roomId}`);
      if (Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ phòng:", error);
      setServices([]);
    }
  };

  const handleViewInvoice = async (maDv) => {
    try {
      const res = await axios.get(
        `/api/invoice-detail/room/${roomId}/service/${maDv}`
      );
      setInvoiceDetail(res.data);
      setShowPopup(true);
    } catch (error) {
      console.error("Lỗi khi xem chi tiết hóa đơn:", error);
    }
  };
  const handleDeleteService = async (service) => {
    if (!roomId || !service?.MaDV) return;
  
    const confirmed = window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.TenDV}" khỏi phòng?`);
    if (!confirmed) return;
  
    try {
      const response = await axios.delete(`/api/room-services`, {
        data: {
          MaPhong: roomId,
          MaDV: service.MaDV,
          NgaySuDung: service.NgaySuDung, // cần xác định đúng khóa chính
        },
      });
  
      if (response.data?.message === 'success') {
        alert('Đã xóa dịch vụ khỏi phòng.');
        fetchServices(); // reload lại danh sách dịch vụ
      } else {
        alert('Không thể xóa dịch vụ. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Lỗi khi xóa dịch vụ:', err);
      alert('Lỗi khi xóa dịch vụ.');
    }
  };

  return (
    <div className="service-tab">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
  <h3 className="service-tab__title">Dịch vụ sử dụng</h3>
  <button className="service-tab__btn-add" onClick={() => setShowAddModal(true)}>
    + Thêm dịch vụ
  </button>
</div>
      <table className="service-tab__table">
        <thead>
          <tr>
            <th>Tên Dịch Vụ</th>
            <th>Đơn giá</th>
            <th>Đơn vị tính</th>
            <th>Số lượng</th>
            <th>Xem hóa đơn</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(services) && services.length > 0 ? (
            services.map((svc, index) => (
              <tr key={index}>
                <td>{svc.TenDV}</td>
                <td>{svc.Gia.toLocaleString()} đ</td>
                <td>{svc.DonViTinh}</td>
                <td>{svc.SoLuong}</td>
                <td>
                  <button
                    className="service-tab__button-view"
                    onClick={() => handleViewInvoice(svc.MaDV)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="service-tab__action-btn delete-btn"
                    onClick={() => handleDeleteService(svc)}
><FaTrash /></button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Không có dịch vụ nào cho phòng này</td>
            </tr>
          )}
        </tbody>
      </table>

      {showPopup && invoiceDetail && (
        <InvoiceDetailPopup
          data={invoiceDetail}
          onClose={() => setShowPopup(false)}
        />
      )}
      {showAddModal && (
        <AddRoomServiceModal
        isOpen={showAddModal}
          roomId={roomId}
          onClose={() => setShowAddModal(false)}
          onServiceAdded={fetchServices}
        />
      )}
    </div>
  );
};

export default ServiceTabContent;
