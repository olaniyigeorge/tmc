"use client";
// src/components/admin/StudentForm.tsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/* ── Inline schema (avoids import path issues in client components) ── */
const studentSchema = z.object({
  schoolId:    z.string().min(1, "School is required"),
  classId:     z.string().min(1, "Class is required"),
  studentCode: z.string().min(1, "Student code is required").max(30),
  admissionNo: z.string().max(30).optional().or(z.literal("")),
  firstName:   z.string().min(1, "First name is required").max(60),
  lastName:    z.string().min(1, "Last name is required").max(60),
  otherName:   z.string().max(60).optional().or(z.literal("")),
  sex:         z.enum(["M", "F"]).optional().or(z.literal("")),
  lga:         z.string().max(60).optional().or(z.literal("")),
  yearAdmitted:z.coerce.number().int().min(1990).max(new Date().getFullYear()).optional().or(z.literal("")),
});

type FormData = z.infer<typeof studentSchema>;

interface School { _id: string; name: string; type: string; }
interface Class  { _id: string; name: string; level: string; }

interface Props {
  initialData?: any;   // populated when editing
  mode?: "create" | "edit";
}

export default function StudentForm({ initialData, mode = "create" }: Props) {
  const router  = useRouter();
  const { data: session } = useSession();
  const user    = session?.user as any;

  const [schools,       setSchools]       = useState<School[]>([]);
  const [classes,       setClasses]       = useState<Class[]>([]);
  const [loadingSchools,setLoadingSchools] = useState(true);
  const [loadingClasses,setLoadingClasses] = useState(false);
  const [serverError,   setServerError]   = useState<string | null>(null);
  const [success,       setSuccess]       = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    // setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
      ? {
          schoolId:    initialData.schoolId    ?? "",
          classId:     initialData.classId     ?? "",
          studentCode: initialData.studentCode ?? "",
          admissionNo: initialData.admissionNo ?? "",
          firstName:   initialData.firstName   ?? "",
          lastName:    initialData.lastName    ?? "",
          otherName:   initialData.otherName   ?? "",
          sex:         initialData.sex         ?? "",
          lga:         initialData.lga         ?? "",
          yearAdmitted:initialData.yearAdmitted ?? "",
        }
      : {
          // Pre-select school for non-super-admins
          schoolId: user?.role !== "SUPER_ADMIN" ? (user?.schoolId ?? "") : "",
        },
  });

  const watchSchoolId = watch("schoolId");

  /* ── Fetch schools ── */
  useEffect(() => {
    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSchools(j.data); })
      .finally(() => setLoadingSchools(false));
  }, []);

  /* ── Fetch classes when school changes ── */
  useEffect(() => {
    if (!watchSchoolId) { setClasses([]); return; }
    setLoadingClasses(true);
    fetch(`/api/admin/classes?schoolId=${watchSchoolId}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setClasses(j.data); })
      .finally(() => setLoadingClasses(false));
  }, [watchSchoolId]);

  /* ── Submit ────────────────────────────────────────────────── */
  const onSubmit = async (data: FormData) => {
    setServerError(null);

    // Strip empty optional strings
    const payload: any = { ...data };
    if (!payload.admissionNo) delete payload.admissionNo;
    if (!payload.otherName)   delete payload.otherName;
    if (!payload.sex)         delete payload.sex;
    if (!payload.lga)         delete payload.lga;
    if (!payload.yearAdmitted) delete payload.yearAdmitted;

    const method = mode === "edit" ? "PATCH" : "POST";
    const url    = mode === "edit"
      ? `/api/admin/students/${initialData._id}`
      : "/api/admin/students";

    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (json.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/admin/students"), 900);
    } else {
      setServerError(
        typeof json.error === "string"
          ? json.error
          : "Validation failed. Please check your inputs."
      );
    }
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="student-form" noValidate>

      {/* Section: School & Class */}
      <div className="sf-section">
        <div className="sf-section-title">
          <span className="sf-section-icon">🏫</span>
          Placement
        </div>
        <div className="sf-grid-2">

          {/* School */}
          <div className="form-field">
            <label className="form-label" htmlFor="schoolId">School <span className="sf-required">*</span></label>
            {isSuperAdmin ? (
              <div className="sf-select-wrap">
                <select id="schoolId" className="form-input sf-select" {...register("schoolId")} disabled={loadingSchools}>
                  <option value="">— Select school —</option>
                  {schools.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <span className="sf-select-arrow">▾</span>
              </div>
            ) : (
              /* Non-super admins: show their school as read-only */
              <div className="sf-locked-field">
                <span className="sf-lock-icon">🔒</span>
                {schools.find((s) => s._id === watchSchoolId)?.name ?? "Loading…"}
                <input type="hidden" {...register("schoolId")} />
              </div>
            )}
            {errors.schoolId && <span className="sf-error">{errors.schoolId.message}</span>}
          </div>

          {/* Class */}
          <div className="form-field">
            <label className="form-label" htmlFor="classId">Class <span className="sf-required">*</span></label>
            <div className="sf-select-wrap">
              <select
                id="classId"
                className="form-input sf-select"
                {...register("classId")}
                disabled={!watchSchoolId || loadingClasses}
              >
                <option value="">
                  {!watchSchoolId ? "Select school first" : loadingClasses ? "Loading…" : "— Select class —"}
                </option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <span className="sf-select-arrow">▾</span>
            </div>
            {errors.classId && <span className="sf-error">{errors.classId.message}</span>}
          </div>

        </div>
      </div>

      {/* Section: Identity codes */}
      <div className="sf-section">
        <div className="sf-section-title">
          <span className="sf-section-icon">🪪</span>
          Identity
        </div>
        <div className="sf-grid-2">

          <div className="form-field">
            <label className="form-label" htmlFor="studentCode">
              Student Code <span className="sf-required">*</span>
              <span className="sf-hint-inline">Used for result lookup</span>
            </label>
            <input id="studentCode" className="form-input" placeholder="e.g. TMC/2024/001" {...register("studentCode")} />
            {errors.studentCode && <span className="sf-error">{errors.studentCode.message}</span>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="admissionNo">Admission No <span className="sf-optional">optional</span></label>
            <input id="admissionNo" className="form-input" placeholder="e.g. ADM/001" {...register("admissionNo")} />
            {errors.admissionNo && <span className="sf-error">{errors.admissionNo.message}</span>}
          </div>

        </div>
      </div>

      {/* Section: Personal info */}
      <div className="sf-section">
        <div className="sf-section-title">
          <span className="sf-section-icon">👤</span>
          Personal Information
        </div>
        <div className="sf-grid-3">

          <div className="form-field">
            <label className="form-label" htmlFor="lastName">Surname <span className="sf-required">*</span></label>
            <input id="lastName" className="form-input" placeholder="e.g. Okafor" {...register("lastName")} />
            {errors.lastName && <span className="sf-error">{errors.lastName.message}</span>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="firstName">First Name <span className="sf-required">*</span></label>
            <input id="firstName" className="form-input" placeholder="e.g. Chukwuemeka" {...register("firstName")} />
            {errors.firstName && <span className="sf-error">{errors.firstName.message}</span>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="otherName">Other Name <span className="sf-optional">optional</span></label>
            <input id="otherName" className="form-input" placeholder="e.g. James" {...register("otherName")} />
          </div>

        </div>

        <div className="sf-grid-3" style={{ marginTop: 16 }}>

          <div className="form-field">
            <label className="form-label">Sex <span className="sf-optional">optional</span></label>
            <div className="sf-radio-group">
              <label className="sf-radio-label">
                <input type="radio" value="M" {...register("sex")} />
                <span>Male</span>
              </label>
              <label className="sf-radio-label">
                <input type="radio" value="F" {...register("sex")} />
                <span>Female</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="lga">LGA <span className="sf-optional">optional</span></label>
            <input id="lga" className="form-input" placeholder="e.g. Ikeja" {...register("lga")} />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="yearAdmitted">Year Admitted <span className="sf-optional">optional</span></label>
            <input
              id="yearAdmitted" type="number" className="form-input"
              placeholder={`e.g. ${new Date().getFullYear()}`}
              min={1990} max={new Date().getFullYear()}
              {...register("yearAdmitted")}
            />
            {errors.yearAdmitted && <span className="sf-error">{errors.yearAdmitted.message}</span>}
          </div>

        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="form-error" role="alert">
          <span>⚠️</span> {serverError}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="sf-success" role="status">
          <span>✅</span> Student {mode === "edit" ? "updated" : "created"} successfully! Redirecting…
        </div>
      )}

      {/* Actions */}
      <div className="sf-actions">
        <button type="button" className="btn btn-secondary" onClick={() => router.push("/admin/students")} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || success}>
          {isSubmitting
            ? <><span className="spinner" /> {mode === "edit" ? "Saving…" : "Creating…"}</>
            : mode === "edit" ? "Save Changes" : "Create Student"
          }
        </button>
      </div>

    </form>
  );
}