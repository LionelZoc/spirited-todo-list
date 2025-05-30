"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTasks } from "@/hooks/useTasks";
import { Task, TaskSortBy } from "@/types/task";
import { TaskList } from "@/uikit";

const DEFAULT_PAGE_SIZE = 10;

export default function TaskListManager() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isError, error } = useTasks({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    sort_by: sortBy as TaskSortBy,
    sort_order: sortOrder,
  });

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSortChange = (column: string, order: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(order);
    setPage(1);
  };

  const handleViewTask = (task: Task) => {
    router.push(`/todos/${task.id}`);
  };
  const handleEditTask = (task: Task) => {
    router.push(`/todos/${task.id}/edit`);
  };
  const handleDeleteTask = (task: Task) => {
    // Replace with delete logic or confirmation
    console.error("Delete task:", task);
  };

  if (isError) {
    return <div className="text-red-500 p-4">Error: {error?.message}</div>;
  }

  return (
    <TaskList
      tasks={data?.items || []}
      total={data?.total || 0}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onSortChange={handleSortChange}
      loading={isLoading}
      onViewTask={handleViewTask}
      onDeleteTask={handleDeleteTask}
      onEditTask={handleEditTask}
    />
  );
}
