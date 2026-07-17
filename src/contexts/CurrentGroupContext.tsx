"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/src/hooks/useAuth";
import {
  getCurrentGroup,
  switchCurrentGroup as switchCurrentGroupService,
  type CurrentGroup,
} from "@/src/services/groups/group.service";

export type CurrentGroupContextValue = {
  currentGroup: CurrentGroup | null;
  /** Bumps when current_group_id changes so pages can refetch. */
  revision: number;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Refresh current group and bump revision (Home / Restaurant / Diary). */
  syncAfterGroupChange: () => Promise<void>;
  switchGroup: (groupId: string) => Promise<{ ok: boolean }>;
};

export const CurrentGroupContext =
  createContext<CurrentGroupContextValue | null>(null);

type CurrentGroupProviderProps = {
  children: ReactNode;
};

export function CurrentGroupProvider({ children }: CurrentGroupProviderProps) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [currentGroup, setCurrentGroup] = useState<CurrentGroup | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCurrentGroup(null);
      setLoading(false);
      return;
    }

    const { data } = await getCurrentGroup();
    setCurrentGroup(data);
    setLoading(false);
  }, [user]);

  const syncAfterGroupChange = useCallback(async () => {
    if (!user) {
      setCurrentGroup(null);
      setLoading(false);
      setRevision((value) => value + 1);
      return;
    }

    const { data } = await getCurrentGroup();
    setCurrentGroup(data);
    setLoading(false);
    setRevision((value) => value + 1);
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    setLoading(true);
    void refresh();
  }, [authLoading, pathname, refresh]);

  const switchGroup = useCallback(
    async (groupId: string): Promise<{ ok: boolean }> => {
      const nextId = groupId.trim();
      if (!nextId) {
        return { ok: false };
      }

      if (currentGroup?.id === nextId) {
        return { ok: true };
      }

      try {
        const { data, error } = await switchCurrentGroupService(nextId);

        if (error || !data) {
          return { ok: false };
        }

        setCurrentGroup(data);
        setRevision((value) => value + 1);
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    [currentGroup?.id],
  );

  const value = useMemo<CurrentGroupContextValue>(
    () => ({
      currentGroup,
      revision,
      loading: authLoading || loading,
      refresh,
      syncAfterGroupChange,
      switchGroup,
    }),
    [
      authLoading,
      currentGroup,
      loading,
      refresh,
      syncAfterGroupChange,
      revision,
      switchGroup,
    ],
  );

  return (
    <CurrentGroupContext.Provider value={value}>
      {children}
    </CurrentGroupContext.Provider>
  );
}
