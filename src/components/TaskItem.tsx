import { type KeyboardEvent, useState } from "react";

import { cn } from "cn";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { type Task, TASK_TITLE_MAX_LENGTH } from "@/lib/tasks";

export interface TaskActions {
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

interface TaskItemProps extends TaskActions {
  task: Task;
}

export function TaskItem({ task, onToggle, onRename, onRemove }: TaskItemProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  function onStartEdit() {
    setDraft(task.title);
  }

  function onCancelEdit() {
    setDraft(null);
  }

  function onFinishEdit() {
    const isTitleChanged = isEditing && draft.trim() !== task.title;

    if (isTitleChanged) {
      onRename(task.id, draft);
    }

    onCancelEdit();
  }

  function onEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") onFinishEdit();
    if (event.key === "Escape") onCancelEdit();
  }

  return (
    <li className="group flex min-h-12 items-center gap-3 px-3 py-2">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={task.title}
      />

      {isEditing ? (
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onEditKeyDown}
          onBlur={onFinishEdit}
          maxLength={TASK_TITLE_MAX_LENGTH}
          aria-label="Редактировать задачу"
          autoFocus
          className="h-8"
        />
      ) : (
        <>
          <span
            onDoubleClick={onStartEdit}
            className={cn(
              "min-w-0 flex-1 text-sm wrap-break-word transition-colors",
              task.completed && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </span>
          <div className="flex shrink-0 gap-0.5 transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onStartEdit}
              aria-label={`Редактировать «${task.title}»`}
              className="pointer-coarse:size-10"
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(task.id)}
              aria-label={`Удалить «${task.title}»`}
              className="hover:text-destructive pointer-coarse:size-10"
            >
              <Trash2 />
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
