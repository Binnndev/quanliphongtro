import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AddRoomServiceModal = ({ isOpen, onClose, roomId, onServiceAdded, existingServices }) => { // roomId is crucial
  const [services, setServices] = useState([]);
  // --- SIMPLIFIED STATE ---
  // Stores selected service IDs and their quantities: { serviceId: quantity }
  const [selectedData, setSelectedData] = useState({});
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null); // To display errors in the modal

  const existingServiceIds = useMemo(() => {
    return new Set(Array.isArray(existingServices) ? existingServices.map(s => s.MaDV) : []);
}, [existingServices]);
    
  useEffect(() => {
    const fetchServices = async () => {
        // Basic check if roomId is valid before fetching
        if (!roomId) {
            console.error("AddRoomServiceModal: roomId is missing, cannot fetch services.");
            setError("Không thể tải dịch vụ do thiếu thông tin phòng.");
            setServices([]); // Ensure services is empty
            return;
        }
        // Check for MaChuTro as well
        const maChuTro = localStorage.getItem('MaChuTro'); // Use getItem
        if (!maChuTro) {
             console.error("AddRoomServiceModal: MaChuTro is missing from localStorage.");
             setError("Không thể tải dịch vụ do thiếu thông tin chủ trọ.");
             setServices([]);
             return;
        }

        setLoadingServices(true);
        setError(null); // Reset error on new fetch
        try {
            // console.log('Fetching services for MaChuTro:', maChuTro);
            // Ensure the API endpoint is correct and handles the MaChuTro properly
            const response = await axios.get(`/api/service/by-chutro/${maChuTro}`);
            if (Array.isArray(response.data)) {
                 setServices(response.data);
            } else {
                 console.warn("API response for services was not an array:", response.data);
                 setServices([]);
                 setError("Dữ liệu dịch vụ nhận được không hợp lệ.");
            }
        } catch (fetchError) {
            console.error('Lỗi khi lấy danh sách dịch vụ:', fetchError.response?.data || fetchError.message);
            setError(`Lỗi tải dịch vụ: ${fetchError.response?.data?.error || fetchError.message}`);
            setServices([]); // Reset services on error
        } finally {
            setLoadingServices(false);
        }
    };

    if (isOpen) {
        fetchServices();
        const initialSelectedData = {};
        if (Array.isArray(existingServices)) {
            existingServices.forEach(svc => {
                // Đảm bảo svc và MaDV tồn tại
                if (svc && svc.MaDV !== undefined && svc.MaDV !== null) {
                    initialSelectedData[svc.MaDV] = svc.SoLuong || 1; // Lấy số lượng hiện có hoặc mặc định là 1
                }
            });
        }
        setSelectedData(initialSelectedData);
    } else {
        // Optional: Clear services when modal is closed to ensure fresh data next time
         setServices([]);
         setError(null);
    }
  }, [isOpen, roomId, existingServices]); // Add roomId dependency

  // --- COMBINED HANDLER ---
    const handleSelectionChange = (serviceId, isSelected, quantity = 1) => {
        if (existingServiceIds.has(serviceId) && !isSelected) {
            console.warn("Không thể bỏ chọn dịch vụ đã được thêm vào phòng từ trước.");
            // Không làm gì cả để checkbox không thay đổi trạng thái
            return;
        }
        setSelectedData(prev => {
            const newState = { ...prev };
            if (isSelected) {
                // Add or update service with quantity (ensure quantity is at least 1)
                newState[serviceId] = Math.max(1, Number(quantity) || 1);
            } else {
                // Remove service if deselected
                delete newState[serviceId];
            }
            return newState;
        });
    };

  const handleQuantityChange = (serviceId, value) => {
      // Only update quantity if the service is already selected
      if (selectedData.hasOwnProperty(serviceId)) {
           const quantity = Math.max(1, Number(value) || 1); // Ensure quantity >= 1
          setSelectedData(prev => ({
              ...prev,
              [serviceId]: quantity
          }));
      }
      // If not selected, changing quantity does nothing until checkbox is clicked
  };


  const handleConfirm = async () => {
    setError(null); // Reset previous errors

    // --- CRUCIAL CHECK ---
    if (!roomId) {
        console.error("handleConfirm: Cannot confirm, roomId is invalid:", roomId);
        setError("Lỗi: Không xác định được phòng để thêm dịch vụ.");
        return;
    }

    const selectedPayload = Object.entries(selectedData).map(([serviceId, quantity]) => ({
        MaPhong: roomId, // Use the validated roomId prop
        MaDV: serviceId,
        SoLuong: quantity,
        NgaySuDung: new Date().toISOString().slice(0, 10) // Format as YYYY-MM-DD
    }));

    if (selectedPayload.length === 0) {
        setError("Vui lòng chọn ít nhất một dịch vụ.");
        return;
    }

    console.log('Payload gửi đi:', selectedPayload);
    setSubmitting(true);

    try {
        // Assuming the backend expects an array of service associations
        await axios.post('/api/room-services/add', selectedPayload);
        console.log('Thêm dịch vụ thành công.');
        alert('Đã thêm dịch vụ vào phòng thành công.');
        if (typeof onServiceAdded === 'function') {
            onServiceAdded(); // Gọi hàm được truyền từ cha (fetchServices)
        }
        onClose();
    } catch (error) {
        console.error('Lỗi khi thêm dịch vụ:', error.response?.data || error.message);
        // Display specific backend error if available
        setError(`Lỗi: ${error.response?.data?.error || error.response?.data?.message || error.message}`);
    } finally {
        setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- MODAL RENDERING ---
  return (
    // Use your existing modal CSS classes
    <div className="add-service-modal">
      <div className="add-service-modal__container">
        <div className="add-service-modal__title">Thêm dịch vụ cho phòng</div>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div className="add-service-modal__list">
          {loadingServices ? (
            <p>Đang tải danh sách dịch vụ...</p>
          ) : !Array.isArray(services) || services.length === 0 ? (
             <p>Không có dịch vụ nào khả dụng hoặc lỗi khi tải.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tên Dịch Vụ</th>
                  <th>Giá (VNĐ)</th>
                  <th>Đơn Vị</th>
                  <th>Số Lượng</th>
                  <th>Chọn</th>
                </tr>
              </thead>
              <tbody>
              {services.map((service) => {
                 const isExisting = existingServiceIds.has(service.MaDV);
                 const isSelected = selectedData.hasOwnProperty(service.MaDV);

                return (
                  <tr key={service.MaDV}>
                    <td>{service.TenDV}</td>
                    <td>{service.Gia?.toLocaleString() ?? 'N/A'}</td>
                    <td>{service.DonViTinh}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={selectedData[service.MaDV] || 1} // Show current quantity or 1
                        onChange={(e) => handleQuantityChange(service.MaDV, e.target.value)}
                        disabled={isExisting || !isSelected}
                        style={{ width: '60px', textAlign: 'center', backgroundColor: isSelected ? 'white': '#eee' }}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                                onChange={(e) => handleSelectionChange(service.MaDV, e.target.checked, selectedData[service.MaDV] || 1)} // Pass current quantity when selecting
                                disabled={isExisting}
                      />
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          )}
        </div>

        <div className="add-service-modal__actions">
          <button
            className="add-service-modal__button add-service-modal__button--cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            className="add-service-modal__button add-service-modal__button--confirm"
            onClick={handleConfirm}
            disabled={submitting || loadingServices || !Object.keys(selectedData).some(id => !existingServiceIds.has(parseInt(id,10)))} // Disable if loading, submitting, or nothing selected
          >
            {submitting ? 'Đang thêm...' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoomServiceModal;