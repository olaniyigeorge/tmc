"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "../../validation/public";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";
import { z } from "zod";

type FormData = z.infer<typeof verifySchema>;

const VerifyForm: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(verifySchema) });
  const onSubmit = (data: FormData) => {
    router.push(`/verify/${data.code}`);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label>Verification Code</label>
        <Input {...register("code")} />
        {errors.code && <p className="text-red-600">{errors.code.message}</p>}
      </div>
      <Button disabled={isSubmitting}>Verify</Button>
    </form>
  );
};

export default VerifyForm;
