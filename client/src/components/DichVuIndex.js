import React, { useEffect, useState } from "react";
import axios from "axios";
import ModalDichVu from "./ModalDichVu";
import ModalConfirm from "./ModalConfirm";
import UserIcon from "./UserIcon";  

const DichVuIndex = ({ maChuTro }) => {
  const phanQuyen = localStorage.loaiTaiKhoan;
  const [dichVuList, setDichVuList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDichVu, setSelectedDichVu] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [confirmContent, setConfirmContent] = useState({ title: "", message: "" });

  // ✅ Load danh sách dịch vụ theo MaChuTro
  useEffect(() => {
    const fetchData = async () => {
      console.log(maChuTro);
      
      try {
        if (maChuTro) {
          const res = await axios.get(`/api/service/by-chutro/${maChuTro}`);
          setDichVuList(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dịch vụ:", err);
      }
    };

    fetchData();
  }, [maChuTro]);


  const handleOpenAdd = () => {
    setSelectedDichVu(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dv) => {
    setConfirmContent({
      title: "Xác nhận chỉnh sửa",
      message: `Bạn có chắc muốn chỉnh sửa dịch vụ "${dv.TenDV}"?`,
    });
    setConfirmAction(() => () => {
      setSelectedDichVu(dv);
      setIsModalOpen(true);
      setIsConfirmOpen(false);
    });
    setIsConfirmOpen(true);
  };

  const handleDelete = (dv) => {
    setConfirmContent({
      title: "Xác nhận xoá",
      message: `Bạn có chắc muốn xoá dịch vụ "${dv.TenDV}"?`,
    });
    setConfirmAction(() => () => confirmDelete(dv.MaDV));
    setIsConfirmOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`/api/service/${id}`);
      setDichVuList((prev) => prev.filter((dv) => dv.MaDV !== id));
      setIsConfirmOpen(false);
    } catch (err) {
      console.error("Lỗi khi xóa dịch vụ:", err);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedDichVu) {
        // Cập nhật
        const res = await axios.put(`/api/service/${selectedDichVu.MaDV}`, formData);
        setDichVuList((prev) =>
          prev.map((dv) =>
            dv.MaDV === selectedDichVu.MaDV ? res.data : dv
          )
        );
      } else {
        // Thêm mới (gửi kèm MaChuTro)
        const res = await axios.post("/api/service", { ...formData, MaChuTro: maChuTro });
        setDichVuList((prev) => [...prev, res.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi lưu dịch vụ:", err);
    }
  };

    return (
        <div style={{ display: "flex", height: '100vh', position: 'fixed', top: 0, justifyContent: 'center', width: "100%", overflow: 'hidden' }}>
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
            <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>Danh Sách Dịch Vụ</p> {/* Tiêu đề chung */}
                    <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
                </div>
                <div className="service" style={{ padding: 20 }}>
                    <div
                        className="service__header"
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            marginBottom: 20,
                            paddingTop: '80px'
                        }}
                    >
                        {phanQuyen === "Chủ trọ" && (
                        <button className="green-btn btn" onClick={handleOpenAdd}>
                                + Thêm dịch vụ
                            </button>)}
                    </div>
                          <table className="service__table" style={{ width: "100%" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f0f0f0" }}>
                                <th>Tên dịch vụ</th>
                                <th>Loại</th>
                                <th>Đơn vị</th>
                                <th>Giá</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dichVuList.map((dv) => (
                                <tr key={dv.MaDV} style={{ backgroundColor: "#fff" }}>
                                <td>{dv.TenDV}</td>
                                <td>{dv.LoaiDichVu}</td>
                                <td>{dv.DonViTinh}</td>
                                <td>{Number(dv.Gia).toLocaleString()}đ</td>
                                    <td>
                                        {phanQuyen === "Chủ trọ" ? (
                                            <>
                                                <button className="blue-btn btn" onClick={() => handleEdit(dv)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="delete-btn btn" onClick={() => handleDelete(dv)}>
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </>
                                        ) : (
                                                <span style={{ fontStyle: "italic", color: "#888" }}>
                                                    Bạn không được cấp quyền hành động
                                                </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <ModalDichVu
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSave}
                        dichVuData={selectedDichVu}
                    />

                    <ModalConfirm
                        isOpen={isConfirmOpen}
                        onClose={() => setIsConfirmOpen(false)}
                        onConfirm={confirmAction}
                        title={confirmContent.title}
                        message={confirmContent.message}
                    />
                </div>
            </div>
        </div>
    );
};

export default DichVuIndex;
