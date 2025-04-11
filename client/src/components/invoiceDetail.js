import React, { useEffect, useState } from "react";

const InvoiceDetail = ({RoomId}) => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        fetch(`path`)
        .then((response) => response.json())
        .then((data) => setInvoices(data))
        .catch((error) => console.error('loi tai hoa don', error))
    }, [RoomId]);

    return (
        <div>
            <h4>Chi tiet hoa don cho phong {RoomId}</h4>
            {invoices.length === 0 ? (
                <p>Khong co hoa don nao.</p>
            ) : (
                <table border='1'>
                    <thead>
                        <tr>
                            <th>Mã Hóa Đơn</th>
                            <th>Ngày Lập</th>
                            <th>Tổng Tiền</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice.MaHoaDon}>
                            <td>{invoice.MaHoaDon}</td>
                            <td>{invoice.NgayLap}</td>
                            <td>{invoice.TongTien} VNĐ</td>
                            <td>{invoice.TrangThaiThanhToan}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default InvoiceDetail;