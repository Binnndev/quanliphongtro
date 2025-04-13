import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AnimatedSignature from "../components/AnimatedSignature";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ TenDangNhap: "", MatKhau: "" });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra input
    if (!formData.TenDangNhap || !formData.MatKhau) {
      setErrors({ submit: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." });
      return;
    }

    try {
      // Gửi request đến API login, body gồm TenDangNhap, MatKhau
      const response = await axios.post("/api/auth/login", {
        TenDangNhap: formData.TenDangNhap,
        MatKhau: formData.MatKhau,
      });
      console.log("Đăng nhập thành công:", response.data);

      // Lưu token vào localStorage
      localStorage.setItem("token", response.data.token);
      // Giải mã token để lấy vai trò (role)
      const payload = JSON.parse(atob(response.data.token.split(".")[1]));
      localStorage.setItem("loaiTaiKhoan", payload.role);

      // Chuyển hướng sau đăng nhập
      navigate("/homepage");
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || "Đăng nhập thất bại",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-md">
        <AnimatedSignature text="Đăng nhập" />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="TenDangNhap"
              value={formData.TenDangNhap}
              onChange={handleChange}
              placeholder="Tên đăng nhập"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="MatKhau"
              value={formData.MatKhau}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          {errors.submit && (
            <p className="text-red-400 text-xs mb-4">{errors.submit}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-white hover:shadow-lg transition-all"
          >
            Đăng nhập
          </button>
          <div className="mt-4 flex justify-between text-white text-sm">
            <Link to="/forgot-password" className="hover:underline">
              Quên mật khẩu?
            </Link>
            <Link
              to="/register"
              className="text-purple-300 font-bold hover:underline"
            >
              Đăng ký
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
