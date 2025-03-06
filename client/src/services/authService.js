import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const login = async (FormData) => {
    return await axios.post(`${API_URL}/login`, FormData);
};

export const register = async (FormData) => {
    return await axios.post(`${API_URL}/register`, FormData);
};

export const isAuthenticated = () => {
    return localStorage.getItem("token") ? true : false;
}