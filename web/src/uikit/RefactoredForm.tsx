"use client";
import { useState, ChangeEvent, MouseEvent } from "react";

type TaskFormProps = {
  onSubmit: ({ title, priority }: { title: string; priority: string }) => void;
};

enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export type PriorityKeyType = keyof typeof Priority;
export type PriorityValueType = (typeof Priority)[PriorityKeyType];

/**
 *
 * - put priority in an enum
 * - avoid inline onClick function
 * - use data-testid for testing with react-testing-library
 */
export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<PriorityValueType>(Priority.LOW);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as PriorityValueType);
  };

  // if it was in a really big form with more unlink elements a useCallback would have been better but here it's not necessary
  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSubmit({ title, priority });
  };

  return (
    <div>
      <input data-testid="title-input" value={title} onChange={handleChange} />
      <select
        data-testid="priority-select"
        value={priority}
        onChange={handlePriorityChange}
      >
        {Object.values(Priority).map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
      <button data-testid="create-button" onClick={handleSubmit}>
        Create
      </button>
    </div>
  );
};
