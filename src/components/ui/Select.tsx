import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
const Select: React.FC<SelectProps> = ({ className = "", children, ...rest }) => {
  return (
    <select className={"border p-2 rounded w-full " + className} {...rest}>
      {children}
    </select>
  );
};

export default Select;
