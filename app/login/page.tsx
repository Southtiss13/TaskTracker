"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const initialForm: LoginFormValues = {
  email: "",
  password: "",
};

const emailNotVerifiedMessage = "Please verify your email before logging in.";
const resendVerificationSuccessMessage =
  "If this email exists and is not verified, a verification email has been sent.";

export default function LoginPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [form, setForm] = useState<LoginFormValues>(initialForm);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

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
      } catch (error) {
        console.error("LOGIN_AUTH_CHECK_ERROR", error);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleChange(field: keyof LoginFormValues, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setApiError("");
    setIsEmailNotVerified(false);
    setResendMessage("");
    setResendError("");
  }

  function validateForm() {
    const result = loginFormSchema.safeParse({
      email: form.email.trim(),
      password: form.password,
    });

    if (result.success) {
      setErrors({});
      return result.data;
    }

    const fieldErrors: LoginFormErrors = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field === "string" && !(field in fieldErrors)) {
        fieldErrors[field as keyof LoginFormValues] = issue.message;
      }
    }

    setErrors(fieldErrors);
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    const validatedData = validateForm();

    if (!validatedData) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = (await response.json().catch(() => null)) as
        | { code?: string; error?: string }
        | null;

      if (!response.ok) {
        const isUnverified =
          response.status === 403 &&
          (data?.code === "EMAIL_NOT_VERIFIED" ||
            data?.error === emailNotVerifiedMessage);

        setIsEmailNotVerified(isUnverified);
        setApiError(
          isUnverified
            ? emailNotVerifiedMessage
            : data?.error ?? "Unable to log in",
        );
        return;
      }

      router.push("/tasks");
    } catch (error) {
      console.error("LOGIN_PAGE_ERROR", error);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setResendMessage("");
    setResendError("");

    const emailResult = z
      .email("Please enter a valid email address")
      .safeParse(form.email.trim());

    if (!emailResult.success) {
      setResendError("Enter your email address, then try again.");
      return;
    }

    try {
      setIsResendingVerification(true);

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailResult.data }),
      });

      if (!response.ok) {
        setResendError("Unable to send verification email. Please try again.");
        return;
      }

      setResendMessage(resendVerificationSuccessMessage);
    } catch (error) {
      console.error("RESEND_VERIFICATION_PAGE_ERROR", error);
      setResendError("Unable to send verification email. Please try again.");
    } finally {
      setIsResendingVerification(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-white text-[#00033D]">
        <div className="grid min-h-screen place-items-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-[2rem] border border-[#977DFF]/12 bg-white p-7 text-center shadow-[0_32px_90px_rgba(6,0,171,0.10)] sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
              Sign in
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#00033D]">
              Checking your session
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#00033D]/66">
              Getting your workspace ready.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#00033D]">
      <div className="grid min-h-screen lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(0,51,255,0.12),_transparent_34%),linear-gradient(180deg,_#FFFFFF_0%,_#F2E6EE_100%)] px-6 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex h-full flex-col justify-between">
            <div className="max-w-xl space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#977DFF]/12 bg-white/80 px-4 py-2 text-sm font-medium shadow-[0_18px_50px_rgba(6,0,171,0.08)] backdrop-blur-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#977DFF]" />
                TaskTracker
              </div>

              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#0600AB]/70">
                  Focused planning
                </p>
                <div className="space-y-4">
                  <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-[#00033D] sm:text-5xl lg:text-6xl">
                    Return to a workspace built to keep daily progress visible.
                  </h1>
                  <p className="max-w-md text-base leading-7 text-[#00033D]/72 sm:text-lg">
                    Organize your tasks, track progress, and stay focused.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <div className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_rgba(6,0,171,0.08)] backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0600AB]">
                      Task flow, without the clutter
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#00033D]/70">
                      Track personal priorities, update status quickly, and keep
                      your next move clear.
                    </p>
                  </div>
                  <div className="grid h-20 w-20 place-items-center rounded-[1.75rem] bg-[linear-gradient(135deg,_#977DFF,_#0033FF)] text-lg font-semibold text-white shadow-[0_20px_45px_rgba(0,51,255,0.25)]">
                    TT
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] bg-[#FFCFF2]/55 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                    Clear status
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#00033D]/76">
                    Move tasks from to-do to done with just enough structure.
                  </p>
                </div>
                <div className="rounded-[1.75rem] bg-[#977DFF]/12 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                    Personal focus
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#00033D]/76">
                    Keep your own work organized before layering on more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-md rounded-[2rem] border border-[#977DFF]/12 bg-white p-7 shadow-[0_32px_90px_rgba(6,0,171,0.10)] sm:p-9">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                Sign in
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#00033D]">
                Welcome back
              </h2>
              <p className="text-sm leading-6 text-[#00033D]/66">
                Log in to pick up your tasks and keep your momentum going.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#00033D]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base text-[#00033D] outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
                  placeholder="you@example.com"
                />
                {errors.email ? (
                  <p id="email-error" className="text-sm text-[#C13274]">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#00033D]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(event) =>
                      handleChange("password", event.target.value)
                    }
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 pr-20 text-base text-[#00033D] outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-medium text-[#0600AB] transition hover:bg-[#977DFF]/10"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password ? (
                  <p id="password-error" className="text-sm text-[#C13274]">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              {apiError ? (
                <div className="rounded-2xl border border-[#FFCFF2] bg-[#FFF4FB] px-4 py-3 text-sm text-[#9E1F61]">
                  <p>{apiError}</p>

                  {isEmailNotVerified ? (
                    <div className="mt-3 space-y-3">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#0600AB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(6,0,171,0.20)] transition hover:bg-[#0033FF] disabled:cursor-not-allowed disabled:bg-[#A6A8D4] disabled:shadow-none"
                      >
                        {isResendingVerification
                          ? "Sending..."
                          : "Resend verification email"}
                      </button>

                      {resendMessage ? (
                        <p className="rounded-xl border border-[#977DFF]/14 bg-white px-3 py-2 text-[#0600AB]">
                          {resendMessage}
                        </p>
                      ) : null}

                      {resendError ? (
                        <p className="rounded-xl border border-[#FFCFF2] bg-white px-3 py-2 text-[#9E1F61]">
                          {resendError}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0600AB] px-4 py-3 text-base font-semibold text-white shadow-[0_18px_45px_rgba(6,0,171,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0033FF] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#A6A8D4] disabled:shadow-none"
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#00033D]/66">
              Need an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#0600AB] underline-offset-4 transition hover:text-[#0033FF] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
