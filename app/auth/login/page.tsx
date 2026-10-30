"use client"

export const dynamic = "force-dynamic";

import { AuthPage } from "@/views/AuthPage";

export default function LoginPage() {
  return <AuthPage initialMode="login" />;
}

