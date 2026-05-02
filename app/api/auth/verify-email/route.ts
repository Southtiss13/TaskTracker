import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";

const verifyEmailSchema = z.object({
  token: z.string().trim().min(1),
});

const unavailableVerificationLinkError =
  "This verification link is invalid, expired, or already used.";

export async function POST(request: Request) {
  try {

    const body = await request.json();
    const result = verifyEmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: unavailableVerificationLinkError },
        { status: 400 },
      );
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: result.data.token },
      include: { user: true },
    });



    if (!verificationToken) {
      return NextResponse.json(
        { error: unavailableVerificationLinkError },
        { status: 404 },
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: unavailableVerificationLinkError },
        { status: 410 },
      );
    }


    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: verificationToken.user.id },
        data: { emailVerified: new Date() },
      });

      await transaction.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
    });


    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: unavailableVerificationLinkError },
        { status: 400 },
      );
    }

    console.error("VERIFY_EMAIL_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
