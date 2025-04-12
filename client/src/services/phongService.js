import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", // thay đổi nếu cần
});

// 1. Lấy danh sách room
export const getDsPhong = async () => {
  const response = await api.get("/api/phong");
  return response.data; // giả sử backend trả về mảng room
};

// 2. Thêm room
export const themPhong = async (roomData) => {
  const response = await api.post("/api/phong", roomData);
  return response.data;
};

// 3. Sửa room
export const suaPhong = async (id, data) => {
  const response = await api.put(`/api/phong/${id}`, data);
  return response.data;
};

// 4. Xóa room
export const xoaPhong = async (id) => {
  const response = await api.delete(`/api/phong/${id}`);
  return response.data;
};
