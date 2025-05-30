import { Priority, Task } from "@/types/task";

const priorityLabels = {
  [Priority.LOW]: "Low",
  [Priority.MID]: "Medium",
  [Priority.HIGH]: "High",
};

interface TaskViewProps {
  task: Task;
}

export default function TaskView({ task }: TaskViewProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl text-black font-bold mb-2">{task.title}</h2>
      <div className="mb-2 text-gray-700">
        <span className="font-semibold">Priority:</span>{" "}
        {priorityLabels[task.priority]}
      </div>
      {task.description && (
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Description:</span> {task.description}
        </div>
      )}

      <div className="mb-2 text-gray-700">
        <span className="font-semibold">Deadline:</span>{" "}
        {task.deadline ? new Date(task.deadline).toLocaleString() : "N/A"}
      </div>

      <div className="mb-2 text-gray-500 text-xs">
        <span>Created: {new Date(task.created_at).toLocaleString()}</span>
      </div>
      <div className="text-gray-500 text-xs">
        <span>Updated: {new Date(task.updated_at).toLocaleString()}</span>
      </div>
    </div>
  );
}
