import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({
    MaTK: "",
    TenDangNhap: "",
    HoTen: "",
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    Avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Giả sử bạn lưu MaTK vào localStorage với key "MaTK"
  const getUserId = () => localStorage.getItem("MaTK");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = getUserId();
        if (!userId) {
          setError("Không tìm thấy MaTK trong localStorage!");
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/tai-khoan/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setAvatarPreview(response.data.Avatar);
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      // Các trường cần cập nhật (chỉ gửi nếu thực sự cần).
      // Tên đăng nhập thường không cho sửa, bạn có thể bỏ qua hoặc để disabled.
      // formData.append("TenDangNhap", user.TenDangNhap);
      formData.append("HoTen", user.HoTen);
      formData.append("Email", user.Email);
      formData.append("SoDienThoai", user.SoDienThoai);
      formData.append("DiaChi", user.DiaChi);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const response = await axios.put(
        `/api/tai-khoan/${user.MaTK}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMessage("Cập nhật thông tin thành công!");
      setError("");
      // Cập nhật lại state user sau khi server trả về dữ liệu mới
      setUser(response.data);
      // Nếu backend trả về đường dẫn avatar mới, cập nhật preview
      setAvatarPreview(response.data.Avatar);
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi cập nhật thông tin.");
      setSuccessMessage("");
    }
  };

  if (loading) return <div>Đang tải thông tin...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
      <h2 style={{ marginBottom: 20 }}>Cập nhật thông tin cá nhân</h2>
      {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}
      {successMessage && (
        <p style={{ color: "green", marginBottom: 10 }}>{successMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        {/* Avatar */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: 5 }}>
            Ảnh đại diện:
          </label>
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="Avatar"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #ccc",
              display: "block",
              marginBottom: 10,
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "block", marginTop: 5 }}
          />
        </div>

        {/* Tên đăng nhập */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>
            Tên đăng nhập:
          </label>
          <input
            type="text"
            name="TenDangNhap"
            value={user.TenDangNhap}
            onChange={handleChange}
            disabled
            placeholder="Tên đăng nhập"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Họ tên */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Họ tên:</label>
          <input
            type="text"
            name="HoTen"
            value={user.HoTen || ""}
            onChange={handleChange}
            placeholder="Nhập họ tên của bạn"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Email:</label>
          <input
            type="email"
            name="Email"
            value={user.Email || ""}
            onChange={handleChange}
            placeholder="Nhập email của bạn"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Số điện thoại */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>
            Số điện thoại:
          </label>
          <input
            type="text"
            name="SoDienThoai"
            value={user.SoDienThoai || ""}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Địa chỉ */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Địa chỉ:</label>
          <input
            type="text"
            name="DiaChi"
            value={user.DiaChi || ""}
            onChange={handleChange}
            placeholder="Nhập địa chỉ của bạn"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Cập nhật
        </button>
      </form>
    </div>
  );
};

export default Profile;
