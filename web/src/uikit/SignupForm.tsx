"use client";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

import Button from "./Button";
import Input from "./Input";

interface SignupFormProps {
  onSubmit: (values: { email: string; password: string }) => void;
  isSubmitting?: boolean;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

/**
 * this component will not be used now but can be usefull in the future if user auth is needed
 */
export default function SignupForm({
  onSubmit,
  isSubmitting,
}: SignupFormProps) {
  return (
    <Formik
      initialValues={{ email: "", password: "", confirmPassword: "" }}
      validationSchema={validationSchema}
      onSubmit={({ email, password }) => onSubmit({ email, password })}
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
          <Field
            name="confirmPassword"
            as={Input}
            type="password"
            label="Confirm Password"
            error={
              touched.confirmPassword && errors.confirmPassword
                ? errors.confirmPassword
                : undefined
            }
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting || formikSubmitting}
          >
            {isSubmitting || formikSubmitting ? "Signing up..." : "Sign Up"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
