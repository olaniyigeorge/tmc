"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SchoolSwitcher: React.FC = () => {
  const [schools, setSchools] = useState<any[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSchools(j.data);
      });
  }, []);

  const change = (id: string) => {
    setCurrent(id);
    // store in localStorage or query for filtering later
    localStorage.setItem("adminSchool", id);
    router.refresh();
  };

  return (
    <div>
      <label>School:</label>
      <select value={current || ""} onChange={(e) => change(e.target.value)}>
        <option value="">--</option>
        {schools.map((s) => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
};

export default SchoolSwitcher;