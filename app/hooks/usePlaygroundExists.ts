"use client";

import { useEffect, useState, useCallback } from "react";
import { getPlaygroundByOsmId } from "@/app/actions/playground";
import type { Playground } from "@/app/schemas/playground";

export function usePlaygroundExists(osmId?: string | number) {
  const [exists, setExists] = useState<boolean | null>(null);
  const [playground, setPlayground] = useState<Playground | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    if (!osmId) {
      setExists(null);
      setPlayground(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getPlaygroundByOsmId(osmId);
      setExists(result.exists);
      setPlayground(result.playground);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setExists(null);
      setPlayground(null);
    } finally {
      setLoading(false);
    }
  }, [osmId]);

  useEffect(() => {
    check();
  }, [check]);

  // For backward compatibility
  const storedName = playground?.name ?? null;

  return { exists, storedName, playground, loading, error, refetch: check };
}
