import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AnimatedSignature from "../components/AnimatedSignature";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm kiểm tra dữ liệu đầu vào
  const validate = () => {
    let newErrors = {};
    if (!formData.username) newErrors.username = "Tên người dùng là bắt buộc";
    if (!formData.email) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Định dạng email không hợp lệ";
    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";
    return newErrors;
  };

  // Xử lý submit form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      // Sử dụng đường dẫn tương đối nhờ cấu hình proxy
      const response = await axios.post("/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "tenant", // Hoặc "landlord" nếu cần
      });
      console.log("Đăng ký thành công", response.data);
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng ký", error.response.data);
      setErrors({ submit: error.response.data.error || "Đăng ký thất bại" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-md">
        <AnimatedSignature text="Đăng ký" />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tên người dùng"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username}</p>
            )}
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          {errors.submit && (
            <p className="text-red-400 text-xs mb-4">{errors.submit}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-white hover:shadow-lg transition-all"
          >
            Đăng ký
          </button>
        </form>
        <p className="text-center text-white mt-4">
          Đã có tài khoản?{" "}
          <Link to="/" className="text-purple-300 font-bold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
