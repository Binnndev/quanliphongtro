import React, { useEffect, useState } from "react";
import axios from "axios";
import Invoice from "./invoices";

const PaymentIndex = (landlordId) => {
  const phanQuyen = localStorage.loaiTaiKhoan;
  console.log(phanQuyen);
  
  const [hoaDonList, setHoaDonList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [confirmPayId, setConfirmPayId] = useState(null);
  const [methodList, setMethodList] = useState([]);
  const [payMethod, setPayMethod] = useState("");
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [filterThang, setFilterThang] = useState("");
  const [filterNha, setFilterNha] = useState("");
  const [filterPhong, setFilterPhong] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const uniqueMonths = [...new Set(hoaDonList.map(hd => new Date(hd.NgayLap).toISOString().slice(0, 7)))];
  const uniqueHouses = [...new Set(hoaDonList.map(hd => hd.TenNhaTro))];
  const uniqueRooms = [...new Set(hoaDonList.map(hd => hd.TenPhong))];

  const filteredList = hoaDonList.filter((item) => {
    const thangHoaDon = new Date(item.NgayLap).toISOString().slice(0, 7);
    const matchThang = filterThang ? thangHoaDon === filterThang : true;
    const matchNha = filterNha ? item.TenNhaTro === filterNha : true;
    const matchPhong = filterPhong ? item.TenPhong === filterPhong : true;
    const matchTrangThai = filterTrangThai ? item.TrangThaiThanhToan === filterTrangThai : true;
    return matchThang && matchNha && matchPhong && matchTrangThai;
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewInvoice = async (maHoaDon) => {
    try {
      const [invoiceRes, detailRes] = await Promise.all([
        axios.get(`/api/invoice/${maHoaDon}`),
        axios.get(`/api/invoice-detail/${maHoaDon}`),
      ]);

      const invoice = invoiceRes.data;
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
        maTKKhachThue: invoice.Tenant.MaTK,
        phong: invoice.TenPhong,
        ngayVao: "2024-01-01",
        thang: new Date(invoice.NgayLap).toLocaleDateString("vi-VN", {
          month: "2-digit",
          year: "numeric",
        }),
        danhSachChiTiet: chiTietDichVu,
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
      fetchInvoices();
    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
    }
  };

  const handleSendReminder = async (invoiceToSend) => {
    if (!landlordId || !invoiceToSend?.maTKKhachThue) return;
    setIsSendingReminder(true);
    const title = `Thông báo hóa đơn tháng ${invoiceToSend.thang} - Phòng ${invoiceToSend.phong}`;
    const content = `Xin chào ${invoiceToSend.hoTen},\n\nĐã có hóa đơn tiền nhà tháng ${invoiceToSend.thang} cho phòng ${invoiceToSend.phong}.\nTổng số tiền cần thanh toán là: ${invoiceToSend.tongTien.toLocaleString('vi-VN')} đ.\n\nVui lòng thanh toán đúng hạn.`;

    try {
      await axios.post('/api/notifications', {
        MaNguoiGui: landlordId,
        MaNguoiNhan: invoiceToSend.maTKKhachThue,
        TieuDe: title,
        NoiDung: content,
      });
      alert("Đã gửi thông báo nhắc nhở thanh toán thành công!");
    } catch (err) {
      alert("Lỗi khi gửi thông báo.");
    } finally {
      setIsSendingReminder(false);
    }
  };

  return (
    <div className="payment-index__wrapper">
      <div className="payment-index__container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "baseline" }}>
          <h2 className="payment-index__title">Danh sách hóa đơn</h2>
          <button
            className="payment-index__action payment-index__action--refresh"
            onClick={fetchInvoices}
          >
            <i className="fa fa-sync-alt" style={{ marginRight: 6 }}></i> Tải lại danh sách
          </button>
        </div>

        <div className="payment-index__filter-row">
          <select className="payment-index__filter" value={filterThang} onChange={(e) => setFilterThang(e.target.value)}>
            <option value="">-- Tháng --</option>
            {uniqueMonths.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <select className="payment-index__filter" value={filterNha} onChange={(e) => setFilterNha(e.target.value)}>
            <option value="">-- Nhà trọ --</option>
            {uniqueHouses.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>

          <select className="payment-index__filter" value={filterPhong} onChange={(e) => setFilterPhong(e.target.value)}>
            <option value="">-- Phòng --</option>
            {uniqueRooms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <select className="payment-index__filter" value={filterTrangThai} onChange={(e) => setFilterTrangThai(e.target.value)}>
            <option value="">-- Trạng thái --</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
          </select>
        </div>

        <table className="payment-index__table">
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
            {paginatedList.map((item, index) => (
              <tr key={item.MaHoaDon}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{new Date(item.NgayLap).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}</td>
                <td>{item.TenNhaTro}</td>
                <td>{item.TenPhong}</td>
                <td>{item.TenKhachThue}</td>
                <td>{parseInt(item.TongTien).toLocaleString("vi-VN")}</td>
                <td>{item.DaTra.toLocaleString("vi-VN")}</td>
                <td>{item.ConLai.toLocaleString("vi-VN")}</td>
                <td>{item.TrangThaiThanhToan}</td>
                <td>
                  <button className="payment-index__action--view" onClick={() => handleViewInvoice(item.MaHoaDon)}>
                    <i className="fa fa-eye" />
                  </button>
                  {item.ConLai > 0 && phanQuyen === "Chủ trọ" && (
                    <button className="payment-index__action--pay" onClick={() => setConfirmPayId(item.MaHoaDon)}>
                      <i className="fa fa-money-bill" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`payment-index__action ${currentPage === i + 1 ? 'payment-index__action--active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {<Invoice
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        invoiceData={selectedInvoice}
        onSend={handleSendReminder}
        isSending={isSendingReminder}
      />}

      {confirmPayId && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Chọn phương thức thanh toán</h3>
            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option value="">-- Chọn phương thức --</option>
              {methodList.map((m) => (
                <option key={m.MaPTTT} value={m.MaPTTT}>{m.TenPTTT}</option>
              ))}
            </select>
            <div className="popup-actions" style={{ marginTop: 15 }}>
              <button className="btn green" disabled={!payMethod} onClick={handlePayInvoice}>Xác nhận</button>
              <button className="btn gray" onClick={() => setConfirmPayId(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentIndex;