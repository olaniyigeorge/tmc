"use client"
import SchoolSelect from "@/components/public/SchoolSelect";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Results Portal</h1>
      <SchoolSelect />
      <div className="mt-6">
        <Link href="/verify" className="text-blue-600 underline">
          Verify Result
        </Link>
      </div>
    </div>
  );
}
