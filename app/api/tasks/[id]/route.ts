import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { updateTaskSchema } from "@/src/lib/validations/task";

type RouteContext = { params: Promise<{ id: string }> };

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = await context.params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { title, description, status, priority, dueDate } = result.data;

    const completedAt =
      status === undefined
        ? undefined
        : status === "done" && existingTask.status !== "done"
          ? new Date()
        : existingTask.status === "done"
          ? null
          : existingTask.completedAt;

    const task = await prisma.task.update({
      where: { id: existingTask.id },
      data: {
        title,
        description,
        status,
        priority,
        completedAt,
        dueDate:
          dueDate === undefined
            ? undefined
            : dueDate === null
              ? null
              : parseDateOnly(dueDate),
      },
    });

    return NextResponse.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    console.error("UPDATE_TASK_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        createdById: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: existingTask.id },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE_TASK_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
