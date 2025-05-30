"use client";
import { useTask } from "@/hooks/useTask";
import { TaskView } from "@/uikit";

interface TaskViewManagerProps {
  taskId: number;
}

export default function TaskViewManager({ taskId }: TaskViewManagerProps) {
  const { data: task, isLoading, isError, error } = useTask(taskId);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError)
    return <div className="text-red-500 p-4">Error: {error?.message}</div>;
  if (!task) return <div className="p-4">Task not found.</div>;

  return <TaskView task={task} />;
}
