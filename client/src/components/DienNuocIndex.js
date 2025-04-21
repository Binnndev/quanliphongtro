import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const DienNuoc = ({ type = "Điện", month = "03/2024" }) => {
  const phanQuyen = localStorage.loaiTaiKhoan;
  const [data, setData] = useState([]);
  const [errorModal, setErrorModal] = useState(null); // { message: "" }

  useEffect(() => {
    fetchChiSo();
  }, [type]);

  const fetchChiSo = async () => {
    try {
      const url = phanQuyen === "Khách Thuê"
        ? `/api/diennuoc/mine?loai=${type}`
        : `/api/diennuoc?loai=${type}`;
      const res = await axios.get(url);
      const formatData = res.data.map((d) => ({
        id: d.MaDienNuoc,
        thoiGian: d.NgayGhi,
        nha: d.TenNhaTro || "Chưa có",
        phong: d.TenPhong || `Phòng ${d.MaPhong}`,
        cu: d.ChiSoDau,
        moi: d.ChiSoCuoi,
        maPhong: d.MaPhong,
      }));
      setData(formatData);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
    }
  };

  const moiRefs = useRef({});

  const handleSave = async (row) => {
    const newMoi = parseInt(moiRefs.current[row.id]?.value);
    const nowDate = new Date().toISOString().split("T")[0]; // thời gian thực
    console.log(nowDate)
  
    if (newMoi < row.cu) {
      setErrorModal({
        message: `❌ Chỉ số mới (${newMoi}) không được nhỏ hơn chỉ số cũ (${row.cu})`,
      });
      return;
    }
  
    try {
      await axios.put(`/api/diennuoc/${row.id}`, {
        ChiSoCuoi: newMoi,
        ChiSoDau: row.cu,
        NgayGhi: nowDate, // ✅ gửi thời gian thực
      });
  
      await fetchChiSo(); // cập nhật lại bảng
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
    }
  };
  

  return (
    <div className="electric-water" style={{ padding: 20 }}>
      <h2 className="electric-water__title">Chỉ số {type.toLowerCase()}</h2>
      <p className="electric-water__month"><strong>Tháng/năm:</strong> {month}</p>

      <table className="electric-water__table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Thời gian ghi</th>
            <th>Nhà</th>
            <th>Phòng</th>
            <th>Chỉ số cũ</th>
            <th>Chỉ số mới</th>
            <th>Sử dụng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => {
            const suDung = d.moi - d.cu;
            return (
              <tr key={d.id}>
                <td>{i + 1}</td>
                <td>{d.thoiGian}</td>
                <td>{d.nha}</td>
                <td>{d.phong}</td>
                <td><input type="number" value={d.cu} disabled className="electric-water__input" /></td>
                <td>
                  <input
                    type="number"
                    defaultValue={d.moi}
                    ref={(el) => (moiRefs.current[d.id] = el)}
                    className="electric-water__input"
                  />
                </td>
                <td>{suDung}</td>
                <td>
                {phanQuyen === "Chủ trọ" ? (
                  <button
                    className="electric-water__button-save"
                    onClick={() => handleSave(d)}
                  >
                    Lưu
                  </button>
                  ) : (
                    <span style={{ fontStyle: "italic", color: "#888" }}>
                      Bạn không được cấp quyền hành động
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal lỗi */}
      {errorModal && (
  <div className="dien-nuoc__modal-overlay">
    <div className="dien-nuoc__modal-box">
      <h3 className="dien-nuoc__modal-title">Lỗi</h3>
      <p className="dien-nuoc__modal-message">{errorModal.message}</p>
      <div style={{ textAlign: "right" }}>
        <button
          onClick={() => setErrorModal(null)}
          className="dien-nuoc__button dien-nuoc__button--close"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default DienNuoc;
