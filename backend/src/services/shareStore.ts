import { nanoid } from "nanoid";
import { supabase } from "../config/supabase";

export interface PublicAuditRecord {
  id: string;
  createdAt: number;
  // Sanitized payload only (no email/company)
  auditResult: unknown;
}

interface ShareStore {
  create(auditResult: unknown): Promise<PublicAuditRecord>;
  get(id: string): Promise<PublicAuditRecord | null>;
}

class InMemoryShareStore implements ShareStore {
  private records = new Map<string, PublicAuditRecord>();

  async create(auditResult: unknown) {
    const id = nanoid(10);
    const record: PublicAuditRecord = {
      id,
      createdAt: Date.now(),
      auditResult,
    };
    this.records.set(id, record);
    return record;
  }

  async get(id: string) {
    return this.records.get(id) ?? null;
  }
}

class SupabaseShareStore implements ShareStore {
  async create(auditResult: unknown) {
    const id = nanoid(10);

    const { error } = await supabase.from("public_audits").insert({
      id,
      audit_result: auditResult as any,
    });

    if (error) {
      throw new Error(`Failed to persist share record: ${error.message}`);
    }

    return {
      id,
      createdAt: Date.now(),
      auditResult,
    };
  }

  async get(id: string) {
    const { data, error } = await supabase
      .from("public_audits")
      .select("id, created_at, audit_result")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch share record: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      createdAt: Date.parse(data.created_at),
      auditResult: data.audit_result,
    };
  }
}

function hasSupabaseEnv() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export const shareStore: ShareStore = hasSupabaseEnv()
  ? new SupabaseShareStore()
  : new InMemoryShareStore();
