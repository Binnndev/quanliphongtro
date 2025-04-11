import React from "react";

const InvoiceDetailPopup = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Chi tiết hóa đơn dịch vụ</h2>
        <table>
          <thead>
            <tr>
              <th>Tên Dịch Vụ</th>
              <th>Giá</th>
              <th>Số Lượng</th>
              <th>Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.Services.map((service, index) => (
              <tr key={index}>
                <td>{service.TenDV}</td>
                <td>{service.Gia}</td>
                <td>{service.SoLuong}</td>
                <td>{service.ThanhTien}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default InvoiceDetailPopup;
