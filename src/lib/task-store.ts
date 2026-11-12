import { parseTasks, STORAGE_KEY } from "./task-storage";
import {
  addTask,
  clearCompleted,
  createTask,
  normalizeTitle,
  removeTask,
  renameTask,
  type Task,
  toggleTask,
} from "./tasks";

type Listener = () => void;
type TasksUpdate = (tasks: readonly Task[]) => readonly Task[];

export interface TaskStore {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => readonly Task[];
  getServerSnapshot: () => null;
  add: (rawTitle: string) => void;
  rename: (id: string, rawTitle: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
}

export function createTaskStore(getStorage = () => window.localStorage): TaskStore {
  const listeners = new Set<Listener>();
  let tasks: readonly Task[] | null = null;

  function getTasks() {
    if (!tasks) {
      tasks = parseTasks(getStorage().getItem(STORAGE_KEY));
    }

    return tasks;
  }

  function saveTasks(next: readonly Task[]) {
    try {
      getStorage().setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Не удалось сохранить задачи", error);
    }
  }

  function emitChange() {
    listeners.forEach((listener) => listener());
  }

  function updateTasks(update: TasksUpdate) {
    tasks = update(getTasks());
    saveTasks(tasks);
    emitChange();
  }

  function onStorageChange(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;

    tasks = parseTasks(event.newValue);
    emitChange();
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    window.addEventListener("storage", onStorageChange);

    return () => {
      listeners.delete(listener);

      if (!listeners.size) {
        window.removeEventListener("storage", onStorageChange);
      }
    };
  }

  function add(rawTitle: string) {
    const title = normalizeTitle(rawTitle);

    if (title) {
      updateTasks((current) => addTask(current, createTask(title)));
    }
  }

  function rename(id: string, rawTitle: string) {
    const title = normalizeTitle(rawTitle);

    if (title) {
      updateTasks((current) => renameTask(current, id, title));
    }
  }

  return {
    subscribe,
    getSnapshot: getTasks,
    getServerSnapshot: () => null,
    add,
    rename,
    toggle: (id) => updateTasks((current) => toggleTask(current, id)),
    remove: (id) => updateTasks((current) => removeTask(current, id)),
    clearCompleted: () => updateTasks(clearCompleted),
  };
}

export const taskStore = createTaskStore();
