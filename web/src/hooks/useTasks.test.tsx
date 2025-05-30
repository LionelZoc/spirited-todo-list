import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/testUtils";
import { Priority, TaskListResponse } from "@/types/task";
import * as api from "@/utils/api";

import { useTasks } from "./useTasks";

jest.mock("@/utils/api");
global.fetch = jest.fn();

const mockTask = {
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

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("returns data on success", async () => {
    (api.getTasks as jest.Mock).mockResolvedValueOnce(mockResponse);
    const { result } = renderHook(() => useTasks(), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.items.length).toBe(1);
    expect(result.current.data?.total).toBe(1);
  });

  it("handles loading state", () => {
    (api.getTasks as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useTasks(), {
      wrapper: createQueryClientWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it("handles error state", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
    const { result } = renderHook(() => useTasks(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(
      () => result.current.isError && result.current.error !== null,
    );

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });

  it("handles empty page edge case", async () => {
    (api.getTasks as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 10,
      page: 2,
      page_size: 5,
    });
    const { result } = renderHook(() => useTasks({ limit: 5, offset: 5 }), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(
      () => result.current.isSuccess && result.current.data !== undefined,
    );
    expect(result.current.data?.items).toEqual([]);
    expect(result.current.data?.page).toBe(2);
    expect(result.current.data?.page_size).toBe(5);
    expect(result.current.data?.total).toBe(10);
  });

  it("refetches on param change (pagination)", async () => {
    (api.getTasks as jest.Mock)
      .mockResolvedValueOnce({ ...mockResponse, page: 1 })
      .mockResolvedValueOnce({ ...mockResponse, page: 2 });
    const { result, rerender } = renderHook(({ params }) => useTasks(params), {
      initialProps: { params: { limit: 1, offset: 0 } },
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(
      () => result.current.isSuccess && result.current.data?.page === 1,
    );
    expect(result.current.data?.page).toBe(1);
    rerender({ params: { limit: 1, offset: 1 } });
    await waitFor(
      () => result.current.isSuccess && result.current.data?.page === 2,
    );
    expect(result.current.data?.page).toBe(2);
  });

  it("handles network error", async () => {
    (fetch as jest.Mock).mockImplementation(() => {
      throw new Error("Network error");
    });

    const { result } = renderHook(() => useTasks(), {
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(
      () => result.current.isError && result.current.error !== null,
    );

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("caches data for same params", async () => {
    (api.getTasks as jest.Mock).mockResolvedValue(mockResponse);
    const { result, rerender } = renderHook(({ params }) => useTasks(params), {
      initialProps: { params: { limit: 1, offset: 0 } },
      wrapper: createQueryClientWrapper(),
    });
    await waitFor(() => result.current.isSuccess);
    rerender({ params: { limit: 1, offset: 0 } });
    expect(api.getTasks).toHaveBeenCalledTimes(1);
  });
});
