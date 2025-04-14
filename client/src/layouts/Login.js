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

    if (!formData.TenDangNhap || !formData.MatKhau) {
      setErrors({ submit: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." });
      return;
    }

    try {
      const response = await axios.post("/api/auth/login", {
        TenDangNhap: formData.TenDangNhap,
        MatKhau: formData.MatKhau,
      });
      console.log("Đăng nhập thành công:", response.data);

      localStorage.setItem("token", response.data.token);

      // --- DEBUGGING PAYLOAD ---
      try {
        const tokenParts = response.data.token.split(".");
        if (tokenParts.length !== 3) {
          throw new Error("Invalid JWT structure received");
        }

        const base64Payload = tokenParts[1];
        // Properly decode Base64Url
        const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        const payload = JSON.parse(jsonPayload);

        console.log("DECODED JWT PAYLOAD:", payload); // <-- **** CHECK THIS LOG ****

        // Check if payload exists and has the expected properties before setting
        if (payload) {
          if (payload.role !== undefined) {
            localStorage.setItem("loaiTaiKhoan", payload.role);
            console.log("Set loaiTaiKhoan:", payload.role);
          } else {
            console.warn("payload.role is missing or undefined");
            localStorage.removeItem("loaiTaiKhoan"); // Avoid storing "undefined"
          }

          if (payload.id !== undefined) {
            // <-- Check specifically for MaTK existence
            localStorage.setItem("MaTK", payload.id);
            console.log("Set MaTK:", payload.id);
          } else {
            console.error("payload.MaTK is missing or undefined!"); // <-- Log error if missing
            localStorage.removeItem("MaTK"); // Ensure it's not set to "undefined" string
          }
        } else {
          console.error("Failed to parse token payload.");
        }
      } catch (decodeError) {
        console.error("Error decoding or processing token:", decodeError);
        // Handle this error - maybe show a message to the user?
        setErrors({ submit: "Lỗi xử lý thông tin đăng nhập." });
        return; // Stop execution before navigating
      }
      // --- END DEBUGGING PAYLOAD ---

      // Check localStorage immediately AFTER setting, BEFORE navigating
      console.log(
        "localStorage MaTK right after setting:",
        localStorage.getItem("MaTK")
      );

      navigate("/homepage");
    } catch (error) {
      // Log the full error object for more details
      console.error("Login API call failed:", error);
      setErrors({
        submit:
          error.response?.data?.error ||
          "Đăng nhập thất bại. Kiểm tra lại thông tin.",
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
