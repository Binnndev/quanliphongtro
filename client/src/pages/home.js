// src/home.js
import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import PushNumb from "../components/PushNumb";
import RoomItem from "../components/RoomItem";
import {
  getDsPhong,
  themPhong,
  suaPhong,
  xoaPhong,
} from "../services/phongService";

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy vai trò từ localStorage (đã được lưu sau đăng nhập)
  const loaiTaiKhoan = localStorage.getItem("loaiTaiKhoan");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const ds = await getDsPhong();
        setRooms(ds);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách room:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Tính toán số lượng phòng
  const totalRooms = rooms.length;
  const rentedRooms = rooms.filter((room) => room.rented).length;
  const notYetFee = totalRooms - rentedRooms; // Ví dụ: phòng chưa thu phí (bạn có thể thay đổi logic này nếu cần)

  // Các hàm thao tác (đây chỉ là demo; bạn có thể tích hợp modal hoặc form sửa phòng)
  const handleThemPhong = async () => {
    // Ví dụ: mở modal thêm room hoặc gọi API thêm mới
    console.log("Thêm phòng");
    // Sau khi thêm xong, bạn có thể gọi fetchRooms() để làm mới danh sách.
  };

  const handleSuaNha = async (id) => {
    console.log("Sửa nhà", id);
    // Tích hợp logic sửa phòng
  };

  const handleXoaPhong = async (id) => {
    console.log("Xóa nhà", id);
    // Sau khi xóa, cập nhật lại danh sách
    try {
      await xoaPhong(id);
      setRooms(rooms.filter((room) => room.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa phòng:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Header hiển thị số liệu thống kê và nút thao tác */}
      <div
        style={{
          width: "calc(100% - 20px)",
          height: 83,
          margin: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "10px",
          background: "white",
          borderBottom: "1px solid #D2D2D2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <PushNumb text="Còn trống" numb={totalRooms - rentedRooms} />
          <PushNumb text="Đã cho thuê" numb={rentedRooms} />
          <PushNumb text="Chưa thu phí" numb={notYetFee} />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {loaiTaiKhoan === "Chủ Trọ" ? (
            <>
              <Button
                label="Thêm phòng"
                class_name="green-btn btn"
                onClick={handleThemPhong}
              />
              <Button
                label="Sửa nhà"
                class_name="blue-btn btn"
                onClick={() => handleSuaNha(1)}
              />
              <Button
                label="Xóa nhà"
                class_name="delete-btn btn"
                onClick={() => handleXoaPhong(1)}
              />
            </>
          ) : (
            <p className="text-blue-500">Bạn chỉ có quyền xem phòng</p>
          )}
        </div>
      </div>
      {/* Danh sách phòng */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        {rooms.map((room) => (
          <RoomItem
            key={room.id}
            room={room}
            showAction={loaiTaiKhoan === "Chủ Trọ"}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
