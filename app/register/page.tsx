"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

const initialForm: RegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [form, setForm] = useState<RegisterFormValues>(initialForm);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        console.error("REGISTER_AUTH_CHECK_ERROR", error);
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

  function handleChange(field: keyof RegisterFormValues, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setApiError("");
  }

  function validateForm() {
    const result = registerFormSchema.safeParse({
      fullName: form.fullName,
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    });

    if (result.success) {
      setErrors({});
      return result.data;
    }

    const fieldErrors: RegisterFormErrors = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field === "string" && !(field in fieldErrors)) {
        fieldErrors[field as keyof RegisterFormValues] = issue.message;
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

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: validatedData.fullName,
          email: validatedData.email,
          password: validatedData.password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setApiError(data?.error ?? "Unable to create your account");
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.error("REGISTER_PAGE_ERROR", error);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-white text-[#00033D]">
        <div className="grid min-h-screen place-items-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-[2rem] border border-[#977DFF]/12 bg-white p-7 text-center shadow-[0_32px_90px_rgba(6,0,171,0.10)] sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
              Start here
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#00033D]">
              Checking your session
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#00033D]/66">
              Making sure we send you to the right place.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#00033D]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(151,125,255,0.24),_transparent_36%),linear-gradient(160deg,_#F2E6EE_0%,_#FFFFFF_62%,_#FFE8F7_100%)] px-6 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-[#977DFF]/30 to-transparent lg:block" />
          <div className="flex h-full flex-col justify-between">
            <div className="max-w-xl space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium shadow-[0_18px_50px_rgba(6,0,171,0.08)] backdrop-blur-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0033FF]" />
                TaskTracker
              </div>

              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#0600AB]/70">
                  Personal task flow
                </p>
                <div className="space-y-4">
                  <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-[#00033D] sm:text-5xl lg:text-6xl">
                    Organize your work with a calm system that keeps you moving.
                  </h1>
                  <p className="max-w-md text-base leading-7 text-[#00033D]/72 sm:text-lg">
                    Organize your tasks, track progress, and stay focused.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] bg-white/80 p-5 shadow-[0_18px_40px_rgba(6,0,171,0.08)] backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                  Capture
                </p>
                <p className="mt-3 text-sm leading-6 text-[#00033D]/76">
                  Add tasks quickly and keep every priority in one place.
                </p>
              </div>
              <div className="rounded-[1.75rem] bg-[#FFCFF2]/55 p-5 shadow-[0_18px_40px_rgba(255,207,242,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                  Track
                </p>
                <p className="mt-3 text-sm leading-6 text-[#00033D]/76">
                  Watch work move from idea to done without losing momentum.
                </p>
              </div>
              <div className="rounded-[1.75rem] bg-[#977DFF]/12 p-5 shadow-[0_18px_40px_rgba(151,125,255,0.14)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                  Focus
                </p>
                <p className="mt-3 text-sm leading-6 text-[#00033D]/76">
                  Stay centered with a lightweight workflow built for clarity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-md rounded-[2rem] border border-[#977DFF]/12 bg-white p-7 shadow-[0_32px_90px_rgba(6,0,171,0.10)] sm:p-9">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                Start here
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#00033D]">
                Create your account
              </h2>
              <p className="text-sm leading-6 text-[#00033D]/66">
                Set up your workspace in a minute and keep your next tasks in
                view.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-[#00033D]"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) =>
                    handleChange("fullName", event.target.value)
                  }
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base text-[#00033D] outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
                  placeholder="Alex Johnson"
                />
                {errors.fullName ? (
                  <p id="fullName-error" className="text-sm text-[#C13274]">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

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
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) =>
                      handleChange("password", event.target.value)
                    }
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 pr-20 text-base text-[#00033D] outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
                    placeholder="At least 8 characters"
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

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#00033D]"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      handleChange("confirmPassword", event.target.value)
                    }
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={
                      errors.confirmPassword ? "confirmPassword-error" : undefined
                    }
                    className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 pr-20 text-base text-[#00033D] outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-medium text-[#0600AB] transition hover:bg-[#977DFF]/10"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-[#C13274]"
                  >
                    {errors.confirmPassword}
                  </p>
                ) : null}
              </div>

              {apiError ? (
                <div className="rounded-2xl border border-[#FFCFF2] bg-[#FFF4FB] px-4 py-3 text-sm text-[#9E1F61]">
                  {apiError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0600AB] px-4 py-3 text-base font-semibold text-white shadow-[0_18px_45px_rgba(6,0,171,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0033FF] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#A6A8D4] disabled:shadow-none"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#00033D]/66">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#0600AB] underline-offset-4 transition hover:text-[#0033FF] hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
