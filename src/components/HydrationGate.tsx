"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useStore.getState().hydrate();
  }, []);
  return <>{children}</>;
}
