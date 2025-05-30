"use client";
import { useRouter } from "next/navigation";

import { TaskCreateFormManager } from "@/components";

export default function CreateTodoPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create Task</h1>
      <TaskCreateFormManager onSuccess={() => router.push("/todos")} />
    </div>
  );
}
