"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter, StaticRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";

// Lazy-load BrowserRouter-related heavy imports to prevent SSR issues
export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // During SSR / initial prerender, use StaticRouter
    // so react-router-dom does not access window/document
    return <StaticRouter location="/"><Layout>{children}</Layout></StaticRouter>;
  }

  return <BrowserRouter><Layout>{children}</Layout></BrowserRouter>;
}