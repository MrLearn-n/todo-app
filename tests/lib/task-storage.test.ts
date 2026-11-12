import { describe, expect, it } from "vitest";

import { parseTasks } from "@/lib/task-storage";
import { createTask } from "@/lib/tasks";

describe("task storage", () => {
  it("round-trips tasks", () => {
    const tasks = [createTask("Задача", "1", 1)];

    expect(parseTasks(JSON.stringify(tasks))).toEqual(tasks);
  });

  it.each([
    ["missing value", null],
    ["broken JSON", "{oops"],
    ["not an array", '{"id":"1"}'],
  ])("returns an empty list for %s", (_, raw) => {
    expect(parseTasks(raw)).toEqual([]);
  });

  it("drops malformed entries", () => {
    const raw = JSON.stringify([
      { id: "1", title: "ok", completed: false, createdAt: 1 },
      { id: 2, title: "bad id" },
      null,
    ]);

    expect(parseTasks(raw).map((t) => t.id)).toEqual(["1"]);
  });
});
