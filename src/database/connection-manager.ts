
import { masterDb, TenantRecord } from "./master";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

interface CachedClient {
  client: PrismaClient;
  lastUsed: number;
}

interface ConnectionManagerOptions {
  maxCachedClients?: number;
  idleEvictionMs?: number;
}

class ConnectionManager {
  private cache = new Map<string, CachedClient>();
  private readonly maxCachedClients: number;
  private readonly idleEvictionMs: number;
  private evictionTimer: NodeJS.Timeout;

  constructor(options: ConnectionManagerOptions = {}) {
    this.maxCachedClients = options.maxCachedClients ?? 100;
    this.idleEvictionMs = options.idleEvictionMs ?? 10 * 60 * 1000; // 10 min

    this.evictionTimer = setInterval(() => this.evictIdle(), 60 * 1000);
    this.evictionTimer.unref?.();
  }


  async getClient(tenantId: string): Promise<PrismaClient> {
    const cached = this.cache.get(tenantId);
    if (cached) {
      cached.lastUsed = Date.now();
      return cached.client;
    }

    const tenant = await masterDb.getTenant(tenantId);

    console.log(`Fetching tenant ${tenantId} from master database:`, tenant);


    if (!tenant) {
      throw new TenantNotFoundError(tenantId);
    }
    if (tenant.status === "suspended") {
      throw new TenantSuspendedError(tenantId);
    }

    return this.createAndCacheClient(tenant);
  }

  private createAndCacheClient(tenant: TenantRecord): PrismaClient {
    if (this.cache.size >= this.maxCachedClients) {
      this.evictLeastRecentlyUsed();
    }

    const adapter = new PrismaMariaDb({
      host: tenant.db.host,
      port: tenant.db.port,
      user: tenant.db.user,
      password: tenant.db.password,
      database: tenant.db.database,
      connectionLimit: 5,
    });

    const client = new PrismaClient({ adapter });

    this.cache.set(tenant.tenantId, { client, lastUsed: Date.now() });
    return client;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestId: string | null = null;
    let oldestTime = Infinity;

    for (const [tenantId, entry] of this.cache) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed;
        oldestId = tenantId;
      }
    }

    if (oldestId) this.evictTenant(oldestId);
  }

  private evictIdle(): void {
    const now = Date.now();
    for (const [tenantId, entry] of this.cache) {
      if (now - entry.lastUsed > this.idleEvictionMs) {
        this.evictTenant(tenantId);
      }
    }
  }

  private evictTenant(tenantId: string): void {
    const entry = this.cache.get(tenantId);
    if (!entry) return;
    entry.client
      .$disconnect()
      .catch((err: Error) =>
        console.error(`[connection-manager] Error disconnecting tenant ${tenantId}`, err),
      );
    this.cache.delete(tenantId);
  }


  async shutdown(): Promise<void> {
    clearInterval(this.evictionTimer);
    await Promise.all(Array.from(this.cache.values()).map((entry) => entry.client.$disconnect()));
    this.cache.clear();
  }

  get activeConnectionCount(): number {
    return this.cache.size;
  }
}

export class TenantNotFoundError extends Error {
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`);
    this.name = "TenantNotFoundError";
  }
}

export class TenantSuspendedError extends Error {
  constructor(tenantId: string) {
    super(`Tenant is suspended: ${tenantId}`);
    this.name = "TenantSuspendedError";
  }
}

export const connectionManager = new ConnectionManager();
