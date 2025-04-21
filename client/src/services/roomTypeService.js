import axios from "axios";

export const getRoomType = async () => {
    const response = await axios.get("/api/room-type", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
}

export const addRoomType = async (roomType) => {
    const response = await axios.post("/api/room-type", roomType, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
}

export const updateRoomType = async (id, roomType) => {
    const response = await axios.put(`/api/room-type/${id}`, roomType, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
}

export const deleteRoomType = async (id) => {
    const response = await axios.delete(`/api/room-type/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
}