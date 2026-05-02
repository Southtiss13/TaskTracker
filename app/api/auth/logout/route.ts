import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  REFRESH_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  hashRefreshToken,
} from "@/src/lib/auth-tokens";
import { prisma } from "@/src/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { tokenHash: hashRefreshToken(refreshToken) },
    });
  }

  const response = NextResponse.json({ message: "Logout successful" });

  clearAuthCookies(response);

  return response;
}
