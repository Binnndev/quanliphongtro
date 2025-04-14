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

export const getDsPhongByChuTro = async (maTK) => {
    try {
      const res = await axios.get(`/api/rooms/landlord/${maTK}`);
      const data = res.data;
  
      console.log("typeof res.data:", typeof data); // 👈 Phải là 'object'
  
      if (Array.isArray(data)) return data;
  
      try {
        // Nếu lỡ trả về string, parse lại
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn("Không parse được JSON:", e);
        return [];
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      return [];
    }
};
  
export const getNhaTroByChuTro = async (maTK) => {
    if (!maTK) {
      console.error("Thiếu MaTK khi gọi getNhaTroByChuTro");
      return [];
    }
    try {
      // Adjust endpoint if necessary
      const response = await axios.get(`api/houses/landlord/${maTK}`);
      // Ensure response.data is an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Lỗi khi gọi API lấy danh sách nhà trọ cho chủ trọ ${maTK}:`, error);
      return []; // Return empty array on error
    }
};
  
export const getDsLoaiPhong = async () => {
    const response = await axios.get("/api/room-type", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
}

// 2. Thêm room
export const themPhong = async (roomData) => {
    console.log(roomData);
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
  const response = await api.post("/api/rooms", roomData, config);
  return response.data;
};

// 3. Sửa room
export const suaPhong = async (id, data) => {
  const response = await api.put(`/api/rooms/${id}`, data);
  return response.data;
};

// 4. Xóa room
export const xoaPhong = async (id) => {
    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
  // Xóa phòng
  const response = await api.delete(`/api/rooms/${id}`, config);
  return response.data;
};
