"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface School {
  _id: string;
  name: string;
  type: "SECONDARY" | "PRIMARY";
}

export default function SchoolSwitcher() {
  const [schools, setSchools] = useState<School[]>([]);
  const [current, setCurrent] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Restore previously selected school
    const saved = localStorage.getItem("adminSchool") ?? "";
    setCurrent(saved);

    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSchools(j.data); });
  }, []);

  function handleChange(id: string) {
    setCurrent(id);
    localStorage.setItem("adminSchool", id);
    router.refresh();
  }

  // Don't render anything until schools are loaded (avoids flash)
  if (schools.length === 0) return null;

  // Only SUPER_ADMIN sees multiple schools; if only one, nothing to switch
  if (schools.length === 1) {
    return (
      <div className="school-chip-single">
        <span className={`school-type-dot ${schools[0].type === "SECONDARY" ? "pink" : "blue"}`} />
        {schools[0].name}
      </div>
    );
  }

  const active = schools.find((s) => s._id === current);

  return (
    <div className="school-switcher">
      <label className="switcher-label">Viewing school</label>
      <div className="switcher-select-wrap">
        {active && (
          <span className={`school-type-dot ${active.type === "SECONDARY" ? "pink" : "blue"}`} />
        )}
        <select
          className="switcher-select"
          value={current}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">All Schools</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="switcher-chevron">▾</span>
      </div>
    </div>
  );
}