const { createClient } = require("@supabase/supabase-js");

function createSupabasePortalStore() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_PORTAL_TABLE || "portal_state";
  const rowId = process.env.SUPABASE_PORTAL_ROW_ID || "carebridge-local";

  if (!url || !serviceRoleKey) {
    return null;
  }

  const client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  async function load() {
    const { data, error } = await client
      .from(table)
      .select("state")
      .eq("id", rowId)
      .maybeSingle();

    if (error) throw error;
    return data?.state || null;
  }

  async function save(state) {
    const { error } = await client
      .from(table)
      .upsert(
        {
          id: rowId,
          state,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

    if (error) throw error;
  }

  return {
    name: "Supabase",
    table,
    rowId,
    load,
    save
  };
}

module.exports = { createSupabasePortalStore };
