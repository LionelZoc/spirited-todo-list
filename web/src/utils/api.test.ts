import { ErrorCode } from "@/constants/error";
import {
  Priority,
  Task,
  TaskCreate,
  TaskListResponse,
  TaskUpdate,
} from "@/types/task";

import { createTask, deleteTask, getTask, getTasks, updateTask } from "./api";

global.fetch = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

const defaultFetchErrorResponse = {
  ok: false,
  status: 500,
  json: async () => ({ error: "Internal server error" }),
};

const defaultFetchErrorResponseWithErrorCodeAndMessage = (
  errorCode: string,
  errorMessage: string,
  status: number = 500,
) => ({
  ...defaultFetchErrorResponse,
  status,
  json: async () => ({
    error: { msg: errorMessage, error_code: errorCode },
  }),
});

const defaultFetchSuccessResponse = (data: unknown) => ({
  ok: true,
  json: async () => data,
});

describe("api utils", () => {
  const mockTask: Task = {
    id: 1,
    title: "Test",
    description: "desc",
    priority: Priority.MID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const mockResponse: TaskListResponse = {
    items: [mockTask],
    total: 1,
    page: 1,
    page_size: 20,
  };

  it("getTasks success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      defaultFetchSuccessResponse(mockResponse),
    );
    const result = await getTasks();
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalled();
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.page_size).toBe("number");
  });

  it("getTasks with network error", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    await expect(getTasks()).rejects.toThrow("Network error");
  });

  it("getTasks error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(defaultFetchErrorResponse);
    await expect(getTasks()).rejects.toThrow("Internal server error");
  });

  it("getTasks empty page edge case", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      defaultFetchSuccessResponse({
        items: [],
        total: 1,
        page: 2,
        page_size: 1,
      }),
    );
    const result = await getTasks({ limit: 1, offset: 1 });
    expect(result.items).toEqual([]);
    expect(result.page).toBe(2);
    expect(result.page_size).toBe(1);
    expect(result.total).toBe(1);
  });

  it("getTask success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      defaultFetchSuccessResponse(mockTask),
    );
    const task = await getTask(1);
    expect(task).toEqual(mockTask);
  });

  it("getTask error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      defaultFetchErrorResponseWithErrorCodeAndMessage(
        ErrorCode.TASK_NOT_FOUND,
        "Task not found",
        404,
      ),
    );
    await expect(getTask(1)).rejects.toThrow("Task not found");
  });

  it("createTask success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      defaultFetchSuccessResponse(mockTask),
    );
    const input: TaskCreate = { title: "Test", priority: Priority.MID };
    const task = await createTask(input);
    expect(task).toEqual(mockTask);
  });

  it("createTask error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      defaultFetchErrorResponseWithErrorCodeAndMessage(
        ErrorCode.INVALID_INPUT,
        "Invalid input",
        400,
      ),
    );
    await expect(
      createTask({ title: "Test", priority: Priority.MID }),
    ).rejects.toThrow("Invalid input");
  });

  it("updateTask success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTask,
    });
    const updates: TaskUpdate = { title: "Updated" };
    const task = await updateTask(1, updates);
    expect(task).toEqual(mockTask);
  });

  it("updateTask error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ...defaultFetchErrorResponse,
      status: 404,
      json: async () => ({
        error: {
          msg: "Task not found",
          error_code: ErrorCode.TASK_NOT_FOUND,
        },
      }),
    });
    await expect(updateTask(1, { title: "Updated" })).rejects.toThrow(
      "Task not found",
    );
  });

  it("deleteTask success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      defaultFetchSuccessResponse(null),
    );
    await expect(deleteTask(1)).resolves.toBeUndefined();
  });

  it("deleteTask error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ...defaultFetchErrorResponse,
      status: 404,
      json: async () => ({
        error: {
          msg: "Task not found",
          error_code: ErrorCode.TASK_NOT_FOUND,
        },
      }),
    });
    await expect(deleteTask(1)).rejects.toThrow("Task not found");
  });
  //check for the url called by the fetch depending on the params
  it("getTasks url", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
    await getTasks({ limit: 1, offset: 1 });
    expect(fetch).toHaveBeenCalledWith("/api/tasks?limit=1&offset=1");
  });
});
