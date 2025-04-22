// components/ServiceTabContent.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaTrash, FaPlus } from "react-icons/fa";
import InvoiceDetailPopup from "./invoiceDetailPopup";
import AddRoomServiceModal from "./AddRoomServiceModal";
import QuantityInputPopup from "./QuantityInputPopup";

const ServiceTabContent = ({ roomId }) => {
  const [services, setServices] = useState([]);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [popupServiceInfo, setPopupServiceInfo] = useState(null); // Lưu thông tin DV cho popup
  const [isSavingUsage, setIsSavingUsage] = useState(false); // State loading khi lưu usage
    const [isLoading, setIsLoading] = useState(false);
    const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");

  useEffect(() => {
    if (roomId) {
      fetchServices();
    }
  }, [roomId]);

    const fetchServices = async () => {
        setIsLoading(true); // Bật loading
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
    } finally {
        setIsLoading(false); // Tắt loading
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
      setIsLoading(true);
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
    } finally {
        setIsLoading(false); // Tắt loading
    }
  };
    
  const handleOpenQuantityPopup = (service) => {
    setPopupServiceInfo({
        MaDV: service.MaDV,
        TenDV: service.TenHienThi || service.TenDV,
        MaPhong: service.MaPhong // Cần MaPhong để gửi API
    });
    setShowQuantityPopup(true);
  };
    
  const handleSaveUsageRecord = async (quantity) => {
    if (!popupServiceInfo) return;

    setIsSavingUsage(true); // Bật loading riêng cho việc lưu usage

    try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        const response = await axios.post(`/api/room-services/add-usage`, {
            maPhong: popupServiceInfo.MaPhong,
            maDv: popupServiceInfo.MaDV,
            soLuong: quantity
        }, config );

        if (response.status === 201) { // Created
            // alert("Đã ghi nhận sử dụng dịch vụ thành công!"); // Có thể bỏ alert nếu không muốn
            setShowQuantityPopup(false); // Đóng popup
            setPopupServiceInfo(null);   // Reset info
            fetchServices();             // Tải lại danh sách để cập nhật tổng số lượng
        } else {
             // Xử lý trường hợp API trả về status khác 201 nhưng không phải lỗi
             console.warn("API /api/service-usage trả về status:", response.status);
             alert(`Lưu thành công với mã: ${response.status}. Vui lòng kiểm tra lại.`);
             setShowQuantityPopup(false);
             setPopupServiceInfo(null);
             fetchServices();
        }

    } catch (error) {
        console.error("Lỗi khi lưu sử dụng dịch vụ:", error.response?.data || error.message);
        // Hiển thị lỗi cụ thể từ backend nếu có
        alert(`Lỗi khi lưu: ${error.response?.data?.message || 'Không thể kết nối tới máy chủ.'}`);
        // Không đóng popup khi lỗi để người dùng thử lại
    } finally {
        setIsSavingUsage(false); // Tắt loading lưu usage
    }
  };
    


  return (
    <div className="service-tab">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
  <h3 className="service-tab__title">Dịch vụ sử dụng</h3>
              {loaiTaiKhoan === "Chủ trọ" && (
    <button className="service-tab__btn-add" onClick={() => setShowAddModal(true)}>
    + Thêm dịch vụ
                  </button>
  )}
</div>
      {/* Bảng hiển thị */}
      <table className="service-tab__table">
        <thead>
          <tr>
            <th>Tên Dịch Vụ</th>
            <th>Loại Dịch Vụ</th>
            <th>Đơn giá</th>
            <th>Đơn vị tính</th>
            <th>SL sử dụng (tháng)</th>{/* Sửa tiêu đề */}
            {loaiTaiKhoan === "Chủ trọ" && <th>Hành động</th>} {/* Chỉ hiển thị cho Chủ trọ */}
          </tr>
        </thead>
        <tbody>
          {isLoading ? ( // Hiển thị loading khi đang fetch
             <tr><td colSpan="6" style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td></tr>
          ) : Array.isArray(services) && services.length > 0 ? (
            services.map((svc) => (
              <tr key={`${svc.MaDV}-${svc.MaPhong}`} > {/* Key cần unique */}
                <td>{svc.TenHienThi || svc.TenDV}</td>
                <td>{svc.LoaiDV}</td>
                <td>{svc.isUtility ? svc.Gia.toLocaleString() : (svc.Gia ? svc.Gia.toLocaleString() : 'N/A')} đ</td> {/* Xử lý giá điện nước */}
                <td>{svc.DonViTinh}</td>
                <td>
                    {/* Hiển thị chỉ số nếu là Điện/Nước */}
                    {svc.isUtility && svc.ChiSoCuoi !== undefined ?
                     `${svc.SoLuong} (${svc.ChiSoDau} → ${svc.ChiSoCuoi})` :
                     svc.SoLuong
                    }
                </td>
                    {loaiTaiKhoan === "Chủ trọ" && (
                    <td>
                    <div className="action-buttons">
                      {/* Nút +: Chỉ hiển thị cho loại 'Theo số lượng' và không phải Điện/Nước */}
                      {svc.LoaiDV === 'Theo số lượng' && !svc.isUtility && (
                        <button
                          className="service-tab__button-increment" // Giữ class cũ hoặc đổi tên
                          onClick={() => handleOpenQuantityPopup(svc)}
                          disabled={isLoading} // Disable khi đang load chung
                          title="Thêm lượt sử dụng"
                        >
                          <FaPlus />
                        </button>
                      )}
  
                      {/* Nút Xem chi tiết hóa đơn */}
                      {/* Có thể không cần thiết cho điện nước ở đây? Tùy logic xem hóa đơn */}
                      {/* {(!svc.isUtility || canViewUtilityInvoice) && ( */}
                          
                      {/* )} */}
  
  
                      {/* Nút Xóa: Không cho xóa Điện/Nước */}
                      {!svc.isUtility && (
                          <button
                              className="service-tab__button-delete"
                              onClick={() => handleDeleteService(svc)}
                              disabled={isLoading}
                              title="Xóa đăng ký dịch vụ khỏi phòng" // Title rõ hơn
                          >
                              <FaTrash />
                          </button>
                      )}
                    </div>
                        </td>
                  )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>Không có dịch vụ nào được đăng ký/sử dụng.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- Render các Modal --- */}
      {showAddModal && (
        <AddRoomServiceModal
          isOpen={showAddModal}
          roomId={roomId}
          onClose={() => setShowAddModal(false)}
          onServiceAdded={fetchServices}
          existingServices={services}
        />
      )}
      {/* Render Popup nhập số lượng */}
      {showQuantityPopup && popupServiceInfo && (
            <QuantityInputPopup
                isOpen={showQuantityPopup}
                onClose={() => setShowQuantityPopup(false)}
                onSave={handleSaveUsageRecord}
                serviceInfo={popupServiceInfo}
                isSaving={isSavingUsage} // Truyền trạng thái loading lưu usage
            />
       )}
    </div>
  );
};

export default ServiceTabContent;
