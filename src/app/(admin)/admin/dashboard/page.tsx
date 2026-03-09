import React from "react";
import SchoolSwitcher from "@/components/admin/SchoolSwitcher";
import Link from "next/link";

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <SchoolSwitcher />
      <div className="mt-4">
        <Link href="/admin/students"><a className="text-blue-600 underline mr-4">Manage Students</a></Link>
        <Link href="/admin/results"><a className="text-blue-600 underline">Manage Results</a></Link>
      </div>
    </div>
  );
};

export default DashboardPage;