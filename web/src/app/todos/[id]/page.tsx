import { notFound } from "next/navigation";

import { TaskViewManager } from "@/components";

interface ViewTodoPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewTodoPage({ params }: ViewTodoPageProps) {
  const { id } = await params;
  if (isNaN(Number(id))) return notFound();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">View Task</h1>
      <TaskViewManager taskId={Number(id)} />
    </div>
  );
}
