import supabase from "../../lib/supabaseClinet";

// Lightweight uuid v4 generator (browser-friendly) and validator
function uuidv4() {
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      arr[6] = (arr[6] & 0x0f) | 0x40;
      arr[8] = (arr[8] & 0x3f) | 0x80;
      const hex = Array.from(arr)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(
        12,
        4
      )}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
    }
  } catch (e) {
    // fall through to fallback
  }
  // fallback (less crypto-secure)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function validateUuid(u) {
  return (
    typeof u === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      u
    )
  );
}

// Helper to ensure a value is a valid project ID (integer)
export function ensureProjectId(value) {
  if (!value) return null;
  // Convert to integer if it's a string number
  const intValue = parseInt(value, 10);
  if (isNaN(intValue) || intValue <= 0) return null;
  return intValue;
}

// Helper to ensure a value is a UUID string; if not present, generate one.
export function ensureUuid(value) {
  if (!value) return uuidv4();
  if (typeof value === "string" && validateUuid(value)) return value;
  // if numeric or other, cast to string? Prefer generating a new UUID.
  return uuidv4();
}

export { validateUuid };

// Generic: save JSON payload for a project into a table. It inserts or updates a single
// row per project (identified by project_id column). The table is expected to have
// columns: id (serial pk), project_id (integer), data (jsonb), updated_at (timestamp).
export async function upsertProjectJson({
  table,
  projectId,
  jsonData,
  id, // optional id of existing row
}) {
  try {
    const project_id = ensureProjectId(projectId);
    if (!project_id) {
      throw new Error("Invalid project ID");
    }

    const payload = {
      project_id: project_id,
      data: jsonData,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      // update existing record
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return { data };
    }

    // Try inserting; if conflict on project_id, do an upsert using .upsert if PostgREST allows
    // Using insert().upsert is not directly available in supabase-js; we emulate by trying insert and then update on conflict
    const { data: insertData, error: insertError } = await supabase
      .from(table)
      .insert([{ ...payload }])
      .select()
      .maybeSingle();
    if (insertError) {
      // If it's a unique constraint violation on project_id, try update
      // Fallback: update where project_id matches
      const { data: updateData, error: updateError } = await supabase
        .from(table)
        .update(payload)
        .eq("project_id", project_id)
        .select()
        .maybeSingle();
      if (updateError) throw updateError;
      return { data: updateData };
    }
    return { data: insertData };
  } catch (error) {
    console.error("upsertProjectJson error:", error);
    return { error };
  }
}

export async function fetchProjectJson({ table, projectId }) {
  try {
    const project_id = ensureProjectId(projectId);
    if (!project_id) {
      throw new Error("Invalid project ID");
    }

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("project_id", project_id)
      .order("updated_at", { ascending: false }); // Get most recent first

    if (error) throw error;

    // If we get an array, take the first (most recent) record
    // If we get a single record, use it directly
    const record = Array.isArray(data) ? data[0] : data;

    return { data: record || null };
  } catch (error) {
    console.error("fetchProjectJson error:", error);
    return { error };
  }
}
