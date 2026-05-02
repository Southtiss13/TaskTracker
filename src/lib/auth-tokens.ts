import { randomBytes, createHash } from "crypto";
import jwt from "jsonwebtoken";
import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_INACTIVITY_TIMEOUT_MS = 1000 * 60 * 30;

type AuthTokenUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthUserPayload = {
  sub: string;
  email: string;
  fullName: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required for authentication.");
  }

  return secret;
}

export function createAccessToken(user: AuthTokenUser) {
  const payload: AuthUserPayload = {
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
}

export function verifyAccessToken(token: string) {
  const secret = getJwtSecret();

  try {
    const payload = jwt.verify(token, secret);

    if (typeof payload === "string") {
      return null;
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.fullName !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
    } satisfies AuthUserPayload;
  } catch {
    return null;
  }
}

export function createRefreshToken() {
  return randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);
}

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function getAccessTokenCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  };
}

export function getRefreshTokenCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  };
}

export function clearAuthCookies(response: NextResponse) {
  const expiredCookieOptions = {
    ...getBaseCookieOptions(),
    maxAge: 0,
  };

  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", expiredCookieOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", expiredCookieOptions);
  response.cookies.set("userId", "", expiredCookieOptions);
}
