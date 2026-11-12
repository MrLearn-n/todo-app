import type { Task } from "@/lib/tasks";

import { type TaskActions, TaskItem } from "./TaskItem";

interface TaskListProps extends TaskActions {
  tasks: readonly Task[];
  emptyMessage: string;
}

export function TaskList({ tasks, emptyMessage, ...actions }: TaskListProps) {
  if (!tasks.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul aria-label="Задачи" className="divide-y rounded-lg border">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} {...actions} />
      ))}
    </ul>
  );
}
