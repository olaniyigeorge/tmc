"use client";
import React from "react";
import Button from "ui/Button";

const PrintButton: React.FC = () => {
  return <Button onClick={() => window.print()}>Print</Button>;
};

export default PrintButton;
