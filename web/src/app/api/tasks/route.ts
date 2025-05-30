import { NextRequest, NextResponse } from "next/server";

import { API_BASE } from "@/constants/api";
import { ErrorCode } from "@/constants/error";
import { extractError } from "@/utils/helper";

// Use Docker service name for internal calls, or env for prod

export async function GET(req: NextRequest) {
  const url = new URL("/tasks", API_BASE);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      return NextResponse.json(
        await extractError(res, "Failed to fetch tasks"),
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: {
          msg: "Internal server error",
          error_code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const url = `${API_BASE}/tasks`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    if (!res.ok) {
      return NextResponse.json(
        await extractError(res, "Failed to create task"),
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: {
          msg: "Internal server error",
          error_code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      { status: 500 },
    );
  }
}
