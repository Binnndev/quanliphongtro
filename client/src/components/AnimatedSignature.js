import React from "react";

const AnimatedSignature = ({ text }) => {
  return (
    <h2 data-text={text} className="signature-text text-wrap-sidebar">
      {text}
    </h2>
  );
};

export default AnimatedSignature;
