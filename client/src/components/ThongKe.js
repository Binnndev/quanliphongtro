import React, { useEffect, useState } from "react";
import axios from "axios";
import UserIcon from "./UserIcon";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const ThongKe = () => {
  const [roomStatus, setRoomStatus] = useState({ rented: 0, available: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);

  useEffect(() => {
    fetchThongKe();
  }, []);

  const fetchThongKe = async () => {
    try {
      const [statusRes, revenueRes, expenseRes, contractRes] = await Promise.all([
        axios.get("/api/dashboard/room-status"),
        axios.get("/api/dashboard/revenue"),
        axios.get("/api/dashboard/expense"),
        axios.get("/api/dashboard/expiring-contracts"),
      ]);
      setRoomStatus(statusRes.data);
      setRevenueData(revenueRes.data);
      setExpenseData(expenseRes.data);
      setExpiringContracts(contractRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    }
  };

  const pieData = [
    { name: "Đang thuê", value: roomStatus.rented },
    { name: "Phòng trống", value: roomStatus.available },
  ];

  const pieColors = ["#00B894", "#FFA500"];

    return (
        <div style={{ display: "flex", height: '100vh', position: 'fixed', top:0, justifyContent: 'center', width: "100%", overflow: 'hidden' }}>
        {/* Sidebar */}
        

        

        {/* Right Content Area */}
        <div style={{ width: '80%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#F4F4F4' }}>
             {/* Fixed Header */}
              <div style={{ height: 83, width: 'calc(80% - 0px)', background: 'white', borderBottom: '1px #D2D2D2 solid', display: "flex", justifyContent: 'space-between', alignItems: "center", position: 'fixed', top: 0, right: 0, zIndex: 10 }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: 20 }}>Thống kê</p>
                  <div style={{ marginRight: '20px' }}> <UserIcon /> </div>
              </div>
    <div className="thongke" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* <h2 className="thongke__title">
        <i className="fas fa-chart-pie" /> Thống kê
      </h2> */}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Trạng thái phòng */}
        <div className="thongke__section">
          <h4 className="thongke__section-title">Trạng thái phòng</h4>
          <div className="thongke__chart">
            <PieChart width={630} height={192}>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                labelLine={false}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(2)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </div>

        {/* Doanh thu */}
        <div className="thongke__section">
          <h4 className="thongke__section-title">Doanh thu (VND)</h4>
          <div className="thongke__chart">
            <LineChart width={670} height={192} data={revenueData}>
              <XAxis dataKey="thang" />
              <YAxis />
              <Tooltip />
              <Legend />
              {revenueData.length > 0 &&
                Object.keys(revenueData[0])
                  .filter((key) => key !== "thang")
                  .map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={["#2980B9", "#E67E22", "#2ECC71"][idx % 3]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
            </LineChart>
          </div>
        </div>
      </div>

      {/* Tổng chi & Hợp đồng sắp hết hạn */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="thongke__section">
          <h4 className="thongke__section-title">Tổng chi (VND)</h4>
          <div className="thongke__chart">
            <LineChart width={670} height={192} data={expenseData}>
              <XAxis dataKey="thang" />
              <YAxis />
              <Tooltip />
              <Legend />
              {expenseData.length > 0 &&
                Object.keys(expenseData[0])
                  .filter((key) => key !== "thang")
                  .map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={["#8E44AD", "#16A085", "#C0392B"][idx % 3]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
            </LineChart>
          </div>
        </div>

        {/* Hợp đồng sắp hết hạn */}
        <div className="thongke__section" style={{ width: "670px" }}>
          <h4 className="thongke__section-title">Khách sắp hết hạn hợp đồng</h4>
          <table className="thongke__table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Nhà</th>
                <th>Phòng</th>
                <th>Khách thuê</th>
                <th>Ngày hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {expiringContracts.length === 0 ? (
                <tr><td colSpan="5">Không có hợp đồng sắp hết hạn</td></tr>
              ) : (
                expiringContracts.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.tenNhaTro}</td>
                    <td>{item.tenPhong}</td>
                    <td>{item.hoTen}</td>
                    <td>{item.ngayKetThuc}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
                </div>
            </div>
        </div>
  );
};

export default ThongKe;
