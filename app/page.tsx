"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/tasks");
          return;
        }

        router.replace("/login");
      } catch {
        router.replace("/login");
      }
    }

    void checkAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-[#00033D]">
      <div className="rounded-[2rem] border border-[#977DFF]/15 bg-white px-8 py-7 text-center shadow-[0_24px_70px_rgba(6,0,171,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
          TaskTracker
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Loading your workspace
        </h1>
        <p className="mt-2 text-sm text-[#00033D]/60">
          Checking your session...
        </p>
      </div>
    </main>
  );
}