"use client";
import React, { useEffect, useState } from "react";
import { School } from "@/types";
import Card from "../ui/Card";
import { useRouter } from "next/navigation";

interface Props {
  onSelect?: (school: School) => void;
}

const SchoolSelect: React.FC<Props> = ({ onSelect }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/admin/schools")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setSchools(data.data);
      });
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schools.map((s) => (
        <Card key={s._id} className="cursor-pointer" onClick={() => {
          if (onSelect) onSelect(s);
        }}>
          <h3 className="text-lg font-bold">{s.name}</h3>
          <p>{s.type}</p>
        </Card>
      ))}
    </div>
  );
};

export default SchoolSelect;
