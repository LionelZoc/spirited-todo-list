export enum Priority {
  LOW = 1,
  MID = 2,
  HIGH = 3,
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: Priority; // 1=LOW, 2=MID, 3=HIGH
  created_at: string; // ISO string
  updated_at: string; // ISO string
  deadline?: string; // ISO string or undefined
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: Priority;
  deadline?: string;
}

export type TaskSortBy =
  | "priority"
  | "created_at"
  | "updated_at"
  | "title"
  | "id";
export interface TaskListParams {
  limit?: number;
  offset?: number;
  sort_by?: TaskSortBy;
  sort_order?: "asc" | "desc";
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
}
