import { hashPassword } from "@/src/lib/password";
import { prisma } from "@/src/lib/prisma";
import { registerSchema } from "@/src/lib/validations/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = registerSchema.safeParse(body);

    if (!parsedBody.success) {
      return Response.json(
        {
          error: "Invalid input",
          details: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsedBody.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    console.error("Register error:", error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}