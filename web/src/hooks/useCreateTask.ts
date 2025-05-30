import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { Task, TaskCreate } from "@/types/task";
import { createTask } from "@/utils/api";

export function useCreateTask(
  options?: UseMutationOptions<Task, Error, TaskCreate>,
) {
  return useMutation<Task, Error, TaskCreate>({
    mutationFn: createTask,
    ...options,
  });
}
