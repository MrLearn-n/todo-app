import { describe, expect, it } from "vitest";

import { formatTaskCount, pluralize } from "@/lib/plural";

const forms = { one: "задача", few: "задачи", many: "задач" };

describe("pluralize", () => {
  it.each([
    [1, "задача"],
    [2, "задачи"],
    [5, "задач"],
    [11, "задач"],
    [21, "задача"],
    [0, "задач"],
  ])("%i → %s", (count, expected) => {
    expect(pluralize(count, forms)).toBe(expected);
  });
});

describe("formatTaskCount", () => {
  it("prefixes the count", () => {
    expect(formatTaskCount(3)).toBe("3 задачи");
  });
});
