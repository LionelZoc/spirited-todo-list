import { NextRequest, NextResponse } from "next/server";

import { API_BASE } from "@/constants/api";
import { ErrorCode } from "@/constants/error";
import { extractError } from "@/utils/helper";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const url = `${API_BASE}/tasks/${params.id}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        await extractError(res, "Failed to fetch task"),
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
          error_code: ErrorCode.INVALID_INPUT,
        },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const url = `${API_BASE}/tasks/${params.id}`;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    if (!res.ok) {
      return NextResponse.json(
        await extractError(res, "Failed to update task"),
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const url = `${API_BASE}/tasks/${params.id}`;
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      return NextResponse.json(
        await extractError(res, "Failed to delete task"),
        { status: res.status },
      );
    }
    return new Response(null, { status: 204 });
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
