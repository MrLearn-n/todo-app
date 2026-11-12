import { describe, expect, it, vi } from "vitest";

import { STORAGE_KEY } from "@/lib/task-storage";
import { createTaskStore, type TaskStore } from "@/lib/task-store";

function findId(store: TaskStore, title: string) {
  return store.getSnapshot().find((task) => task.title === title)?.id ?? "";
}

function readPersisted() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}

describe("createTaskStore", () => {
  it("loads existing tasks from storage", () => {
    const saved = [{ id: "a", title: "Сохранённая", completed: true, createdAt: 0 }];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    expect(createTaskStore().getSnapshot()).toEqual(saved);
  });

  it("persists every change", () => {
    const store = createTaskStore();

    store.add("Первая");
    store.add("Вторая");
    store.toggle(findId(store, "Первая"));
    store.remove(findId(store, "Вторая"));

    expect(readPersisted()).toMatchObject([{ title: "Первая", completed: true }]);
  });

  it("rejects blank titles without touching state", () => {
    const store = createTaskStore();

    store.add("   ");

    expect(store.getSnapshot()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("keeps the snapshot reference stable between changes", () => {
    const store = createTaskStore();

    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("notifies subscribers and stops after unsubscribe", () => {
    const store = createTaskStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.add("Задача");
    unsubscribe();
    store.add("Ещё одна");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("syncs changes made in another tab", () => {
    const store = createTaskStore();
    const listener = vi.fn();
    const newValue = JSON.stringify([
      { id: "x", title: "Из другой вкладки", completed: false, createdAt: 0 },
    ]);

    store.subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue }));

    expect(listener).toHaveBeenCalledOnce();
    expect(store.getSnapshot().map((task) => task.title)).toEqual(["Из другой вкладки"]);
  });

  it("keeps working in memory when storage rejects writes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const brokenStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    } as unknown as Storage;
    const store = createTaskStore(() => brokenStorage);

    store.add("Задача");

    expect(store.getSnapshot()).toHaveLength(1);
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });
});
