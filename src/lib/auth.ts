import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  SESSION_INACTIVITY_TIMEOUT_MS,
  clearAuthCookies,
  createAccessToken,
  getAccessTokenCookieOptions,
  hashRefreshToken,
  verifyAccessToken,
} from "@/src/lib/auth-tokens";
import { prisma } from "@/src/lib/prisma";

type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  emailVerified: Date | null;
};

export type CurrentUserResult = {
  user: SafeUser | null;
  refreshedAccessToken: string | null;
  shouldClearAuthCookies: boolean;
};

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  createdAt: true,
  emailVerified: true,
} as const;

function unauthenticated(shouldClearAuthCookies = false): CurrentUserResult {
  return {
    user: null,
    refreshedAccessToken: null,
    shouldClearAuthCookies,
  };
}

export async function getCurrentUser(): Promise<CurrentUserResult> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return unauthenticated(true);
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: userSelect } },
  });

  if (!storedToken) {
    return unauthenticated(true);
  }

  const now = new Date();

  if (storedToken.expiresAt <= now) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return unauthenticated(true);
  }

  if (
    storedToken.lastActiveAt.getTime() <
    now.getTime() - SESSION_INACTIVITY_TIMEOUT_MS
  ) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return unauthenticated(true);
  }

  if (!storedToken.user.emailVerified) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return unauthenticated(true);
  }

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);

    if (payload) {
      if (payload.sub !== storedToken.userId) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });

        return unauthenticated(true);
      }

      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { lastActiveAt: now },
      });

      return {
        user: storedToken.user,
        refreshedAccessToken: null,
        shouldClearAuthCookies: false,
      };
    }
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { lastActiveAt: now },
  });

  return {
    user: storedToken.user,
    refreshedAccessToken: createAccessToken(storedToken.user),
    shouldClearAuthCookies: false,
  };
}

export function applyAuthCookies(
  response: NextResponse,
  auth: CurrentUserResult,
) {
  if (auth.shouldClearAuthCookies) {
    clearAuthCookies(response);
    return;
  }

  if (auth.refreshedAccessToken) {
    response.cookies.set(
      ACCESS_TOKEN_COOKIE_NAME,
      auth.refreshedAccessToken,
      getAccessTokenCookieOptions(),
    );
  }
}
