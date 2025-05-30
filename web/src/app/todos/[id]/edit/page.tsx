"use client";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";

import { TaskUpdateFormManager } from "@/components";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditTodoPage({ params }: Props) {
  const router = useRouter();

  const { id } = use(params);
  if (isNaN(Number(id))) return notFound();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
      <TaskUpdateFormManager
        taskId={Number(id)}
        onSuccess={() => router.push(`/todos/${id}`)}
      />
    </div>
  );
}
