"use client";

import React, { useEffect, useState } from "react";
import { BrowserRouter, StaticRouter } from "react-router-dom";

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // During SSR / initial prerender, use StaticRouter
    // so react-router-dom does not access window/document
    return <StaticRouter location="/">{children}</StaticRouter>;
  }

  return <BrowserRouter>{children}</BrowserRouter>;
}