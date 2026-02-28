/**
 * proxy.ts - Multi-tenancy Proxy for Food Mohalla
 * 
 * Next.js 16 proxy function that handles multi-tenant routing.
 * Runs for every request.
 * 
 * Tenants:
 * - "admin"    → /admin/* routes → Admin dashboard (sidebar layout)
 * - "customer" → /* routes       → Customer-facing pages (header/footer layout)
 */

import { NextRequest, NextResponse } from "next/server";

export type Tenant = "admin" | "customer";

export interface TenantConfig {
  tenant: Tenant;
  name: string;
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  features: string[];
}

const tenantConfigs: Record<Tenant, TenantConfig> = {
  admin: {
    tenant: "admin",
    name: "Food Mohalla Admin",
    theme: {
      primaryColor: "#ec7f13",
      accentColor: "#b05e0e",
    },
    features: [
      "dashboard",
      "orders-management",
      "inventory",
      "delivery-partners",
      "analytics",
      "settings",
    ],
  },
  customer: {
    tenant: "customer",
    name: "Food Mohalla",
    theme: {
      primaryColor: "#ec7f13",
      accentColor: "#b05e0e",
    },
    features: [
      "browse-menu",
      "place-order",
      "checkout",
      "order-tracking",
      "profile",
    ],
  },
};

/**
 * Detect tenant from the request URL pathname
 */
export function detectTenant(pathname: string): Tenant {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }
  return "customer";
}

/**
 * Get tenant configuration for the current request
 */
export function getTenantConfig(pathname: string): TenantConfig {
  const tenant = detectTenant(pathname);
  return tenantConfigs[tenant];
}

/**
 * Check if a user has access to a specific tenant feature
 */
export function hasFeature(tenant: Tenant, feature: string): boolean {
  const config = tenantConfigs[tenant];
  return config.features.includes(feature);
}

/**
 * Get the base URL for a given tenant
 */
export function getTenantBasePath(tenant: Tenant): string {
  if (tenant === "admin") return "/admin";
  return "/";
}

/**
 * Resolve a path relative to the tenant's base path
 */
export function resolveTenantPath(tenant: Tenant, path: string): string {
  const basePath = getTenantBasePath(tenant);
  if (tenant === "customer") return path;
  return `${basePath}${path}`;
}

/**
 * Utility to detect tenant info from a raw Request object (for API routes)
 */
export function proxyRequest(request: Request): {
  tenant: Tenant;
  config: TenantConfig;
  isAdmin: boolean;
} {
  const url = new URL(request.url);
  const tenant = detectTenant(url.pathname);
  const config = getTenantConfig(url.pathname);

  return {
    tenant,
    config,
    isAdmin: tenant === "admin",
  };
}

import { getToken } from "next-auth/jwt";

/**
 * Next.js 16 proxy function.
 * Runs for every incoming request.
 * Detects tenant, sets x-tenant header, and handles routing.
 */
export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const tenant = detectTenant(pathname);
  const config = tenantConfigs[tenant];

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Enforce admin authentication
  if (tenant === "admin") {
    // If the proxy is running in an Edge environment, getToken requires a secret
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Create response and set tenant headers for downstream components
  const response = NextResponse.next();
  response.headers.set("x-tenant", tenant);
  response.headers.set("x-tenant-name", config.name);

  return response;
}

/**
 * Configuration: Match all paths except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
