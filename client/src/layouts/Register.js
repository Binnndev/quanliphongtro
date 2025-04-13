import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AnimatedSignature from "../components/AnimatedSignature";

export default function Register() {
  const navigate = useNavigate();
  // Dữ liệu đăng ký ban đầu: tên đăng nhập, mật khẩu, xác nhận mật khẩu và role
  const [formData, setFormData] = useState({
    TenDangNhap: "",
    MatKhau: "",
    confirmPassword: "",
    role: "", // Ban đầu chưa chọn, bắt buộc chọn loại tài khoản ở bước 2
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Multi-step form, bắt đầu từ bước 1

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate bước 1: thông tin cơ bản
  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.TenDangNhap)
      newErrors.TenDangNhap = "Tên người dùng là bắt buộc";
    if (!formData.MatKhau) newErrors.MatKhau = "Mật khẩu là bắt buộc";
    if (formData.MatKhau !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";
    return newErrors;
  };

  // Validate bước 2: chọn loại tài khoản
  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.role) {
      newErrors.role = "Vui lòng chọn loại tài khoản";
    }
    return newErrors;
  };

  // Xử lý chuyển bước
  const handleNext = (currentStep) => {
    if (currentStep === 1) {
      const step1Errors = validateStep1();
      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (currentStep === 2) {
      const step2Errors = validateStep2();
      if (Object.keys(step2Errors).length > 0) {
        setErrors(step2Errors);
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleBack = () => {
    // Cho phép quay lại bước trước nếu cần
    if (step > 1) setStep(step - 1);
  };

  // Khi người dùng xác nhận thông tin đăng ký (bước 3)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi dữ liệu đến API đăng ký, sử dụng trường:
      // TenDangNhap, MatKhau, LoaiTaiKhoan
      const response = await axios.post("/api/auth/register", {
        TenDangNhap: formData.TenDangNhap,
        MatKhau: formData.MatKhau,
        LoaiTaiKhoan: formData.role,
      });
      console.log("Đăng ký thành công", response.data);
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng ký", error.response.data);
      setErrors({ submit: error.response.data.error || "Đăng ký thất bại" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-md">
        <AnimatedSignature text="Đăng ký" />
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <h2 className="text-center text-white text-2xl mb-4">
                Thông tin cơ bản
              </h2>
              <div className="mb-4">
                <input
                  type="text"
                  name="TenDangNhap"
                  value={formData.TenDangNhap}
                  onChange={handleChange}
                  placeholder="Tên người dùng"
                  className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {errors.TenDangNhap && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.TenDangNhap}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  name="MatKhau"
                  value={formData.MatKhau}
                  onChange={handleChange}
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-3 rounded-full bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {errors.MatKhau && (
                  <p className="text-red-400 text-xs mt-1">{errors.MatKhau}</p>
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
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleNext(1)}
                  className="w-full py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-white hover:shadow-lg transition-all"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-center text-white text-2xl mb-4">
                Chọn loại tài khoản
              </h2>
              <div className="mb-4">
                <label className="text-white mr-2">Loại tài khoản:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="px-2 py-1 rounded"
                >
                  <option value="">-- Chọn loại tài khoản --</option>
                  <option value="Khách Thuê">Khách Thuê</option>
                  <option value="Chủ Trọ">Chủ Trọ</option>
                </select>
                {errors.role && (
                  <p className="text-red-400 text-xs mt-1">{errors.role}</p>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-2 px-4 bg-gray-300 text-gray-800 rounded"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(2)}
                  className="py-2 px-4 bg-white text-purple-700 rounded font-semibold hover:bg-white hover:shadow-lg transition-all"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-center text-white text-2xl mb-4">
                Xác nhận thông tin đăng ký
              </h2>
              <div className="mb-4">
                <p className="text-white">
                  <strong>Tên đăng nhập:</strong> {formData.TenDangNhap}
                </p>
                <p className="text-white">
                  <strong>Loại tài khoản:</strong> {formData.role}
                </p>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-2 px-4 bg-gray-300 text-gray-800 rounded"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-white text-purple-700 rounded font-semibold hover:bg-white hover:shadow-lg transition-all"
                >
                  Đăng ký
                </button>
              </div>
            </>
          )}
          {errors.submit && (
            <p className="text-red-400 text-xs mt-1">{errors.submit}</p>
          )}
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
