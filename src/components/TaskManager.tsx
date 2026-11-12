"use client";

import { useState } from "react";

import { ListChecks } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTasks } from "@/hooks/useTasks";
import { type TaskStore, taskStore } from "@/lib/task-store";
import { filterTasks, isTaskFilter, TASK_FILTERS, type TaskFilter } from "@/lib/tasks";

import { AddTaskForm } from "./AddTaskForm";
import { TaskList } from "./TaskList";
import { TaskSummary } from "./TaskSummary";

interface FilterText {
  label: string;
  empty: string;
}

const FILTER_TEXT: Record<TaskFilter, FilterText> = {
  all: { label: "Все", empty: "Пока нет задач. Добавьте первую!" },
  active: { label: "Активные", empty: "Все задачи выполнены 🎉" },
  completed: { label: "Выполненные", empty: "Выполненных задач пока нет." },
};

interface TaskManagerProps {
  store?: TaskStore;
}

export function TaskManager({ store = taskStore }: TaskManagerProps) {
  const tasks = useTasks(store);
  const [filter, setFilter] = useState<TaskFilter>("all");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <ListChecks className="size-6" aria-hidden />
          Список задач
        </CardTitle>
        <CardDescription>Задачи сохраняются в вашем браузере.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <AddTaskForm onAdd={store.add} />

        {!tasks ? (
          <TaskListSkeleton />
        ) : (
          <Tabs value={filter} onValueChange={(value) => isTaskFilter(value) && setFilter(value)}>
            <TabsList className="w-full group-data-horizontal/tabs:pointer-coarse:h-10">
              {TASK_FILTERS.map((option) => (
                <TabsTrigger key={option} value={option}>
                  {FILTER_TEXT[option].label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TASK_FILTERS.map((option) => (
              <TabsContent key={option} value={option}>
                <TaskList
                  tasks={filterTasks(tasks, option)}
                  emptyMessage={FILTER_TEXT[option].empty}
                  onToggle={store.toggle}
                  onRename={store.rename}
                  onRemove={store.remove}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>

      {!!tasks?.length && (
        <CardFooter>
          <TaskSummary tasks={tasks} onClearCompleted={store.clearCompleted} />
        </CardFooter>
      )}
    </Card>
  );
}

function TaskListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Загрузка задач" className="flex flex-col gap-3">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
