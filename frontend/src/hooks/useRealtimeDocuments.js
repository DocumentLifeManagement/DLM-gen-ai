import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * useRealtimeDocuments
 *
 * Subscribes to Postgres NOTIFY events from Supabase Realtime on the
 * `documents` table and calls the provided callbacks whenever a row changes.
 *
 * @param {object} options
 * @param {function} options.onInsert  - called with the new document row
 * @param {function} options.onUpdate  - called with { old, new } document rows
 * @param {function} options.onDelete  - called with the deleted document row
 * @param {boolean}  options.enabled   - subscribe only when true (default: true)
 */
export function useRealtimeDocuments({
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
} = {}) {
  const channelRef = useRef(null);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      console.log("[Realtime] 🔌 Unsubscribing from documents channel");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Only subscribe if we have a valid anon key configured
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!anonKey) {
      console.warn(
        "[Realtime] VITE_SUPABASE_ANON_KEY is not set – realtime disabled."
      );
      return;
    }

    console.log("[Realtime] 📡 Initializing connection to Supabase...");

    const channel = supabase
      .channel("documents-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "documents" },
        (payload) => {
          console.log("[Realtime] ✨ INSERT event received:", payload.new.id);
          if (onInsert) onInsert(payload.new);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "documents" },
        (payload) => {
          console.log("[Realtime] 🔄 UPDATE event received:", payload.new.id, "Status:", payload.new.status);
          if (onUpdate) onUpdate({ old: payload.old, new: payload.new });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "documents" },
        (payload) => {
          console.log("[Realtime] 🗑️ DELETE event received:", payload.old.id);
          if (onDelete) onDelete(payload.old);
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] 🛰️ Subscription Status: ${status}`);
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] ✅ Connected successfully");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Realtime] ❌ Channel error – check Supabase anon key, project URL, and RLS policies. Ensure 'Realtime' is enabled for the 'documents' table.");
        }
      });

    channelRef.current = channel;

    return () => {
      unsubscribe();
    };
  }, [enabled, onInsert, onUpdate, onDelete, unsubscribe]);

  return { unsubscribe };
}
