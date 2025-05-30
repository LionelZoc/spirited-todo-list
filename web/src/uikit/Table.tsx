import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import Button from "./Button";

interface TableProps<T extends object> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  onRowClick?: (row: T) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export default function Table<T extends object>({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  sorting,
  onSortingChange,
  onRowClick,
  globalFilter,
  onGlobalFilterChange,
}: TableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
      globalFilter,
    },
    onSortingChange,
    onPaginationChange,
    onGlobalFilterChange,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualFiltering: !!onGlobalFilterChange,
  });

  // Helper to update pagination state
  const setPage = (page: number) => {
    onPaginationChange((old) => ({ ...old, pageIndex: page }));
  };

  return (
    <div className="overflow-x-auto w-full">
      {typeof globalFilter !== "undefined" && onGlobalFilterChange && (
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder="Search..."
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
          />
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none"
                  onClick={
                    header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {header.column.getIsSorted() === "asc" && <span> ▲</span>}
                  {header.column.getIsSorted() === "desc" && <span> ▼</span>}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={
                onRowClick
                  ? "hover:bg-blue-50 cursor-pointer transition"
                  : "hover:bg-gray-50"
              }
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
        <div className="flex gap-2">
          <Button onClick={() => setPage(0)} disabled={pageIndex === 0}>
            First
          </Button>
          <Button
            onClick={() => setPage(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            Prev
          </Button>
        </div>
        <span className="text-sm">
          Page <b>{pageIndex + 1}</b> of <b>{pageCount}</b>
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => setPage(pageIndex + 1)}
            disabled={pageIndex + 1 >= pageCount}
          >
            Next
          </Button>
          <Button
            onClick={() => setPage(pageCount - 1)}
            disabled={pageIndex + 1 >= pageCount}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
