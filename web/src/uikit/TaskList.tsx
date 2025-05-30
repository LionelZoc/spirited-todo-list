"use client";
import {
  ColumnDef,
  PaginationState,
  SortingState,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Priority, Task } from "@/types/task";

import Button from "./Button";
import Table from "./Table";
import TableSkeleton from "./TableSkeleton";

interface TaskListProps {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  loading?: boolean;
  onViewTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
}

const priorityLabels = {
  [Priority.LOW]: "Low",
  [Priority.MID]: "Medium",
  [Priority.HIGH]: "High",
};
const columnHelper = createColumnHelper<Task>();

export default function TaskList({
  tasks,
  total,
  page,
  pageSize,
  onPageChange,
  onSortChange,
  loading = false,
  onViewTask,
  onEditTask,
}: TaskListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");

  // Frontend search filter
  const filteredTasks = useMemo(() => {
    if (!search) return tasks;
    const lower = search.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        (t.description?.toLowerCase().includes(lower) ?? false),
    );
  }, [tasks, search]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<Task, any>[]>(
    () => [
      columnHelper.accessor("title", {
        header: () => <span>Title</span>,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        enableSorting: true,
      }),
      columnHelper.accessor("priority", {
        header: () => <span>Priority</span>,
        cell: (info) => (
          <span>{priorityLabels[info.getValue() as Priority]}</span>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("deadline", {
        header: () => <span>Deadline</span>,
        cell: (info) =>
          info.getValue() ? (
            <span>{new Date(info.getValue() as string).toLocaleString()}</span>
          ) : (
            <span className="text-gray-400">—</span>
          ),
        enableSorting: true,
      }),
      columnHelper.accessor("created_at", {
        header: () => <span>Created</span>,
        cell: (info) => (
          <span>{new Date(info.getValue() as string).toLocaleString()}</span>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("updated_at", {
        header: () => <span>Updated</span>,
        cell: (info) => (
          <span>{new Date(info.getValue() as string).toLocaleString()}</span>
        ),
        enableSorting: true,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span>Actions</span>,
        cell: (info) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewTask?.(info.row.original);
              }}
            >
              View
            </Button>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEditTask?.(info.row.original);
              }}
            >
              Edit
            </Button>
          </div>
        ),
      }),
    ],
    [onViewTask, onEditTask],
  );

  // react-table expects 0-based pageIndex
  const pageCount = Math.ceil(total / pageSize);

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    let nextPageIndex: number;
    if (typeof updater === "function") {
      nextPageIndex = updater({ pageIndex: page - 1, pageSize }).pageIndex;
    } else {
      nextPageIndex = updater.pageIndex;
    }
    onPageChange(nextPageIndex + 1); // convert back to 1-based
  };

  const handleSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => {
    let nextSorting: SortingState;
    if (typeof updater === "function") {
      nextSorting = updater(sorting);
    } else {
      nextSorting = updater;
    }
    setSorting(nextSorting);
    if (nextSorting.length > 0) {
      onSortChange(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
    } else {
      onSortChange("id", "asc"); // default sort
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {loading ? (
        <TableSkeleton columns={5} rows={pageSize} />
      ) : (
        <Table<Task>
          columns={columns}
          data={filteredTasks}
          pageCount={pageCount}
          pageIndex={page - 1}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          onRowClick={onViewTask}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
        />
      )}
    </div>
  );
}
