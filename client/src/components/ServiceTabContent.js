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
        console.log("Dịch vụ phòng:", response.data);
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
      console.log(res.data);
      
      setInvoiceDetail(res.data);
      setShowPopup(true);
    } catch (error) {
      console.error("Lỗi khi xem chi tiết hóa đơn:", error);
    }
  };
  const handleDeleteService = async (service) => {
    // Kiểm tra dữ liệu đầu vào từ đối tượng service
    console.log("Dữ liệu đầu vào cho handleDeleteService:", service);

    // Lấy ID phòng và ID dịch vụ từ đối tượng service
    const roomId = service?.MaPhong;
    const serviceId = service?.MaDV;
    // Lấy tên dịch vụ để hiển thị trong thông báo xác nhận
    const serviceName = service?.TenDV || 'dịch vụ này'; // Fallback nếu không có TenDV

    // Kiểm tra xem có đủ ID để thực hiện không
    if (!roomId || !serviceId) {
        console.error("Lỗi: Thiếu MaPhong hoặc MaDV trong đối tượng service.", service);
        alert("Lỗi: Thông tin dịch vụ hoặc phòng không đầy đủ để thực hiện xóa.");
        return; // Dừng thực thi nếu thiếu ID
    }

    console.log(`Chuẩn bị xóa dịch vụ MaDV: ${serviceId} khỏi phòng MaPhong: ${roomId}`);

    // Xác nhận lại với người dùng
    const confirmed = window.confirm(`Bạn có chắc muốn xóa dịch vụ "${serviceName}" khỏi phòng này không?`);
    if (!confirmed) {
        console.log("Người dùng đã hủy thao tác xóa.");
        return; // Dừng nếu người dùng không xác nhận
    }

    try {
        const apiUrl = `/api/room-services/delete/roomId/${roomId}/serviceId/${serviceId}`;

        console.log("Gọi API DELETE tới:", apiUrl);
        const response = await axios.delete(apiUrl);

        // --- Kiểm tra HTTP status code để xác định thành công ---
        // Status 200 (OK) hoặc 204 (No Content) đều được coi là thành công
        if (response.status === 200 || response.status === 204) {
            console.log("API xóa thành công, status:", response.status);
            alert('Đã xóa dịch vụ khỏi phòng thành công.');

            // Gọi lại hàm để tải lại danh sách dịch vụ của phòng
            if (typeof fetchServices === 'function') {
                fetchServices();
            } else {
                console.warn("Hàm fetchServices() không được định nghĩa hoặc không truy cập được.");
                // Cân nhắc cách cập nhật UI khác nếu fetchServices không có sẵn
                // Ví dụ: window.location.reload(); // Tải lại trang (cách đơn giản nhất)
            }
        } else {
            // Xử lý các trường hợp status code thành công khác nếu có (ví dụ 202 Accepted)
            // Thông thường thì không cần thiết cho thao tác DELETE đơn giản
            console.warn("Thao tác thành công nhưng status code không phải 200/204:", response.status);
            alert(`Thao tác thành công với mã trạng thái: ${response.status}. Đang cập nhật danh sách.`);
            if (typeof fetchServices === 'function') {
                fetchServices();
            }
        }
    } catch (err) {
        console.error('Lỗi khi xóa dịch vụ khỏi phòng:', err.response || err); // Log lỗi chi tiết hơn

        // Cung cấp thông báo lỗi cụ thể hơn cho người dùng
        let errorMessage = 'Có lỗi xảy ra khi xóa dịch vụ.'; // Tin nhắn mặc định
        if (err.response) {
            // Server đã phản hồi với một mã trạng thái lỗi (ngoài khoảng 2xx)
            console.error("Lỗi - Dữ liệu phản hồi:", err.response.data);
            console.error("Lỗi - Trạng thái phản hồi:", err.response.status);
            // Ưu tiên lấy message lỗi từ backend nếu có
            errorMessage = err.response.data?.message || err.response.data?.error || `Lỗi từ máy chủ (mã ${err.response.status}).`;

            // Xử lý các mã lỗi phổ biến
            if (err.response.status === 404) {
                errorMessage = 'Lỗi: Không tìm thấy liên kết giữa phòng và dịch vụ này.';
            } else if (err.response.status === 403) {
                errorMessage = 'Lỗi: Bạn không có quyền thực hiện thao tác này.';
            } else if (err.response.status === 400) {
                errorMessage = `Lỗi dữ liệu không hợp lệ: ${errorMessage}`;
            }
        } else if (err.request) {
            // Request đã được gửi nhưng không nhận được phản hồi
            console.error("Lỗi mạng hoặc không có phản hồi:", err.request);
            errorMessage = 'Lỗi mạng hoặc không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối.';
        } else {
            // Lỗi xảy ra trong quá trình thiết lập request
            console.error('Lỗi thiết lập request:', err.message);
            errorMessage = `Lỗi cấu hình request: ${err.message}`;
        }
        alert(errorMessage); // Hiển thị thông báo lỗi cho người dùng
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
                    className="service-tab__button-delete"
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
        invoiceData={invoiceDetail}
          onClose={() => setShowPopup(false)}
        />
      )}
      {showAddModal && (
        <AddRoomServiceModal
        isOpen={showAddModal}
          roomId={roomId}
          onClose={() => setShowAddModal(false)}
                  onServiceAdded={fetchServices}
                  existingServices={services}
        />
      )}
    </div>
  );
};

export default ServiceTabContent;
