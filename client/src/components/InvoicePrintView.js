import React from "react";

const InvoicePrintView = React.forwardRef(({ invoiceData }, ref) => {
  return (
    <div ref={ref} style={{ padding: 20, fontFamily: "Times New Roman" }}>
      <p>Địa chỉ: {invoiceData.diaChi}</p>
      <h3 style={{ textAlign: "center" }}>PHIẾU THU TIỀN PHÒNG</h3>
      <p>
        Tên khách thuê: {invoiceData.hoTen} &nbsp;&nbsp;&nbsp;
        Phòng: {invoiceData.phong}
      </p>
      <p>Ngày lập phiếu: {new Date(invoiceData.thang).toLocaleDateString("vi-VN")}</p>

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Nội dung</th>
            <th>Chỉ số đầu</th>
            <th>Chỉ số cuối</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.danhSachChiTiet.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.moTa}</td>
              <td>{item.chiSoDau}</td>
              <td>{item.chiSoCuoi}</td>
              <td>{item.soLuong}</td>
              <td>{item.donGia}</td>
              <td>{item.gia}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <p><strong>Tổng thanh toán:</strong> {invoiceData.tongTien.toLocaleString("vi-VN")} đ</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
        <p><strong>Người lập phiếu: {invoiceData.tenChuTK}</strong></p>
        <p><strong>Người thuê: {invoiceData.hoTen}</strong></p>
      </div>
    </div>
  );
});

export default InvoicePrintView;
