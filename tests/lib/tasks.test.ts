import { describe, expect, it } from "vitest";

import {
  addTask,
  clearCompleted,
  createTask,
  filterTasks,
  getActiveCount,
  isTaskFilter,
  normalizeTitle,
  removeTask,
  renameTask,
  TASK_TITLE_MAX_LENGTH,
  toggleTask,
} from "@/lib/tasks";

const milk = createTask("Купить молоко", "1", 1);
const done = { ...createTask("Позвонить маме", "2", 2), completed: true };

describe("normalizeTitle", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeTitle("  купить   хлеб  ")).toBe("купить хлеб");
  });

  it("rejects blank input", () => {
    expect(normalizeTitle("   ")).toBeNull();
  });

  it("caps the length", () => {
    expect(normalizeTitle("a".repeat(500))).toHaveLength(TASK_TITLE_MAX_LENGTH);
  });
});

describe("list operations", () => {
  it("adds new tasks to the top", () => {
    expect(addTask([milk], done).map((t) => t.id)).toEqual(["2", "1"]);
  });

  it("toggles only the matching task", () => {
    const result = toggleTask([milk, done], "1");

    expect(result[0].completed).toBe(true);
    expect(result[1]).toBe(done);
  });

  it("renames a task", () => {
    expect(renameTask([milk], "1", "Купить кефир")[0].title).toBe("Купить кефир");
  });

  it("removes a task", () => {
    expect(removeTask([milk, done], "1")).toEqual([done]);
  });

  it("clears completed tasks", () => {
    expect(clearCompleted([milk, done])).toEqual([milk]);
  });

  it("does not mutate the input", () => {
    const tasks = [milk, done];

    toggleTask(tasks, "1");
    removeTask(tasks, "1");
    expect(tasks).toEqual([milk, done]);
  });
});

describe("filters", () => {
  const tasks = [milk, done];

  it.each([
    ["all", ["1", "2"]],
    ["active", ["1"]],
    ["completed", ["2"]],
  ] as const)("filter %s", (filter, ids) => {
    expect(filterTasks(tasks, filter).map((t) => t.id)).toEqual(ids);
  });

  it("counts active tasks", () => {
    expect(getActiveCount(tasks)).toBe(1);
  });

  it("recognizes valid filter values", () => {
    expect(isTaskFilter("active")).toBe(true);
    expect(isTaskFilter("unknown")).toBe(false);
  });
});
