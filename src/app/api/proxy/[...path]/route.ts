import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import http from "node:http";
import https from "node:https";
import { API_BASE_URL } from "@/lib/api/client";

const ACCESS_COOKIE = "paytraka_access_token";
const UPSTREAM_UNAVAILABLE_MESSAGE = "We could not reach PayTraka right now. Check your connection and try again.";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  const { path } = await context.params;
  if (!path?.length) {
    return NextResponse.json({ success: false, message: "API path is required" }, { status: 400 });
  }

  const isPublicAuthPath = path[0] === "auth" && ["login", "register", "verify-otp", "resend-otp"].includes(path[1] ?? "");

  if (!accessToken && !isPublicAuthPath) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const upstreamUrl = new URL(`${API_BASE_URL}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

  const headers = new Headers();
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const contentType = request.headers.get("content-type");
  let body: BodyInit | undefined;

  if (!["GET", "HEAD"].includes(request.method)) {
    if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      headers.set("Content-Type", contentType ?? "application/json");
      body = await request.text();
    }
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (error) {
    try {
      upstreamResponse = await retryKnownPaytrakaTlsIssue(error, upstreamUrl, request.method, headers, body);
    } catch {
      return NextResponse.json({ success: false, message: UPSTREAM_UNAVAILABLE_MESSAGE }, { status: 502 });
    }
  }

  const responseContentType = upstreamResponse.headers.get("content-type") ?? "application/json";
  const responseBody = await upstreamResponse.arrayBuffer();

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type": responseContentType,
    },
  });
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

function shouldRetryKnownPaytrakaTlsIssue(error: unknown, upstreamUrl: URL, body: BodyInit | undefined) {
  if (upstreamUrl.protocol !== "https:" || upstreamUrl.hostname !== "paytraka-api.domain-plusltd.com") return false;
  if (typeof body !== "undefined" && typeof body !== "string") return false;
  const text = error instanceof Error ? `${error.message} ${(error as Error & { cause?: unknown }).cause ?? ""}` : String(error);
  return /cert|certificate|TLS|ERR_TLS_CERT_ALTNAME_INVALID|fetch failed/i.test(text);
}

async function retryKnownPaytrakaTlsIssue(error: unknown, upstreamUrl: URL, method: string, headers: Headers, body: BodyInit | undefined) {
  if (!shouldRetryKnownPaytrakaTlsIssue(error, upstreamUrl, body)) throw error;
  return requestWithNode(upstreamUrl, method, headers, body as string | undefined, true);
}

function requestWithNode(upstreamUrl: URL, method: string, headers: Headers, body: string | undefined, allowInvalidTls: boolean) {
  return new Promise<Response>((resolve, reject) => {
    const transport = upstreamUrl.protocol === "https:" ? https : http;
    const request = transport.request({
      protocol: upstreamUrl.protocol,
      hostname: upstreamUrl.hostname,
      port: upstreamUrl.port,
      path: `${upstreamUrl.pathname}${upstreamUrl.search}`,
      method,
      headers: Object.fromEntries(headers.entries()),
      rejectUnauthorized: !allowInvalidTls,
    }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      response.on("end", () => {
        resolve(new Response(Buffer.concat(chunks), {
          status: response.statusCode ?? 502,
          headers: normalizeNodeResponseHeaders(response.headers),
        }));
      });
    });

    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function normalizeNodeResponseHeaders(headers: http.IncomingHttpHeaders) {
  const normalized = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === "string") {
      normalized.set(key, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => normalized.append(key, item));
    }
  });
  return normalized;
}
