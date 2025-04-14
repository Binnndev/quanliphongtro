import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [userName, setUserName] = useState("");
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    console.log("Avatar clicked");
    const rect = e.target.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 5,
      left: rect.left,
    });
    setShowMenu((prev) => !prev);
  };

  const handleUpdateProfile = (e) => {
    e.stopPropagation();
    console.log("Cập nhật thông tin cá nhân clicked");
    setShowMenu(false);
    navigate("/profile");
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    console.log("Đăng xuất clicked");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("loaiTaiKhoan");
    localStorage.removeItem("MaTK");
    setShowMenu(false);
    navigate("/");
  };

  const portalTarget = document.getElementById("portal");

  return (
    <div
      ref={menuRef}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <img
        src="/path/to/avatar.png"
        alt="Avatar"
        onClick={handleAvatarClick}
        style={{
          cursor: "pointer",
          borderRadius: "50%",
          width: 40,
          height: 40,
        }}
      />
      <span style={{ marginLeft: 8 }}>{userName || "Guest"}</span>
      {showMenu &&
        portalTarget &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              backgroundColor: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              borderRadius: "4px",
              zIndex: 9999999,
              minWidth: "180px",
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={handleUpdateProfile}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              Cập nhật thông tin cá nhân
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              Đăng xuất
            </button>
          </div>,
          portalTarget
        )}
    </div>
  );
};

export default UserMenu;
