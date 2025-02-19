const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,  
    user: 'admin',
    password: 'quanlynhatro',
    database: 'QuanLyNhaTro'
});

connection.connect(err => {
    if (err) {
        console.error('❌ Kết nối thất bại:', err);
        return;
    }
    console.log('✅ Kết nối thành công đến RDS!');

    connection.query('SHOW TABLES;', (err, results) => {
        if (err) {
            console.error('❌ Truy vấn thất bại:', err);
        } else {
            console.log('📌 Danh sách bảng:', results);
        }
        connection.end();
    });

    connection.query('SELECT * FROM NhaTro;', (err, results) => {
        if (err) {
            console.error('❌ Truy vấn thất bại:', err);
        } else {
            console.log('📌 Danh sách:', results);
        }
        connection.end();
    });
});
