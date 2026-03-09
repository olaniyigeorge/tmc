"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentCreateSchema } from "../../validation/admin";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { z } from "zod";

import { useRouter } from "next/navigation";

type FormData = z.infer<typeof studentCreateSchema>;

interface Props {
  initialData?: any;
}

const StudentForm: React.FC<Props> = ({ initialData }) => {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(studentCreateSchema), defaultValues: initialData || {} });
  const watchSchoolId = watch("schoolId");
  useEffect(() => {
    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSchools(j.data);
      });
  }, []);

  useEffect(() => {
    if (watchSchoolId) {
      fetch(`/api/admin/classes?schoolId=${watchSchoolId}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) setClasses(j.data);
        });
    } else {
      setClasses([]);
    }
  }, [watchSchoolId]);

  const onSubmit = async (data: FormData) => {
    const method = initialData ? "PATCH" : "POST";
    const url = initialData ? `/api/admin/students/${initialData._id}` : "/api/admin/students";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) {
      router.push("/admin/students");
    } else {
      alert(json.error || "Error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label>School</label>
        <Select {...register("schoolId")}> 
          <option value="">Select</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </Select>
        {errors.schoolId && <p className="text-red-600">{errors.schoolId.message}</p>}
      </div>
      <div>
        <label>Class</label>
        <Select {...register("classId")}> 
          <option value="">Select</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
        {errors.classId && <p className="text-red-600">{errors.classId.message}</p>}
      </div>
      <div>
        <label>Student Code</label>
        <Input {...register("studentCode")} />
        {errors.studentCode && <p className="text-red-600">{errors.studentCode.message}</p>}
      </div>
      <div>
        <label>Admission No (optional)</label>
        <Input {...register("admissionNo")} />
        {errors.admissionNo && <p className="text-red-600">{errors.admissionNo.message}</p>}
      </div>
      <div>
        <label>First Name</label>
        <Input {...register("firstName")} />
        {errors.firstName && <p className="text-red-600">{errors.firstName.message}</p>}
      </div>
      <div>
        <label>Last Name</label>
        <Input {...register("lastName")} />
        {errors.lastName && <p className="text-red-600">{errors.lastName.message}</p>}
      </div>
      <Button disabled={isSubmitting}>{initialData ? "Save" : "Create"}</Button>
    </form>
  );
};

export default StudentForm;