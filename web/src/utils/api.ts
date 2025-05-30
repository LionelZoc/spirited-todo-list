"use client";

import {
  Task,
  TaskCreate,
  TaskListParams,
  TaskListResponse,
  TaskUpdate,
} from "@/types/task";
import { throwIfErrorResponse } from "@/utils/error";

const API_TASKS_BASE = "/api/tasks";

export async function getTasks(
  params: TaskListParams = {},
): Promise<TaskListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.append(key, String(value));
  });
  const url = search.toString()
    ? `${API_TASKS_BASE}?${search}`
    : API_TASKS_BASE;
  const res = await fetch(url);
  await throwIfErrorResponse(res, "Failed to fetch tasks");
  return res.json();
}

export async function getTask(id: number): Promise<Task> {
  const res = await fetch(`${API_TASKS_BASE}/${id}`);
  await throwIfErrorResponse(res, `Failed to fetch task ${id}`);
  return res.json();
}

export async function createTask(task: TaskCreate): Promise<Task> {
  const res = await fetch(API_TASKS_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  await throwIfErrorResponse(res, "Failed to create task2");
  return res.json();
}

export async function updateTask(
  id: number,
  updates: TaskUpdate,
): Promise<Task> {
  const res = await fetch(`${API_TASKS_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  await throwIfErrorResponse(res, `Failed to update task ${id}`);
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_TASKS_BASE}/${id}`, { method: "DELETE" });
  await throwIfErrorResponse(res, `Failed to delete task ${id}`);
}
