"use client";
import React, { useEffect, useState } from "react";
import ResultsTable from "@/components/admin/ResultsTable";
import Link from "next/link";

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("");

  const load = () => {
    let url = "/api/admin/results";
    const params: string[] = [];
    if (filterSchool) params.push(`schoolId=${filterSchool}`);
    if (filterClass) params.push(`classId=${filterClass}`);
    if (session) params.push(`session=${session}`);
    if (term) params.push(`term=${term}`);
    if (params.length) url += `?${params.join("&")}`;
    fetch(url).then(r => r.json()).then(j=>{if(j.ok) setResults(j.data)});
  };

  useEffect(() => {
    fetch("/api/admin/classes").then(r=>r.json()).then(j=>{if(j.ok) setClasses(j.data)});
    fetch("/api/admin/schools").then(r=>r.json()).then(j=>{if(j.ok) setSchools(j.data)});
    load();
  }, []);

  useEffect(() => { load(); }, [filterSchool, filterClass, session, term]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Results</h1>
      <div className="mb-4">
        <Link href="/admin/results/new"><a className="px-3 py-1 bg-green-600 text-white rounded">New Result</a></Link>
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
        <input
          className="border p-2"
          placeholder="Session"
          value={session}
          onChange={e=>setSession(e.target.value)}
        />
        <select value={term} onChange={e=>setTerm(e.target.value)} className="border p-2">
          <option value="">Term</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
        </select>
      </div>
      <ResultsTable results={results} />
    </div>
  );
};

export default ResultsPage;