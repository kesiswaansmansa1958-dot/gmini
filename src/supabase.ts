/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { Student, CorrectionRequest } from "./types";

// Primary Supabase Configurations (using provided values as fallback)
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://sqgdsochvengevxxkdpr.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_Lbj5dOqmDYWB-crOsEPLHg_NpPOhuuo";

// Graceful cleanup: strip rest/v1/ suffix if appended mistakenly
const cleanedUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, "");
const cleanedKey = SUPABASE_ANON_KEY.trim();

export const supabase = createClient(cleanedUrl, cleanedKey);

/**
 * Fetch all students from Supabase
 * Fallback to null if connection or table does not exist yet.
 */
export async function fetchStudentsFromSupabase(): Promise<Student[] | null> {
  try {
    const { data, error } = await supabase
      .from("buku_induk_students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase: Error fetching students - tables might not exist yet:", error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => {
      // Document schema auto-detection
      if (row.data) {
        const parsed = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        return { ...parsed, id: row.id };
      }
      // Flat schema auto-detection (in case tables are flat)
      return {
        id: row.id,
        personal: typeof row.personal === "string" ? JSON.parse(row.personal) : row.personal,
        address: typeof row.address === "string" ? JSON.parse(row.address) : row.address,
        health: typeof row.health === "string" ? JSON.parse(row.health) : row.health,
        education: typeof row.education === "string" ? JSON.parse(row.education) : row.education,
        parents: typeof row.parents === "string" ? JSON.parse(row.parents) : row.parents,
        guardian: typeof row.guardian === "string" ? JSON.parse(row.guardian) : row.guardian,
        school: typeof row.school === "string" ? JSON.parse(row.school) : row.school,
        foto: row.foto,
        allowPrint: row.allowPrint !== undefined ? row.allowPrint : (row.allow_print !== undefined ? row.allow_print : true)
      } as Student;
    });
  } catch (err) {
    console.error("Supabase: Connection failure when fetching students kesiswaan:", err);
    return null;
  }
}

/**
 * Fetch all correction requests from Supabase
 */
export async function fetchRequestsFromSupabase(): Promise<CorrectionRequest[] | null> {
  try {
    const { data, error } = await supabase
      .from("buku_induk_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase: Error fetching requests - table might not exist yet:", error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => {
      if (row.data) {
        const parsed = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        return { ...parsed, id: row.id };
      }
      return row as CorrectionRequest;
    });
  } catch (err) {
    console.error("Supabase: Connection failure when fetching requests:", err);
    return null;
  }
}

/**
 * Save / Upsert a student to Supabase
 */
export async function upsertStudentToSupabase(student: Student): Promise<boolean> {
  try {
    // Try document store pattern first (id, data)
    const { error: docError } = await supabase
      .from("buku_induk_students")
      .upsert({
        id: student.id,
        data: student
      });

    if (docError) {
      console.warn("Supabase: Doc-style upsert failed, trying direct flat schema:", docError.message);
      // Flat style fallback: map properties directly
      const { error: flatError } = await supabase
        .from("buku_induk_students")
        .upsert({
          id: student.id,
          personal: student.personal,
          address: student.address,
          health: student.health,
          education: student.education,
          parents: student.parents,
          guardian: student.guardian,
          school: student.school,
          foto: student.foto,
          allowPrint: student.allowPrint !== false
        });

      if (flatError) {
        console.error("Supabase: Both document and flat upsert failed for student:", flatError.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Supabase: Exception on student upsert:", err);
    return false;
  }
}

/**
 * Save / Upsert a single request to Supabase
 */
export async function upsertRequestToSupabase(request: CorrectionRequest): Promise<boolean> {
  try {
    const { error: docError } = await supabase
      .from("buku_induk_requests")
      .upsert({
        id: request.id,
        data: request
      });

    if (docError) {
      console.warn("Supabase: Doc-style upsert for request failed, trying flat style:", docError.message);
      const { error: flatError } = await supabase
        .from("buku_induk_requests")
        .upsert(request);

      if (flatError) {
        console.error("Supabase: Request flat upsert failed:", flatError.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Supabase: Exception on request upsert:", err);
    return false;
  }
}

/**
 * Bulk save all students (e.g. bulk seeding or multi-operations)
 */
export async function saveAllStudentsToSupabase(studentsList: Student[]): Promise<boolean> {
  try {
    const rows = studentsList.map((s) => ({ id: s.id, data: s }));
    const { error: docError } = await supabase
      .from("buku_induk_students")
      .upsert(rows);

    if (docError) {
      console.warn("Supabase: Bulk doc-style students upsert failed, trying flats row-by-row.");
      for (const s of studentsList) {
        await upsertStudentToSupabase(s);
      }
    }
    return true;
  } catch (err) {
    console.error("Supabase: Exception during bulk students save:", err);
    return false;
  }
}

/**
 * Bulk save all requests (e.g. status changes or multiple actions)
 */
export async function saveAllRequestsToSupabase(requestsList: CorrectionRequest[]): Promise<boolean> {
  try {
    const rows = requestsList.map((r) => ({ id: r.id, data: r }));
    const { error: docError } = await supabase
      .from("buku_induk_requests")
      .upsert(rows);

    if (docError) {
      console.warn("Supabase: Bulk doc-style requests upsert failed, trying flats.");
      for (const r of requestsList) {
        await upsertRequestToSupabase(r);
      }
    }
    return true;
  } catch (err) {
    console.error("Supabase: Exception during bulk requests save:", err);
    return false;
  }
}

/**
 * Delete a student from Supabase kesiswaan
 */
export async function deleteStudentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("buku_induk_students")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase: Delete operation failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase: Exception deleting student:", err);
    return false;
  }
}
