import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button: React.FC<ButtonProps> = ({ children, className = "", ...rest }) => {
  return (
    <button
      className={"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 " + className}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
