"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const logout = () => {
    fetch("/api/auth/signout").then(() => {
      router.push("/admin/login");
    });
  };
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex justify-between">
        <div>
          <Link href="/admin/dashboard">
            <a className="mr-4">Dashboard</a>
          </Link>
          <Link href="/admin/students">
            <a className="mr-4">Students</a>
          </Link>
          <Link href="/admin/results">
            <a className="mr-4">Results</a>
          </Link>
        </div>
        <button onClick={logout}>Logout</button>
      </nav>
      <main className="p-4 flex-1">{children}</main>
    </div>
  );
};

export default AdminLayout;