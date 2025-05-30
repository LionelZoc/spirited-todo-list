"use client";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

import Button from "./Button";
import Input from "./Input";

interface LoginFormProps {
  onSubmit: (values: { email: string; password: string }) => void;
  isSubmitting?: boolean;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

/**
 * this component will not be used now but can be usefull in the future if user auth is needed
 */
export default function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting: formikSubmitting, errors, touched }) => (
        <Form className="bg-white rounded-lg shadow p-6 w-full max-w-md mx-auto flex flex-col gap-4">
          <Field
            name="email"
            as={Input}
            type="email"
            label="Email"
            error={touched.email && errors.email ? errors.email : undefined}
          />
          <Field
            name="password"
            as={Input}
            type="password"
            label="Password"
            error={
              touched.password && errors.password ? errors.password : undefined
            }
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting || formikSubmitting}
          >
            {isSubmitting || formikSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
