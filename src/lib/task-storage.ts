import type { Task } from "./tasks";

export const STORAGE_KEY = "tasks:v1";

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean" &&
    typeof candidate.createdAt === "number"
  );
}

export function parseTasks(raw: string | null): Task[] {
  if (!raw) return [];

  try {
    const data: unknown = JSON.parse(raw);

    return Array.isArray(data) ? data.filter(isTask) : [];
  } catch {
    return [];
  }
}
