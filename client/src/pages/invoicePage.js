import React, { useEffect, useState } from "react";


const invoiceFrame = () => {

    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        fetch('path')
        .then((response) => response.json())
        .then((data) => setInvoices(data))
        .catch((error) => console.error("Lỗi tải hóa đơn: ", error));
    },[]);

    return (
        <div>
            <h2>Danh Sách hóa đơn</h2>
        </div>
    )
}