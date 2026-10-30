"use client"

export const dynamic = "force-dynamic";

import { AuthPage } from "@/views/AuthPage";

export default function SignupPage() {
  return <AuthPage initialMode="signup" />;
}

