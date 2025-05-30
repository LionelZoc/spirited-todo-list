import React from "react";

import BackNavigation from "@/components/BackNavigation";

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xxl mx-auto w-full px-4 py-6">
      <BackNavigation label="Back " />
      {children}
    </div>
  );
}
