import type { NextRequest } from "next/server";
import {
  errorResponse,
  jsonResponse,
  proxyWithSessionAuth,
} from "@/shared/lib/api/proxy";
import { ApiError } from "@/shared/types/global-response";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyAdminRequest(request: NextRequest, pathSegments: string[]) {
  const search = request.nextUrl.search;
  const backendPath = `/admin/${pathSegments.join("/")}${search}`;
  const method = request.method;
  const contentType = request.headers.get("content-type") ?? "";

  let body: unknown;
  let isFormData = false;

  if (method === "GET" || method === "HEAD") {
    body = undefined;
  } else if (contentType.includes("multipart/form-data")) {
    body = await request.formData();
    isFormData = true;
  } else {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  const { data, status } = await proxyWithSessionAuth<unknown>(backendPath, {
    method,
    body,
    isFormData,
  });

  return jsonResponse(data, status);
}

async function handleAdminRoute(request: NextRequest, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const path = params?.path;

    if (!Array.isArray(path) || path.length === 0) {
      return errorResponse(new ApiError("Admin route path is required", 404));
    }

    return proxyAdminRequest(request, path);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleAdminRoute(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleAdminRoute(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleAdminRoute(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleAdminRoute(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleAdminRoute(request, context);
}
