import React from 'react';

// Basic Input Field Component
const FormField = ({ label, id, type = "text", required = false, children, style, ...props }) => (
    // Không set width mặc định ở đây, để layout cha quyết định
    // hoặc nhận width qua props.style nếu cần
    <div style={{ marginBottom: '15px', ...style }}>
        <label htmlFor={id} style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>
            {required && <span style={{ color: 'red' }}>* </span>}{label} :
        </label>
        {children ? children : <input type={type} id={id} name={id} {...props} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />}
    </div>
);

export default FormField;