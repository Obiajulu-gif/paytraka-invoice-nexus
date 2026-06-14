import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, PATCH, POST } from "./route";

const cookieValues = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value ? { value } : undefined;
    },
  })),
}));

function request(url: string, init?: RequestInit) {
  return new NextRequest(url, init);
}

function context(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe("/api/proxy/[...path] route", () => {
  beforeEach(() => {
    cookieValues.clear();
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated requests before contacting the upstream API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await GET(request("http://localhost/api/proxy/customers?page=1"), context(["customers"]));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, message: "Authentication required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows public auth endpoints without an existing session cookie", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { accessToken: "access-token", refreshToken: "refresh-token", user: { id: "user-1" } },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const body = JSON.stringify({ email: "ada@example.com", password: "Test@1234" });

    const response = await POST(request("http://localhost/api/proxy/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }), context(["auth", "login"]));

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://paytraka-api.domain-plusltd.com/api/auth/login");
    expect((init.headers as Headers).get("Authorization")).toBeNull();
    expect(init.body).toBe(body);
  });

  it("allows OTP resend without an existing session cookie", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      message: "A new verification code has been sent.",
      data: null,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const body = JSON.stringify({ user_id: "user-1" });

    const response = await POST(request("http://localhost/api/proxy/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }), context(["auth", "resend-otp"]));

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://paytraka-api.domain-plusltd.com/api/auth/resend-otp");
    expect((init.headers as Headers).get("Authorization")).toBeNull();
    expect(init.body).toBe(body);
  });

  it("rejects requests with a missing proxy path", async () => {
    cookieValues.set("paytraka_access_token", "access-token");
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await GET(request("http://localhost/api/proxy"), context([]));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, message: "API path is required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards GET requests with bearer auth and query parameters", async () => {
    cookieValues.set("paytraka_access_token", "access-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: [{ id: "customer-1" }],
      pagination: { total: 1, page: 2, limit: 10, totalPages: 1 },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const response = await GET(request("http://localhost/api/proxy/customers?page=2&limit=10"), context(["customers"]));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [{ id: "customer-1" }],
      pagination: { total: 1, page: 2, limit: 10, totalPages: 1 },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://paytraka-api.domain-plusltd.com/api/customers?page=2&limit=10");
    expect(init.method).toBe("GET");
    expect((init.headers as Headers).get("Authorization")).toBe("Bearer access-token");
    expect(init.cache).toBe("no-store");
  });

  it("forwards JSON request bodies for mutating methods", async () => {
    cookieValues.set("paytraka_access_token", "access-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { id: "customer-1" },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    const body = JSON.stringify({ name: "Ada Ventures" });

    const response = await POST(request("http://localhost/api/proxy/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }), context(["customers"]));

    expect(response.status).toBe(201);
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(init.method).toBe("POST");
    expect((init.headers as Headers).get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(body);
  });

  it("forwards multipart form data without overriding its content type", async () => {
    cookieValues.set("paytraka_access_token", "access-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: [],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const formData = new FormData();
    formData.append("file", new Blob(["name,email\nAda,ada@example.com"]), "customers.csv");

    const response = await POST(request("http://localhost/api/proxy/customers/import", {
      method: "POST",
      body: formData,
    }), context(["customers", "import"]));

    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect((init.headers as Headers).get("Content-Type")).toBeNull();
    expect(init.body).toBeInstanceOf(FormData);
  });

  it("proxies upstream error responses without rewriting the status code", async () => {
    cookieValues.set("paytraka_access_token", "access-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: false,
      message: "Validation failed",
    }), { status: 422, headers: { "Content-Type": "application/json" } }));

    const response = await PATCH(request("http://localhost/api/proxy/customers/customer-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    }), context(["customers", "customer-1"]));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({ success: false, message: "Validation failed" });
  });

  it("returns a deterministic gateway error when the upstream API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ENOTFOUND"));

    const response = await POST(request("http://localhost/api/proxy/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ada@example.com" }),
    }), context(["auth", "register"]));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ success: false, message: "We could not reach PayTraka right now. Check your connection and try again." });
  });
});
