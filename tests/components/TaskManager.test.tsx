import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TaskManager } from "@/components/TaskManager";
import { createTaskStore } from "@/lib/task-store";

function renderApp() {
  const store = createTaskStore();
  const user = userEvent.setup();
  const utils = render(<TaskManager store={store} />);
  const input = screen.getByLabelText("Новая задача");

  async function addTask(title: string) {
    await user.type(input, `${title}{Enter}`);
  }

  return { ...utils, user, input, addTask };
}

function visibleTitles() {
  const list = screen.queryByRole("list", { name: "Задачи" });

  if (!list) return [];

  return within(list)
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

describe("TaskManager", () => {
  it("adds a task and clears the input", async () => {
    const { input, addTask } = renderApp();

    await addTask("Купить молоко");

    expect(visibleTitles()).toEqual(["Купить молоко"]);
    expect(input).toHaveValue("");
  });

  it("ignores blank input", async () => {
    const { addTask } = renderApp();

    await addTask("   ");
    expect(screen.getByText("Пока нет задач. Добавьте первую!")).toBeInTheDocument();
  });

  it("marks a task as completed", async () => {
    const { user, addTask } = renderApp();

    await addTask("Позвонить маме");

    const checkbox = screen.getByRole("checkbox", { name: "Позвонить маме" });

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText(/Осталось: 0/)).toBeInTheDocument();
  });

  it("deletes a task", async () => {
    const { user, addTask } = renderApp();

    await addTask("Лишняя задача");

    await user.click(screen.getByRole("button", { name: "Удалить «Лишняя задача»" }));

    expect(visibleTitles()).toEqual([]);
  });

  it("edits a task", async () => {
    const { user, addTask } = renderApp();

    await addTask("Черновик");

    await user.click(screen.getByRole("button", { name: "Редактировать «Черновик»" }));
    const editor = screen.getByLabelText("Редактировать задачу");

    await user.clear(editor);
    await user.type(editor, "Чистовик{Enter}");

    expect(visibleTitles()).toEqual(["Чистовик"]);
  });

  it("cancels editing on Escape", async () => {
    const { user, addTask } = renderApp();

    await addTask("Оригинал");

    await user.click(screen.getByRole("button", { name: "Редактировать «Оригинал»" }));
    await user.type(screen.getByLabelText("Редактировать задачу"), " изменён{Escape}");

    expect(visibleTitles()).toEqual(["Оригинал"]);
  });

  it("filters and clears completed tasks", async () => {
    const { user, addTask } = renderApp();

    await addTask("Первая");
    await addTask("Вторая");
    await user.click(screen.getByRole("checkbox", { name: "Первая" }));

    await user.click(screen.getByRole("tab", { name: "Активные" }));
    expect(visibleTitles()).toEqual(["Вторая"]);

    await user.click(screen.getByRole("tab", { name: "Выполненные" }));
    expect(visibleTitles()).toEqual(["Первая"]);

    await user.click(screen.getByRole("button", { name: "Очистить выполненные" }));
    await user.click(screen.getByRole("tab", { name: "Все" }));
    expect(visibleTitles()).toEqual(["Вторая"]);
  });

  it("restores tasks after a reload", async () => {
    const { addTask, unmount } = renderApp();

    await addTask("Переживёт перезагрузку");
    unmount();

    renderApp();

    expect(visibleTitles()).toEqual(["Переживёт перезагрузку"]);
  });
});
