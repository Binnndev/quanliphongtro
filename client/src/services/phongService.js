import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", // thay đổi nếu cần
});

// 1. Lấy danh sách room
export const getDsPhong = async () => {
    const MaTK = localStorage.getItem("MaTK");
    const response = await api.get(`/api/rooms/landlord/${MaTK}`);
    return response.data;
};

// 2. Thêm room
export const themPhong = async (roomData) => {
  const response = await api.post("/api/rooms", roomData);
  return response.data;
};

// 3. Sửa room
export const suaPhong = async (id, data) => {
  const response = await api.put(`/api/rooms/${id}`, data);
  return response.data;
};

// 4. Xóa room
export const xoaPhong = async (id) => {
  const response = await api.delete(`/api/rooms/${id}`);
  return response.data;
};
