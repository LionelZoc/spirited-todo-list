import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { TaskListParams, TaskListResponse } from "@/types/task";
import { getTasks } from "@/utils/api";

export function useTasks(
  params: TaskListParams = {},
  options?: UseQueryOptions<TaskListResponse, Error>,
) {
  const { data, isLoading, isError, isSuccess, error } = useQuery<
    TaskListResponse,
    Error
  >({
    queryKey: ["tasks", params],
    queryFn: () => getTasks(params),
    ...options,
  });
  return { data, isLoading, isError, isSuccess, error };
}
