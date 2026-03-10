"use client";
import React from "react";
import Button from "ui/Button";

interface Props {
  onConfirm: () => void;
}

const PublishDialog: React.FC<Props> = ({ onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <p>Are you sure you want to publish? PIN will be shown once.</p>
        <div className="mt-4 flex justify-end">
          <Button onClick={onConfirm}>Yes, publish</Button>
        </div>
      </div>
    </div>
  );
};

export default PublishDialog;