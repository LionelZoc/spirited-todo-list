import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export default function Button({
  children,
  variant = "secondary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "rounded px-4 py-2 font-semibold focus:outline-none transition disabled:opacity-50 cursor-pointer";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
    secondary: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
  };
  const width = fullWidth ? "w-full" : "";
  return (
    <button
      className={`${base} ${variants[variant]} ${width} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
