"use client";
import React, { useEffect, useState } from "react";
import StudentsTable from "@/components/admin/StudentsTable";
import Link from "next/link";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSchool, setFilterSchool] = useState("");

  const load = () => {
    let url = "/api/admin/students";
    const params: string[] = [];
    if (filterClass) params.push(`classId=${filterClass}`);
    if (filterSchool) params.push(`schoolId=${filterSchool}`);
    if (params.length) url += `?${params.join("&")}`;
    fetch(url).then(r=>r.json()).then(j=>{if(j.ok) setStudents(j.data)});
  };

  useEffect(() => {
    fetch("/api/admin/classes").then(r=>r.json()).then(j=>{if(j.ok) setClasses(j.data)});
    fetch("/api/admin/schools").then(r=>r.json()).then(j=>{if(j.ok) setSchools(j.data)});
    load();
  }, []);

  useEffect(() => {
    load();
  }, [filterClass, filterSchool]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Students</h1>
      <div className="mb-4">
        <Link href="/admin/students/new"><a className="px-3 py-1 bg-green-600 text-white rounded">New Student</a></Link>
      </div>
      <div className="mb-4 flex gap-2">
        {schools.length > 1 && (
          <select value={filterSchool} onChange={e=>setFilterSchool(e.target.value)} className="border p-2">
            <option value="">All schools</option>
            {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        )}
        <select value={filterClass} onChange={e=>setFilterClass(e.target.value)} className="border p-2">
          <option value="">All classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <StudentsTable students={students} />
    </div>
  );
};

export default StudentsPage;