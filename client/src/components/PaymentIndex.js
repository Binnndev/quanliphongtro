import React, { useEffect, useState } from "react";
import axios from "axios";
import Invoice from "./invoices";

const PaymentIndex = () => {
  const [hoaDonList, setHoaDonList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [confirmPayId, setConfirmPayId] = useState(null);
  const [methodList, setMethodList] = useState([]);
  const [payMethod, setPayMethod] = useState("");

  useEffect(() => {
    fetchInvoices();
    axios.get("/api/payment-method").then((res) => setMethodList(res.data));
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("/api/invoice");
      setHoaDonList(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hóa đơn:", err);
    }
  };

  const handleViewInvoice = async (maHoaDon) => {
    try {
      const [invoiceRes, detailRes] = await Promise.all([
        axios.get(`/api/invoice/${maHoaDon}`),
        axios.get(`/api/invoice-detail/${maHoaDon}`),
      ]);

        const invoice = invoiceRes.data;
        console.log("detailRes", detailRes.data);
      const chiTietDichVu = detailRes.data.map((ct) => ({
          moTa: ct.Service?.TenDV || `Dịch vụ #${ct.MaDV}`,
          soLuong: ct.SoLuong,
            donGia: ct.DonGia,
        gia: ct.ThanhTien,
      }));

      const invoiceData = {
        nha: invoice.TenNhaTro,
        diaChi: invoice.DiaChiNha,
        hoTen: invoice.TenKhachThue,
        phong: invoice.TenPhong,
        ngayVao: "2024-01-01", // demo
        thang: new Date(invoice.NgayLap).toLocaleDateString("vi-VN", {
          month: "2-digit",
          year: "numeric",
        }),
        danhSachChiTiet: [
          { moTa: "Tiền nhà", soLuong: 1, donGia: invoice.TienPhong, gia: invoice.TienPhong },
          ...chiTietDichVu,
        ],
        tongTien: invoice.TongTien,
        bangChu: "Đang cập nhật",
        nganHang: "Vietcombank",
        soTaiKhoan: "0123456789",
        tenChuTK: invoice.TenChuTro,
        soDienThoai: invoice.SdtChuTro,
      };

      setSelectedInvoice(invoiceData);
      setIsPopupOpen(true);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết hóa đơn:", err);
    }
  };

  const handlePayInvoice = async () => {
    try {
      const hoaDon = hoaDonList.find((h) => h.MaHoaDon === confirmPayId);
      await axios.post("/api/payment", {
        MaHoaDon: hoaDon.MaHoaDon,
        SoTien: hoaDon.ConLai,
        MaPTTT: payMethod,
        MaGiaoDich: "GD" + Date.now(),
        GhiChu: "Thanh toán hóa đơn",
      });
      setConfirmPayId(null);
      setPayMethod("");
      fetchInvoices(); // refresh
    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
    }
  };

  return (
    <div className="invoice__wrapper">
      <div className="invoice__container">
        <h2>Danh sách hóa đơn</h2>
        <table className="invoice__table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tháng</th>
              <th>Nhà</th>
              <th>Phòng</th>
              <th>Khách thuê</th>
              <th>Số tiền</th>
              <th>Đã trả</th>
              <th>Còn lại</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {hoaDonList.map((item, index) => (
              <tr key={item.MaHoaDon}>
                <td>{index + 1}</td>
                <td>{new Date(item.NgayLap).toLocaleDateString("vi-VN", {
                  month: "2-digit",
                  year: "numeric"
                })}</td>
                <td>{item.TenNhaTro}</td>
                <td>{item.TenPhong}</td>
                <td>{item.TenKhachThue}</td>
                <td>{item.TongTien.toLocaleString("vi-VN")}</td>
                <td>{item.DaTra.toLocaleString("vi-VN")}</td>
                <td>{item.ConLai.toLocaleString("vi-VN")}</td>
                <td>{item.TrangThaiThanhToan}</td>
                <td>
                  <button
                    className="invoice__action invoice__action--view"
                    onClick={() => handleViewInvoice(item.MaHoaDon)}
                  >
                    <i className="fa fa-eye" />
                  </button>
                  {item.ConLai > 0 && (
                    <button
                      className="invoice__action invoice__action--pay"
                      onClick={() => setConfirmPayId(item.MaHoaDon)}
                    >
                      <i className="fa fa-money-bill" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Invoice
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        invoiceData={selectedInvoice}
      />

      {/* Modal chọn phương thức thanh toán */}
      {confirmPayId && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Chọn phương thức thanh toán</h3>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="dropdown"
            >
              <option value="">-- Chọn phương thức --</option>
              {methodList.map((m) => (
                <option key={m.MaPTTT} value={m.MaPTTT}>
                  {m.TenPTTT}
                </option>
              ))}
            </select>

            <div className="popup-actions" style={{ marginTop: 15 }}>
              <button className="btn green" disabled={!payMethod} onClick={handlePayInvoice}>
                Xác nhận
              </button>
              <button className="btn gray" onClick={() => setConfirmPayId(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentIndex;
