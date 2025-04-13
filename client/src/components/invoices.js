import html2pdf from "html2pdf.js";
import InvoicePrintView from "./InvoicePrintView"; // đường dẫn đúng
import React, { useRef } from "react";

const Invoice = ({ isOpen, onClose, invoiceData, onSend, isSending }) => {
  const printRef = useRef();

const handleDownloadPDF = () => {
  const fileName = `${invoiceData.nha}_${invoiceData.phong}.pdf`;

  html2pdf()
    .set({
      margin: 10,
      filename: fileName,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(printRef.current)
    .save();
};
  if (!isOpen || !invoiceData) return null;

    // Hàm xử lý khi nhấn nút "Gửi hóa đơn"
    const handleSendClick = () => {
        if (typeof onSend === 'function') {
            onSend(invoiceData); // Gọi hàm từ component cha và truyền invoiceData lên
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-box">
                <div className="popup-header">
                    <h2>HÓA ĐƠN TIỀN NHÀ</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <div className="popup-content">
                    <p><strong>Nhà:</strong> {invoiceData.nha}</p>
                    <p><strong>Địa chỉ:</strong> {invoiceData.diaChi}</p>

                    <hr />

                    <p><strong>Họ và tên khách thuê:</strong> {invoiceData.hoTen}</p>
                    <p><strong>Số điện thoại khách:</strong> {invoiceData.sdtKhach || "Chưa có"}</p>
                    <p><strong>Email khách:</strong> {invoiceData.emailKhach || "Chưa có"}</p>

                    <hr />

                    <p><strong>Phòng:</strong> {invoiceData.phong}</p>
                    <p><strong>Ngày vào:</strong> {invoiceData.ngayVao}</p>
                    <p><strong>Tháng thanh toán:</strong> {invoiceData.thang}</p>

                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên dịch vụ</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.danhSachChiTiet.map((dv, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{dv.moTa}</td>
                                    <td>{dv.soLuong || "N/A"}</td>
                                    <td>{dv.donGia || "N/A"}</td>
                                    <td className="text-right">{dv.gia || "N/A"} đ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="total" style={{ marginTop: 10 }}>
                        <strong>TỔNG CỘNG:</strong> {invoiceData.tongTien.toLocaleString("vi-VN")} đ
                        <p className="text-italic">(Bằng chữ: {invoiceData.bangChu})</p>
                    </div>

                    <hr />

                    <div className="bank-info">
                        <p><strong>Ngân hàng:</strong> {invoiceData.nganHang}</p>
                        <p><strong>Số tài khoản:</strong> {invoiceData.soTaiKhoan} - {invoiceData.tenChuTK}</p>
                        <p><strong>Số điện thoại chủ trọ:</strong> {invoiceData.soDienThoai || "Chưa có"}</p>
                        <p><strong>Email chủ trọ:</strong> {invoiceData.emailChuTro || "Chưa có"}</p>
                    </div>
                </div>

                <div className="popup-actions">
                    <button className="btn blue" onClick={handleDownloadPDF}>Tải file</button>
                    <button onClick={handleSendClick} disabled={isSending} className="btn cyan">Gửi hóa đơn</button>
                    <button onClick={onClose} className="btn red">Đóng</button>
                </div>
            </div>
            <div style={{ display: "none" }}>
                <InvoicePrintView ref={printRef} invoiceData={invoiceData} />
            </div>
        </div>
    );
};

export default Invoice;
