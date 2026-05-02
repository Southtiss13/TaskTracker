import { NextResponse } from "next/server";

import { applyAuthCookies, getCurrentUser } from "@/src/lib/auth";

export async function GET() {
  try {
    const auth = await getCurrentUser();

    if (!auth.user) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      applyAuthCookies(response, auth);
      return response;
    }

    const response = NextResponse.json({ user: auth.user });
    applyAuthCookies(response, auth);
    return response;
  } catch (error) {
    console.error("ME_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
