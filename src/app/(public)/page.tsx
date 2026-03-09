import React from "react";
import SchoolSelect from "@/components/public/SchoolSelect";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Results Portal</h1>
      <SchoolSelect onSelect={(s) => {
        // navigate to check with school preselected
        window.location.href = `/check?schoolId=${s._id}`;
      }} />
      <div className="mt-6">
        <Link href="/verify">
          <a className="text-blue-600 underline">Verify Result</a>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
