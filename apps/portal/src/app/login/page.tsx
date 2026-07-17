"use client";

import { useState } from "react";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { DemoAccountCard } from "@/components/features/auth/DemoAccountCard";

export default function LoginPage() {
  const [prefill, setPrefill] = useState<{
    email: string;
    password: string;
  } | null>(null);

  return (
    <>
      <DemoAccountCard
        onSelectAccount={(email, password) => setPrefill({ email, password })}
      />
      <LoginForm
        prefillEmail={prefill?.email}
        prefillPassword={prefill?.password}
      />
    </>
  );
}
