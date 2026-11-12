import { useSyncExternalStore } from "react";

import type { TaskStore } from "@/lib/task-store";
import type { Task } from "@/lib/tasks";

export function useTasks(store: TaskStore): readonly Task[] | null {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
