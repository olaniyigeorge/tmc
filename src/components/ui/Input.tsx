import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input: React.FC<InputProps> = ({ className = "", ...rest }) => {
  return (
    <input
      className={"border p-2 rounded w-full " + className}
      {...rest}
    />
  );
};

export default Input;
