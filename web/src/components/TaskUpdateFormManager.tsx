"use client";

import { useTask } from "@/hooks/useTask";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { TaskUpdateForm } from "@/uikit";

interface TaskUpdateFormManagerProps {
  taskId: number;
  onSuccess?: () => void;
}

export default function TaskUpdateFormManager({
  taskId,
  onSuccess,
}: TaskUpdateFormManagerProps) {
  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
    error: taskError,
  } = useTask(taskId);
  const { mutate, isPending, isError, error, isSuccess } = useUpdateTask({
    onSuccess,
  });

  if (isTaskLoading) return <div className="p-4">Loading...</div>;
  if (isTaskError)
    return <div className="text-red-500 p-4">Error: {taskError?.message}</div>;
  if (!task) return <div className="p-4">Task not found.</div>;

  return (
    <div>
      <TaskUpdateForm
        initial={{
          title: task.title,
          description: task.description || "",
          priority: task.priority,
        }}
        onSubmit={(updates) => mutate({ id: taskId, updates })}
        isSubmitting={isPending}
      />
      {isError && (
        <div className="text-red-500 p-2">Error: {error?.message}</div>
      )}
      {isSuccess && <div className="text-green-600 p-2">Task updated!</div>}
    </div>
  );
}
