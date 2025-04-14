import axios from "axios";

export const themNhaTro = async (nhaTroData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
    try {
        const response = await axios.post("/api/houses", nhaTroData, config);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm nhà trọ:", error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm này
    }
}

export const suaNhaTro = async (id, nhaTroData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
    try {
        const response = await axios.put(`/api/houses/${id}`, nhaTroData, config);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi sửa nhà trọ:", error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm này
    }
}

export const xoaNhaTro = async (id) => {
    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
    try {
        const response = await axios.delete(`/api/houses/${id}`, config);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa nhà trọ:", error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm này
    }
}