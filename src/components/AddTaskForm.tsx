import { type SubmitEvent, useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TASK_TITLE_MAX_LENGTH } from "@/lib/tasks";

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState("");

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    onAdd(title);
    setTitle("");
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Что нужно сделать?"
        aria-label="Новая задача"
        maxLength={TASK_TITLE_MAX_LENGTH}
        autoComplete="off"
        className="h-10"
      />
      <Button
        type="submit"
        size="lg"
        disabled={!title.trim()}
        className="h-10 w-10 px-0 sm:w-auto sm:px-4"
      >
        <Plus />
        <span className="max-sm:sr-only">Добавить</span>
      </Button>
    </form>
  );
}
