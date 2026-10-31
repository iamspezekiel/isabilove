"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const dynamic = "force-dynamic";

import { DashboardPage } from "@/views/DashboardPage";

export default function DashboardRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    // Always redirect to login for now - auth check can be added later
    navigate('/auth/login', { replace: true });
  }, []);

  return <DashboardPage />;
}