import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { applyAuthCookies, getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { createTaskSchema } from "@/src/lib/validations/task";

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const taskFiltersSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export async function GET(request: NextRequest) {
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

    const filtersResult = taskFiltersSchema.safeParse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      priority: request.nextUrl.searchParams.get("priority") ?? undefined,
    });

    if (!filtersResult.success) {
      const response = NextResponse.json(
        { error: "Invalid input", details: filtersResult.error.flatten() },
        { status: 400 }
      );
      applyAuthCookies(response, auth);
      return response;
    }

    const { status, priority } = filtersResult.data;

    const tasks = await prisma.task.findMany({
      where: {
        createdById: auth.user.id,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = NextResponse.json({ tasks });
    applyAuthCookies(response, auth);
    return response;
  } catch (error) {
    console.error("GET_TASKS_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      const response = NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
      applyAuthCookies(response, auth);
      return response;
    }

    const { title, description, priority, dueDate } = result.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? parseDateOnly(dueDate) : undefined,
        createdById: auth.user.id,
      },
    });

    const response = NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    );
    applyAuthCookies(response, auth);
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    console.error("CREATE_TASK_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
