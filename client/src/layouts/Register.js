import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="w-full h-screen flex items-center justify-center tracking-wider">
      <div className="w-11/12 glass sm:w-5/12 md:w-3/12 text-sm glass">
        <div className="w-full text-center my-3">
          <h2 className="text-2xl text-white font-poppins font-bold">
            Đăng Ký
          </h2>
        </div>

        <form className="my-2">
          <div className="flex border b-white border-b-2 mx-5 my-7 py-1 rounded-full">
            <input
              type="text"
              className="w-11/12 bg-transparent outline-none placeholder-white text-white rounded-full px-3"
              placeholder="Tên Đăng Nhập"
            />
            <div className="w-2/12 flex items-center justify-center rounded-full">
              <i className="fa-solid fa-user text-xl text-white"></i>
            </div>
          </div>

          <div className="flex border b-white border-b-2 mx-5 my-7 py-1 rounded-full">
            <input
              type="email"
              className="w-11/12 bg-transparent outline-none placeholder-white text-white rounded-full px-3"
              placeholder="Địa Chỉ Email"
            />
            <div className="w-2/12 flex items-center justify-center rounded-full">
              <i className="fa-solid fa-envelope text-xl text-white"></i>
            </div>
          </div>

          <div className="flex border b-white border-b-2 mx-5 my-7 py-1 rounded-full">
            <input
              type="password"
              className="w-11/12 bg-transparent outline-none placeholder-white text-white rounded-full px-3"
              placeholder="Mật Khẩu"
            />
            <div className="w-2/12 flex items-center justify-center rounded-full">
              <i className="fa-solid fa-lock text-xl text-white"></i>
            </div>
          </div>

          <div className="mx-5 my-7 py-2">
            <button className="bg-white w-full h-[35px] rounded-full text-black font-poppins font-bold">
              Đăng Ký
            </button>
          </div>

          <Link
            to="/"
            className="mx-5 my-7 py-2 flex items-center justify-center cursor-pointer rounded-full font-poppins"
          >
            <p className="text-sm text-white">
              Bạn đã có tài khoản? / Đăng nhập
            </p>
          </Link>
        </form>
      </div>
    </div>
  );
}
