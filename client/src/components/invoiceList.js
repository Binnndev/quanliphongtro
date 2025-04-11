import React, { useEffect, useState } from "react";
import axios from "axios";
import InvoiceDetailPopup from "./invoiceDetailPopup";

const InvoiceList = ({ roomId }) => {
  const [services, setServices] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`/api/services/${roomId}`);
        setServices(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dịch vụ:", error);
      }
    };
    fetchServices();
  }, [roomId]);

  const handleOpenPopup = (invoiceData) => {
    setCurrentInvoice(invoiceData);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setCurrentInvoice(null);
  };

  return (
    <div>
      <h3>Danh sách dịch vụ phòng {roomId}</h3>
      <table>
        <thead>
          <tr>
            <th>Hóa Đơn</th>
            <th>Dịch Vụ</th>
            <th>Giá</th>
            <th>Chi Tiết</th>
          </tr>
        </thead>
        <tbody>
          {services.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.MaHoaDon}</td>
              <td>{invoice.Services.map(service => service.TenDV).join(', ')}</td>
              <td>{invoice.Services.map(service => service.Gia).join(', ')}</td>
              <td>
                <button onClick={() => handleOpenPopup(invoice)}>
                  <i className="fa fa-eye"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <InvoiceDetailPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        invoiceData={currentInvoice}
      />
    </div>
  );
};

export default InvoiceList;
