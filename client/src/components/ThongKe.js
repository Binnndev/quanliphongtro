import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
    <div className="thongke">
      <h2 className="thongke__title">
        <i className="fas fa-chart-pie" /> Thống kê
      </h2>

      {/* Trạng thái phòng */}
      <div className="thongke__section">
        <h4 className="thongke__section-title">Trạng thái phòng</h4>
        <div className="thongke__chart">
          <PieChart width={300} height={250}>
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
          <BarChart width={600} height={300} data={revenueData}>
            <XAxis dataKey="thang" />
            <YAxis />
            <Tooltip />
            <Legend />
            {revenueData.length > 0 &&
              Object.keys(revenueData[0])
                .filter((key) => key !== "thang")
                .map((key, idx) => (
                  <Bar key={key} dataKey={key} fill={["#2980B9", "#E67E22", "#2ECC71"][idx % 3]} />
                ))}
          </BarChart>
        </div>
      </div>

      {/* Tổng chi */}
      <div className="thongke__section">
        <h4 className="thongke__section-title">Tổng chi (VND)</h4>
        <div className="thongke__chart">
          <BarChart width={600} height={300} data={expenseData}>
            <XAxis dataKey="thang" />
            <YAxis />
            <Tooltip />
            <Legend />
            {expenseData.length > 0 &&
              Object.keys(expenseData[0])
                .filter((key) => key !== "thang")
                .map((key, idx) => (
                  <Bar key={key} dataKey={key} fill={["#8E44AD", "#16A085", "#C0392B"][idx % 3]} />
                ))}
          </BarChart>
        </div>
      </div>

      {/* Khách sắp hết hạn hợp đồng */}
      <div className="thongke__section">
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
  );
};

export default ThongKe;
