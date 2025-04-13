import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AnimatedSignature from "../components/AnimatedSignature";

export default function ForgotPassword() {
  // Thay đổi biến từ email thành username
  const [username, setUsername] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [loi, setLoi] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setLoi("Vui lòng nhập tên đăng nhập.");
      return;
    }
    try {
      // Gọi API quên mật khẩu với key là TenDangNhap thay vì email
      const response = await axios.post("/api/auth/forgot-password", {
        TenDangNhap: username,
      });
      setThongBao(response.data.message);
      setLoi("");
    } catch (err) {
      console.error("Lỗi quên mật khẩu", err.response.data);
      setLoi(err.response.data.error || "Có lỗi xảy ra.");
      setThongBao("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-md">
        <AnimatedSignature text="Quên mật khẩu" />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập của bạn"
              className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          {loi && <p className="text-red-400 text-xs mb-4">{loi}</p>}
          {thongBao && (
            <p className="text-green-400 text-xs mb-4">{thongBao}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-white hover:shadow-lg transition-all"
          >
            Gửi reset token
          </button>
        </form>
        <p className="text-center text-white mt-4">
          <Link to="/" className="text-purple-300 font-bold hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
