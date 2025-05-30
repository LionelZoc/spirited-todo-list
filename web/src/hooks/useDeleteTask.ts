import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { deleteTask } from "@/utils/api";

export function useDeleteTask(
  options?: UseMutationOptions<void, Error, number>,
) {
  return useMutation<void, Error, number>({
    mutationFn: deleteTask,
    ...options,
  });
}
