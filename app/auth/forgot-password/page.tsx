"use client"

export const dynamic = "force-dynamic";

import { AuthPage } from "@/views/AuthPage";

export default function ForgotPasswordPage() {
  return <AuthPage initialMode="forgot" />;
}

