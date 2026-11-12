import { Button } from "@/components/ui/button";

import { formatTaskCount } from "@/lib/plural";
import { getActiveCount, type Task } from "@/lib/tasks";

interface TaskSummaryProps {
  tasks: readonly Task[];
  onClearCompleted: () => void;
}

export function TaskSummary({ tasks, onClearCompleted }: TaskSummaryProps) {
  const activeCount = getActiveCount(tasks);
  const hasCompleted = activeCount < tasks.length;

  return (
    <div className="flex w-full items-center justify-between gap-3 text-sm whitespace-nowrap text-muted-foreground">
      <span aria-live="polite">Осталось: {formatTaskCount(activeCount)}</span>
      {hasCompleted && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCompleted}
          aria-label="Очистить выполненные"
        >
          Очистить
          <span className="max-sm:hidden">выполненные</span>
        </Button>
      )}
    </div>
  );
}
