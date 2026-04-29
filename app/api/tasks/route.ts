import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

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
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filtersResult = taskFiltersSchema.safeParse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      priority: request.nextUrl.searchParams.get("priority") ?? undefined,
    });

    if (!filtersResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: filtersResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status, priority } = filtersResult.data;

    const tasks = await prisma.task.findMany({
      where: {
        createdById: userId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tasks });
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
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, priority, dueDate } = result.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? parseDateOnly(dueDate) : undefined,
        createdById: userId,
      },
    });

    return NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    );
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
