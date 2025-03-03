import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AnimatedSignature from "../components/AnimatedSignature";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrors({ submit: "Vui lòng nhập đầy đủ email và mật khẩu." });
      return;
    }
    try {
      // Nếu cấu hình proxy được đặt trong package.json, bạn chỉ cần gọi "/api/auth/login"
      const response = await axios.post("/api/auth/login", formData);
      console.log("Đăng nhập thành công", response.data);
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      console.error("Đăng nhập thất bại", error.response.data);
      setErrors({ submit: error.response.data.error || "Đăng nhập thất bại" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-md">
        <AnimatedSignature text="Đăng nhập" />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="password"
              value={formData.password}
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
