import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_048_576;
const ALLOWED_REQUEST_HEADERS = ["accept", "authorization", "content-type", "x-request-id"];
const ALLOWED_RESPONSE_HEADERS = ["cache-control", "content-type", "content-disposition"];
type RouteContext = { params: Promise<{ path: string[] }> };
type ApiMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
type BodyReadResult =
  | { ok: true; body: ArrayBuffer | undefined }
  | { ok: false; reason: "too_large" | "unreadable" };

async function readBoundedBody(stream: ReadableStream<Uint8Array> | null): Promise<BodyReadResult> {
  if (!stream) return { ok: true, body: undefined };

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: "unreadable" };
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, body: combined.buffer };
}

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const method = request.method as ApiMethod;
  const declaredLength = request.headers.get("content-length");

  if (!path.length || path.some((part) => part === "." || part === "..")) {
    return Response.json({ detail: "Invalid API path." }, { status: 400 });
  }
  if (declaredLength !== null) {
    const contentLength = Number(declaredLength);
    if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
      return Response.json({ detail: "Invalid Content-Length." }, { status: 400 });
    }
    if (contentLength > MAX_BODY_BYTES) {
      return Response.json({ detail: "Request body exceeds the 1 MiB limit." }, { status: 413 });
    }
  }

  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const result = await readBoundedBody(request.body);
    if (!result.ok) {
      const tooLarge = result.reason === "too_large";
      return Response.json(
        { detail: tooLarge ? "Request body exceeds the 1 MiB limit." : "Request body could not be read." },
        { status: tooLarge ? 413 : 400 },
      );
    }
    body = result.body;
  }

  const upstreamBase = (process.env.CODEMIND_API_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
  const upstreamUrl = `${upstreamBase}/api/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const header of ALLOWED_REQUEST_HEADERS) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(60_000),
    });
    const responseHeaders = new Headers();
    for (const header of ALLOWED_RESPONSE_HEADERS) {
      const value = upstream.headers.get(header);
      if (value) responseHeaders.set(header, value);
    }
    responseHeaders.set("cache-control", "no-store");
    const noResponseBody = method === "HEAD" || [204, 205, 304].includes(upstream.status);
    return new Response(noResponseBody ? null : await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { detail: "CodeMind API is unavailable." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
