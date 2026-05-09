"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareStore = void 0;
const nanoid_1 = require("nanoid");
const supabase_1 = require("../config/supabase");
class InMemoryShareStore {
    records = new Map();
    async create(auditResult) {
        const id = (0, nanoid_1.nanoid)(10);
        const record = {
            id,
            createdAt: Date.now(),
            auditResult,
        };
        this.records.set(id, record);
        return record;
    }
    async get(id) {
        return this.records.get(id) ?? null;
    }
}
class SupabaseShareStore {
    async create(auditResult) {
        const id = (0, nanoid_1.nanoid)(10);
        const { error } = await supabase_1.supabase.from("public_audits").insert({
            id,
            audit_result: auditResult,
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
    async get(id) {
        const { data, error } = await supabase_1.supabase
            .from("public_audits")
            .select("id, created_at, audit_result")
            .eq("id", id)
            .maybeSingle();
        if (error) {
            throw new Error(`Failed to fetch share record: ${error.message}`);
        }
        if (!data)
            return null;
        return {
            id: data.id,
            createdAt: Date.parse(data.created_at),
            auditResult: data.audit_result,
        };
    }
}
function hasSupabaseEnv() {
    return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
exports.shareStore = hasSupabaseEnv()
    ? new SupabaseShareStore()
    : new InMemoryShareStore();
