import Link from "next/link";

import { TaskListManager } from "@/components";
import { Button } from "@/uikit";

export default function TodosPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Todos</h1>
        <Link href="/todos/create">
          <Button variant="primary">Create Task</Button>
        </Link>
      </div>
      <TaskListManager />
    </div>
  );
}
