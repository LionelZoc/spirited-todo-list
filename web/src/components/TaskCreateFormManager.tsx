"use client";
import { useState } from "react";

import { useCreateTask } from "@/hooks/useCreateTask";
import { Priority } from "@/types/task";
import { TaskUpdateForm } from "@/uikit";
import { getErrorText } from "@/utils/error";

interface TaskCreateFormManagerProps {
  onSuccess?: () => void;
}

const initial = {
  title: "",
  description: "",
  priority: Priority.MID,
};

export default function TaskCreateFormManager({
  onSuccess,
}: TaskCreateFormManagerProps) {
  const [formKey, setFormKey] = useState(0); // for resetting form
  const { mutate, isPending, isError, error, isSuccess } = useCreateTask({
    onSuccess: () => {
      setFormKey((k) => k + 1);
      onSuccess?.();
    },
  });

  return (
    <div>
      <TaskUpdateForm
        key={formKey}
        initial={initial}
        onSubmit={mutate}
        isSubmitting={isPending}
      />
      {isError && <div className="text-red-500 p-2">{getErrorText(error)}</div>}
      {isSuccess && <div className="text-green-600 p-2">Task created!</div>}
    </div>
  );
}
