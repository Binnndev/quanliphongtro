import React from 'react';

const Button = ({class_name, label}) => {
    return (
        <button className={class_name}>{label}</button>
    )
}

export default Button;