import { NextResponse } from "next/server";
import { z } from "zod";

import { sendVerificationEmail } from "@/src/lib/email";
import { prisma } from "@/src/lib/prisma";
import {
  createVerificationToken,
  getVerificationTokenExpiry,
} from "@/src/lib/tokens";

const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255, "Email is too long")
    .email("Invalid email address")
    .transform((value) => value.toLowerCase()),
});

const genericMessage = {
  message:
    "If this email exists and is not verified, a verification email has been sent.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = resendVerificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(genericMessage);
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: "This email is already verified. You can log in.",
      });
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    const token = createVerificationToken();

    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: getVerificationTokenExpiry(),
      },
    });

    await sendVerificationEmail({
      to: user.email,
      token,
    });

    return NextResponse.json(genericMessage);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    console.error("RESEND_VERIFICATION_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
