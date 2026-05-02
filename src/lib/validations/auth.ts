import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(150, "Full name is too long"),
  email: z
    .string()
    .trim()
    .max(255, "Email is too long")
    .email("Invalid email address")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255, "Email is too long")
    .email("Invalid email address")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
