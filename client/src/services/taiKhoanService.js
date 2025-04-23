// src/services/taiKhoanService.js
import axios from "axios";

// Use the same base URL as defined in other services or configure globally
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const api = axios.create({ // Use configured instance if available
  baseURL: API_BASE_URL,
});

/**
 * Lấy danh sách TẤT CẢ khách thuê (có tài khoản) thuộc quản lý của một chủ trọ.
 * Yêu cầu backend trả về MaTK, HoTen, MaPhong, MaNhaTro cho mỗi khách thuê.
 * @param {string|number} landlordMaTK MaTK của chủ trọ.
 * @returns {Promise<Array>} Mảng các object khách thuê hoặc mảng rỗng nếu lỗi.
 */
export const getAllTenantsByLandlord = async (landlordMaTK) => {
    if (!landlordMaTK) {
      console.error("getAllTenantsByLandlord: Thiếu landlordMaTK.");
      return [];
    }
  
    const token = localStorage.getItem("token");
    const config = { headers: {} };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("getAllTenantsByLandlord: Không tìm thấy token xác thực.");
    }
  
    const endpoint = `/api/landlords/${landlordMaTK}/tenants`;
    console.log(`Gọi API: GET ${endpoint}`);
  
    try {
      // Sử dụng global axios hoặc instance 'api' tùy cấu hình của bạn
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, config);
  
      if (response.status === 200 && Array.isArray(response.data)) {
        console.log(`getAllTenantsByLandlord: Success - Received ${response.data.length} tenants.`);
        // <<< BỎ BỘ LỌC Ở ĐÂY - TRẢ VỀ NGUYÊN GỐC DATA TỪ API >>>
        return response.data;
      } else {
        console.warn(`getAllTenantsByLandlord: API response invalid. Status: ${response.status}`, response.data);
        return [];
      }
    } catch (error) {
      console.error(`getAllTenantsByLandlord: Lỗi API:`, error.response?.data || error.message);
      return [];
    }
  };
  

/**
 * Lấy thông tin cơ bản (MaTK, HoTen) của chủ nhà quản lý khách thuê đang đăng nhập.
 * Backend xác định khách thuê qua token.
 * @returns {Promise<Object|null>} Object chứa MaTK, HoTen của chủ nhà hoặc null nếu lỗi/không tìm thấy.
 */
export const getMyLandlordInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("getMyLandlordInfo: Không tìm thấy token xác thực.");
    // Throw error because this function relies on authentication
    throw new Error("Yêu cầu xác thực.");
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const endpoint = `/api/tenants/${localStorage.getItem("MaTK")}/landlord-account`; // Example endpoint
  console.log(`Gọi API: GET ${endpoint}`);

  try {
     // Using global axios here, switch to 'api.get' if using interceptors
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 200 && response.data && response.data.MaTK && response.data.HoTen) {
        console.log("getMyLandlordInfo: Success - Received landlord info:", response.data);
      return response.data; // Should return { MaTK: ..., HoTen: ... }
    } else if (response.status === 404 || !response.data || !response.data.MaTK) {
         console.warn(`getMyLandlordInfo: Không tìm thấy thông tin chủ nhà cho khách thuê hiện tại.`);
         return null; // Return null if landlord not found for this tenant
    }
    else {
      console.warn(`getMyLandlordInfo: API response is invalid or status is not 200. Status: ${response.status}`, response.data);
      return null;
    }
  } catch (error) {
    console.error(`getMyLandlordInfo: Lỗi khi gọi API lấy thông tin chủ nhà:`, error.response?.data || error.message);
     // Return null or re-throw depending on how you want calling components to handle it
     // Returning null might be friendlier for the UI
     return null;
    // throw error.response?.data || new Error('Không thể tải thông tin chủ nhà.');
  }
};