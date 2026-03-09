"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkSchema } from "../../validation/public";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof checkSchema>;

import { z } from "zod";

const CheckForm: React.FC = () => {
  const router = useRouter();
  const [schools, setSchools] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch('/api/admin/schools').then(r => r.json()).then(j => {
      if (j.ok) setSchools(j.data);
    });
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(checkSchema) });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sch = params.get("schoolId");
    if (sch) {
      setValue("schoolId", sch);
    }
  }, [setValue]);
  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/public/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) {
      router.push(`/result/${json.data.resultId}`);
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
          {schools.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </Select>
        {errors.schoolId && <p className="text-red-600">{errors.schoolId.message}</p>}
      </div>
      <div>
        <label>Student Code</label>
        <Input {...register("studentCode")} />
        {errors.studentCode && <p className="text-red-600">{errors.studentCode.message}</p>}
      </div>
      <div>
        <label>Session</label>
        <Input {...register("session")} />
        {errors.session && <p className="text-red-600">{errors.session.message}</p>}
      </div>
      <div>
        <label>Term</label>
        <Select {...register("term")}>        
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
        </Select>
        {errors.term && <p className="text-red-600">{errors.term.message}</p>}
      </div>
      <div>
        <label>PIN</label>
        <Input {...register("pin")} type="password" />
        {errors.pin && <p className="text-red-600">{errors.pin.message}</p>}
      </div>
      <Button disabled={isSubmitting}>Check</Button>
    </form>
  );
};

export default CheckForm;
