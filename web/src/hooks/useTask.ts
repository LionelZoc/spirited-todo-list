import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { Task } from "@/types/task";
import { getTask } from "@/utils/api";

export function useTask(id: number, options?: UseQueryOptions<Task, Error>) {
  const { data, isLoading, isError, isSuccess, error } = useQuery<Task, Error>({
    queryKey: ["task", id],
    queryFn: () => getTask(id),
    enabled: !!id,
    ...options,
  });
  return { data, isLoading, isError, isSuccess, error };
}
