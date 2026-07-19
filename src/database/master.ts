
import { config } from "dotenv";
import mysql, { Pool, RowDataPacket } from "mysql2/promise";

config();

export interface TenantRecord {
  tenantId: string;
  name: string;
  status: "active" | "suspended" | "migrating";
  db: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
}

interface TenantRow extends RowDataPacket {
  tenant_id: string;
  name: string;
  status: "active" | "suspended" | "migrating";
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  db_password: string;
}

const masterPool: Pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  database: process.env.DATABASE_NAME || "master",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  connectionLimit: 5,
});

class MasterDatabase {
  async getTenant(tenantId: string): Promise<TenantRecord | null> {

    console.log("tanent",tenantId)
    const [rows] = await masterPool.query<TenantRow[]>(
      `SELECT id, name, slug,status, db_host, db_port, db_name, db_user, db_password
       FROM tenants
       WHERE id = ?`,
      [tenantId]
    );

    console.log(rows);

    if (rows.length === 0) return null;
    return this.toTenantRecord(rows[0]);
  }

  async getTenantBySlug(slug: string): Promise<TenantRecord | null> {
    const [rows] = await masterPool.query<RowDataPacket[]>(
      `SELECT tenant_id FROM tenant_slugs WHERE slug = ?`,
      [slug]
    );
    if (rows.length === 0) return null;
    return this.getTenant(rows[0].tenant_id);
  }


  private toTenantRecord(row: TenantRow): TenantRecord {
    return {
      tenantId: row.id,
      name: row.name,
      status: row.status,
      db: {
        host: row.db_host,
        port: row.db_port,
        database: row.db_name,
        user: row.db_user,
        password: row.db_password,
      },
    };
  }

  async close(): Promise<void> {
    await masterPool.end();
  }
}


export const masterDb = new MasterDatabase();