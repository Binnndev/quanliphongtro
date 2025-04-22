import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", // thay đổi nếu cần
});

// 1. Lấy danh sách room
export const getTenantRoom = async () => {
    const MaTK = localStorage.getItem("MaTK");
    const response = await api.get(`/api/rooms/tenant/${MaTK}`);
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
  


export const getMyRoomDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Yêu cầu xác thực.");
      }
      // Backend sẽ tự xác định khách thuê qua token
      const response = await api.get(`/api/tenant/my-room`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // API nên trả về object phòng hoặc null/undefined nếu không tìm thấy
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phòng của tôi:", error.response?.data || error.message);
      // Ném lỗi ra ngoài để component có thể xử lý
      throw error.response?.data || new Error('Không thể tải thông tin phòng.');
    }
};
  


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
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
  const response = await api.put(`/api/rooms/${id}`, data, config);
  
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
