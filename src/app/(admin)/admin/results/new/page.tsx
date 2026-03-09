"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const NewResultPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/schools").then(r=>r.json()).then(j=>{if(j.ok) setSchools(j.data)});
  }, []);

  useEffect(() => {
    if (schoolFilter) {
      fetch(`/api/admin/classes?schoolId=${schoolFilter}`).then(r=>r.json()).then(j=>{if(j.ok) setClasses(j.data)});
    } else {
      fetch("/api/admin/classes").then(r=>r.json()).then(j=>{if(j.ok) setClasses(j.data)});
    }
  }, [schoolFilter]);
  useEffect(() => {
    let url = "/api/admin/students";
    const params: string[] = [];
    if (classFilter) params.push(`classId=${classFilter}`);
    if (schoolFilter) params.push(`schoolId=${schoolFilter}`);
    if (params.length) url += `?${params.join("&")}`;
    fetch(url).then(r=>r.json()).then(j=>{if(j.ok) setStudents(j.data)});
  }, [classFilter, schoolFilter]);

  const submit = async () => {
    const res = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, session, term }),
    });
    const json = await res.json();
    if (json.ok) {
      router.push(`/admin/results/${json.data._id}/edit`);
    } else {
      alert(json.error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Result</h1>
      <div className="space-y-4 max-w-md">
        <div>
          <label>School</label>
          <Select value={schoolFilter} onChange={e=>setSchoolFilter(e.target.value)}>
            <option value="">All</option>
            {schools.map(s=> <option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
        </div>
        <div>
          <label>Class</label>
          <Select value={classFilter} onChange={e=>setClassFilter(e.target.value)}>
            <option value="">All</option>
            {classes.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
        </div>
        <div>
          <label>Student</label>
          <Select value={studentId} onChange={e=>setStudentId(e.target.value)}>
            <option value="">Select</option>
            {students.map(s=> <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
          </Select>
        </div>
        <div>
          <label>Session</label>
          <Input value={session} onChange={e=>setSession(e.target.value)} />
        </div>
        <div>
          <label>Term</label>
          <Select value={term} onChange={e=>setTerm(e.target.value)}>
            <option value="">Select</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
          </Select>
        </div>
        <Button onClick={submit}>Create</Button>
      </div>
    </div>
  );
};

export default NewResultPage;