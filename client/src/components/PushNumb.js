import React from "react";

const PushNumb = ({text, numb}) => {
    return (
    <p className="text-info-rents">
        {text}: <span>{numb}</span>
    </p>
    );
};

export default PushNumb;