"use client";
import { useRouter } from "next/navigation";

import Button from "@/uikit/Button";

export default function BackNavigation({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={() => router.back()}
      className="flex items-center gap-2 mb-4"
      aria-label={label}
    >
      <span aria-hidden className="text-lg">
        ←
      </span>
      {label}
    </Button>
  );
}
