import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  createAccessToken,
  createRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from "@/src/lib/auth-tokens";
import { prisma } from "@/src/lib/prisma";
import { verifyPassword } from "@/src/lib/password";
import { loginSchema } from "@/src/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken();
    const now = new Date();

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(refreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
        lastActiveAt: now,
      },
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });

    clearAuthCookies(response);
    response.cookies.set(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      getAccessTokenCookieOptions()
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      getRefreshTokenCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
