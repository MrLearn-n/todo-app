export const TASK_TITLE_MAX_LENGTH = 200;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export const TASK_FILTERS = ["all", "active", "completed"] as const;

export type TaskFilter = (typeof TASK_FILTERS)[number];

const FILTER_PREDICATES: Record<TaskFilter, (task: Task) => boolean> = {
  all: () => true,
  active: (task) => !task.completed,
  completed: (task) => task.completed,
};

export function isTaskFilter(value: unknown): value is TaskFilter {
  return TASK_FILTERS.includes(value as TaskFilter);
}

export function normalizeTitle(raw: string): string | null {
  const title = raw.trim().replace(/\s+/g, " ");

  return title ? title.slice(0, TASK_TITLE_MAX_LENGTH) : null;
}

export function createTask(title: string, id = crypto.randomUUID(), createdAt = Date.now()): Task {
  return { id, title, completed: false, createdAt };
}

export function addTask(tasks: readonly Task[], task: Task): Task[] {
  return [task, ...tasks];
}

export function toggleTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

export function renameTask(tasks: readonly Task[], id: string, title: string): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, title } : task));
}

export function removeTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function filterTasks(tasks: readonly Task[], filter: TaskFilter): Task[] {
  return tasks.filter(FILTER_PREDICATES[filter]);
}

export function clearCompleted(tasks: readonly Task[]): Task[] {
  return filterTasks(tasks, "active");
}

export function getActiveCount(tasks: readonly Task[]): number {
  return filterTasks(tasks, "active").length;
}
