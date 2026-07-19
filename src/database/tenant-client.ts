import { AsyncLocalStorage } from "node:async_hooks";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "../generated/prisma/client";
import { connectionManager } from "./connection-manager";

interface TenantContext {
  tenantId: string;
}

const tenantContextStorage = new AsyncLocalStorage<TenantContext>();

export function getCurrentTenant(): string {
  const ctx = tenantContextStorage.getStore();
  if (!ctx) {
    throw new Error("No tenant context found.");
  }
  return ctx.tenantId;
}

export async function getTenantPrisma(): Promise<PrismaClient> {
  console.log("invocked getTenantPrisma")
  const tenantId = getCurrentTenant();
  return connectionManager.getClient(tenantId);
}

export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return tenantContextStorage.run({ tenantId }, fn);
}

export function tenantMiddleware() {

  return (req: Request, res: Response, next: NextFunction) => {
    const tenantId = defaultResolver(req);

    console.log(tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: "Missing tenant" });
    }
    runWithTenant(tenantId, () => next());
  };
}

function defaultResolver(req: Request): string | undefined {
  if (process.env.NODE_ENV === "development") {
    return req.headers["x-tenant-id"] as string | undefined;
  }

  const subdomain = req.hostname.split(".")[0];
  if (subdomain !== "www") {
    return subdomain;
  }

  return undefined;
}
