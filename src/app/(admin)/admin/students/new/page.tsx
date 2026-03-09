"use client";
import React from "react";
import StudentForm from "@/components/admin/StudentForm";

const NewStudentPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Student</h1>
      <StudentForm />
    </div>
  );
};

export default NewStudentPage;