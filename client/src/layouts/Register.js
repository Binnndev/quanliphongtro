import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AnimatedSignature from "../components/AnimatedSignature";

const Input = ({ label, name, value, onChange, type = "text", error }) => (
  <div className="mb-4">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={label}
      className="w-full px-4 py-3 rounded-full bg-white bg-opacity-30 text-white
                 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default function Register() {
  const navigate = useNavigate();

  // STEP & ROLE
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(""); // lưu riêng để hiển thị nhanh

  // FORM DATA
  const [formData, setFormData] = useState({
    TenDangNhap: "",
    MatKhau: "",
    confirmPassword: "",
    LoaiTaiKhoan: "",

    // Chủ trọ
    HoTen: "",
    SoDienThoai: "",
    Email: "",
    DiaChi: "",

    // Khách thuê
    CCCD: "",
    NgaySinh: "",
    GioiTinh: "Nam",
  });
  const [errors, setErrors] = useState({});

  // ──────────────────────────────────
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => {
    const vErr = validate(step);
    if (Object.keys(vErr).length) return setErrors(vErr);
    setErrors({});
    setStep(step + 1);
  };
  const handleBack = () => setStep(step - 1);

  // ──────────────────────────────────
  const validate = (currentStep) => {
    const err = {};
    if (currentStep === 1) {
      if (!formData.TenDangNhap) err.TenDangNhap = "Bắt buộc";
      if (!formData.MatKhau) err.MatKhau = "Bắt buộc";
      if (formData.MatKhau !== formData.confirmPassword)
        err.confirmPassword = "Mật khẩu không khớp";
    }
    if (currentStep === 2) {
      if (!formData.LoaiTaiKhoan) err.LoaiTaiKhoan = "Chọn loại tài khoản";
    }
    if (currentStep === 3) {
      if (formData.LoaiTaiKhoan === "Chủ Trọ") {
        if (!formData.HoTen) err.HoTen = "Bắt buộc";
        if (!formData.SoDienThoai) err.SoDienThoai = "Bắt buộc";
        if (!formData.Email) err.Email = "Bắt buộc";
      } else {
        // Khách Thuê
        if (!formData.CCCD) err.CCCD = "Bắt buộc";
        if (!formData.NgaySinh) err.NgaySinh = "Bắt buộc";
      }
    }
    return err;
  };

  // ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const vErr = validate(step);
    if (Object.keys(vErr).length) return setErrors(vErr);

    try {
      const payload = { ...formData };
      delete payload.confirmPassword;
      await axios.post("/api/auth/register", payload);
      alert("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || "Đăng ký thất bại" });
    }
  };

  // ──────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8 w-full max-w-lg">
        <AnimatedSignature text="Đăng ký" />

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <h2 className="text-center text-white text-2xl mb-6">
                Thông Tin Cơ Bản
              </h2>

              <Input
                label="Tên đăng nhập"
                name="TenDangNhap"
                value={formData.TenDangNhap}
                onChange={handleChange}
                error={errors.TenDangNhap}
              />

              <Input
                label="Mật khẩu"
                name="MatKhau"
                type="password"
                value={formData.MatKhau}
                onChange={handleChange}
                error={errors.MatKhau}
              />

              <Input
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 bg-white text-purple-700 rounded-full font-semibold hover:shadow-lg"
              >
                Tiếp theo
              </button>
            </>
          )}

          {/* ── STEP 2 ─────────────────── */}
          {step === 2 && (
            <>
              <h2 className="text-center text-white text-2xl mb-6">
                Chọn Loại Tài Khoản
              </h2>

              <div className="flex flex-col gap-4 mb-6">
                {["Khách Thuê", "Chủ Trọ"].map((opt) => {
                  const id = `role-${opt.replace(/\s+/g, "")}`;
                  return (
                    <label
                      key={opt}
                      htmlFor={id}
                      className="inline-flex items-center gap-3 text-white cursor-pointer"
                    >
                      <input
                        id={id}
                        type="radio"
                        name="LoaiTaiKhoan"
                        value={opt}
                        checked={formData.LoaiTaiKhoan === opt}
                        onChange={(e) => {
                          handleChange(e);
                          setRole(opt);
                        }}
                        className="h-4 w-4 cursor-pointer"
                      />
                      <span className="select-none">{opt}</span>
                    </label>
                  );
                })}

                {errors.LoaiTaiKhoan && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.LoaiTaiKhoan}
                  </p>
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
                  onClick={handleNext}
                  className="py-2 px-4 bg-white text-purple-700 rounded font-semibold hover:shadow-lg"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}
          {/* ── STEP 3 ─────────────────── */}
          {step === 3 && (
            <>
              {formData.LoaiTaiKhoan === "Chủ Trọ" ? (
                <>
                  <h2 className="text-center text-white text-2xl mb-6">
                    Thông Tin Chủ Trọ
                  </h2>
                  <Input label="Họ tên" name="HoTen" />
                  <Input label="Số điện thoại" name="SoDienThoai" />
                  <Input label="Email" name="Email" />
                  <Input label="Địa chỉ" name="DiaChi" />
                </>
              ) : (
                <>
                  <h2 className="text-center text-white text-2xl mb-6">
                    Thông Tin Khách Thuê
                  </h2>
                  <Input label="CCCD" name="CCCD" />
                  <Input label="Ngày sinh" name="NgaySinh" type="date" />
                  <div className="mb-4 text-white">
                    <select
                      name="GioiTinh"
                      value={formData.GioiTinh}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-full bg-white bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </>
              )}

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
                  onClick={handleNext}
                  className="py-2 px-4 bg-white text-purple-700 rounded font-semibold hover:shadow-lg"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}
          {/* ── STEP 4 ─────────────────── */}
          {step === 4 && (
            <>
              <h2 className="text-center text-white text-2xl mb-6">
                Xác Nhận Thông Tin
              </h2>
              <div className="mb-4 text-white space-y-1">
                <p>
                  <strong>Tên đăng nhập:</strong> {formData.TenDangNhap}
                </p>
                <p>
                  <strong>Loại tài khoản:</strong> {formData.LoaiTaiKhoan}
                </p>

                {formData.LoaiTaiKhoan === "Chủ Trọ" ? (
                  <>
                    <p>
                      <strong>Họ tên:</strong> {formData.HoTen}
                    </p>
                    <p>
                      <strong>SĐT:</strong> {formData.SoDienThoai}
                    </p>
                    <p>
                      <strong>Email:</strong> {formData.Email}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {formData.DiaChi}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>CCCD:</strong> {formData.CCCD}
                    </p>
                    <p>
                      <strong>Ngày sinh:</strong> {formData.NgaySinh}
                    </p>
                    <p>
                      <strong>Giới tính:</strong> {formData.GioiTinh}
                    </p>
                  </>
                )}
              </div>

              {errors.submit && (
                <p className="text-red-400 text-xs mb-2">{errors.submit}</p>
              )}

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
                  className="py-2 px-4 bg-white text-purple-700 rounded font-semibold hover:shadow-lg"
                >
                  Đăng ký
                </button>
              </div>
            </>
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
