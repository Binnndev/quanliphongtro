import React from "react";

const InvoiceDetailPopup = ({ isOpen, onClose, invoiceData }) => {
  
  const invoice = invoiceData[0];
  console.log("đã mở");
  return (
    <div className="invoice-detail-popup">
      <div className="invoice-detail-popup__box">
        <h2 className="invoice-detail-popup__title">Chi tiết hóa đơn dịch vụ</h2>
        <table className="invoice-detail-popup__table">
          <thead>
            <tr>
              <th>Tên Dịch Vụ</th>
              <th>Ngày lập</th>
              <th>Giá</th>
              <th>Số Lượng</th>
              <th>Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
          <tr>
              <td>{invoice.Service.TenDV || "Dịch vụ #" + invoice.MaDV}</td>
              <td>{invoice.Invoice.NgayLap.toLocaleString().split('T')[0]}</td>
              <td>{parseInt(invoice.DonGia).toLocaleString()} đ</td>
              <td>{invoice.SoLuong}</td>
              <td>{parseInt(invoice.ThanhTien).toLocaleString()} đ</td>
            </tr>
          </tbody>
        </table>
        <button className="invoice-detail-popup__close-btn" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetailPopup;
