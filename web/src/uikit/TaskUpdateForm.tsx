"use client";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";

import { Priority, Task } from "@/types/task";

import Button from "./Button";
import Input from "./Input";

interface TaskUpdateFormProps {
  initial: Pick<Task, "title" | "description" | "priority" | "deadline">;
  onSubmit: (values: {
    title: string;
    description?: string;
    priority: Priority;
    deadline?: string;
  }) => void;
  isSubmitting?: boolean;
}

const priorityOptions = [
  { value: Priority.LOW, label: "Low" },
  { value: Priority.MID, label: "Medium" },
  { value: Priority.HIGH, label: "High" },
];

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .required("Title is required"),
  description: Yup.string().max(
    500,
    "Description must be at most 500 characters",
  ),
  priority: Yup.number()
    .oneOf([Priority.LOW, Priority.MID, Priority.HIGH], "Invalid priority")
    .required("Priority is required"),
  deadline: Yup.string().nullable(),
});

export default function TaskUpdateForm({
  initial,
  onSubmit,
  isSubmitting,
}: TaskUpdateFormProps) {
  // Convert ISO string to local datetime-local value for input
  const initialDeadline = initial.deadline
    ? new Date(initial.deadline).toISOString().slice(0, 16)
    : "";
  return (
    <Formik
      initialValues={{ ...initial, deadline: initialDeadline }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // Convert local datetime-local value back to ISO string or undefined
        const deadline = values.deadline
          ? new Date(values.deadline).toISOString()
          : undefined;
        onSubmit({ ...values, deadline });
      }}
      enableReinitialize
    >
      {({ errors, touched }) => (
        <Form className="bg-white rounded-lg shadow p-6 w-full max-w-md mx-auto flex flex-col gap-4">
          <Field
            name="title"
            as={Input}
            label="Title"
            error={touched.title && errors.title ? errors.title : undefined}
          />
          <Field
            name="description"
            as={Input}
            label="Description"
            error={
              touched.description && errors.description
                ? errors.description
                : undefined
            }
          />
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <Field
              as="select"
              id="priority"
              name="priority"
              className="block w-full text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="priority"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <Field
            name="deadline"
            as={Input}
            label="Deadline"
            type="datetime-local"
            error={
              touched.deadline && errors.deadline ? errors.deadline : undefined
            }
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
