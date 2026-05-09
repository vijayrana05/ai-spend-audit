"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
function required(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing required env var: ${name}`);
    return v;
}
/**
 * Backend-only Supabase client.
 * Uses service role key so it can write without relying on user auth.
 */
exports.supabase = (0, supabase_js_1.createClient)(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
});
