import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { Task, TaskUpdate } from "@/types/task";
import { updateTask } from "@/utils/api";

export function useUpdateTask(
  options?: UseMutationOptions<
    Task,
    Error,
    { id: number; updates: TaskUpdate }
  >,
) {
  return useMutation<Task, Error, { id: number; updates: TaskUpdate }>({
    mutationFn: ({ id, updates }) => updateTask(id, updates),
    ...options,
  });
}
