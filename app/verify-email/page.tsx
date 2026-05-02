"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type VerificationStatus = "loading" | "success" | "expired" | "invalid";

type VerifyEmailResponse = {
  message?: string;
  error?: string;
};

const unavailableVerificationLinkMessage =
  "This verification link is invalid, expired, or already used. Please log in or request a new verification email.";

const statusContent: Record<
  VerificationStatus,
  {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
  }
> = {
  loading: {
    eyebrow: "Email verification",
    title: "Verifying your email",
    description: "One quick check and your TaskTracker account will be ready.",
    action: "Go to login",
  },
  success: {
    eyebrow: "Email verified",
    title: "Your email is verified",
    description: "You can now log in and start managing your tasks.",
    action: "Continue to login",
  },
  expired: {
    eyebrow: "Link expired",
    title: "Verification link unavailable",
    description: unavailableVerificationLinkMessage,
    action: "Back to login",
  },
  invalid: {
    eyebrow: "Invalid link",
    title: "Verification link unavailable",
    description: unavailableVerificationLinkMessage,
    action: "Back to login",
  },
};

function getTokenFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);

  return params.get("token");
}

export default function VerifyEmailPage() {
  const hasStartedVerification = useRef(false);
  const [status, setStatus] = useState<VerificationStatus>("loading");

  useEffect(() => {
    if (hasStartedVerification.current) {
      return;
    }

    hasStartedVerification.current = true;

    async function verifyEmail() {
      const token = getTokenFromHash();

      window.history.replaceState(null, "", window.location.pathname);

      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = (await response.json().catch(() => null)) as
          | VerifyEmailResponse
          | null;

        if (response.ok) {
          setStatus("success");
          return;
        }

        if (response.status === 410) {
          setStatus("expired");
          return;
        }

        console.warn("VERIFY_EMAIL_PAGE_ERROR", data?.error);
        setStatus("invalid");
      } catch (error) {
        console.error("VERIFY_EMAIL_PAGE_ERROR", error);
        setStatus("invalid");
      }
    }

    void verifyEmail();
  }, []);

  const content = statusContent[status];

  return (
    <main className="min-h-screen bg-white text-[#00033D]">
      <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,_rgba(151,125,255,0.22),_transparent_34%),linear-gradient(160deg,_#F2E6EE_0%,_#FFFFFF_58%,_#EEF2FF_100%)] px-6 py-10 sm:px-8 lg:px-12">
        <section className="w-full max-w-md rounded-[2rem] border border-[#977DFF]/14 bg-white/92 p-7 text-center shadow-[0_32px_90px_rgba(6,0,171,0.12)] backdrop-blur-sm sm:p-9">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.35rem] bg-[linear-gradient(135deg,_#977DFF,_#0033FF)] text-lg font-semibold text-white shadow-[0_18px_42px_rgba(0,51,255,0.24)]">
            TT
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#00033D]">
            {content.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#00033D]/66">
            {content.description}
          </p>

          {status === "loading" ? (
            <div
              className="mx-auto mt-7 h-10 w-10 animate-spin rounded-full border-4 border-[#977DFF]/18 border-t-[#0600AB]"
              aria-label="Verifying email"
            />
          ) : (
            <Link
              href="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-[#0600AB] px-4 py-3 text-base font-semibold text-white shadow-[0_18px_45px_rgba(6,0,171,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0033FF]"
            >
              {content.action}
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
