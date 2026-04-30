import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL ||
  process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL ||
  "http://localhost:8000";

async function proxy(request: NextRequest, parts: string[]) {
  const url = new URL(request.url);
  const target = `${PYTHON_BACKEND_URL.replace(/\/$/, "")}/${parts.join("/")}${url.search}`;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  const response = await fetch(target, {
    method: request.method,
    headers: { "Content-Type": request.headers.get("content-type") || "application/json" },
    body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path);
}
