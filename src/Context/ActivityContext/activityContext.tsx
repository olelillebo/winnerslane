import React, { createContext, useMemo, useState } from "react";
import type { Activity, Court } from "../../types";
import {
  buildCourtsFromPlayers,
  shuffle,
  skillOrder,
  stableReconcileCourtsWithActivity,
  toSlots,
} from "../../Utils";

type StoreState = {
  activities: Activity[];
  assignmentsByActivityId: Record<string, Court[]>;
};

type StoreActions = {
  setActivitiesFromPaste: (activities: Activity[]) => void;

  // ensures assignment exists (randomize if missing)
  ensureAssignment: (activity: Activity) => void;

  // reshuffle the assignment for an activity
  reshuffle: (activity: Activity, seedBySkill?: boolean) => void;

  // swap players across courts/slots (called from PlayerItem)
  swapPlayers: (args: {
    activityId: string;
    fromCourtId: string;
    fromSlotIndex: number;
    toCourtId: string;
    toSlotIndex: number;
  }) => void;

  clearAll: () => void;
};

const ActivityStoreContext = createContext<(StoreState & StoreActions) | null>(
  null
);

const STORAGE_KEY = "padel:store:v1";

function loadStore(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { activities: [], assignmentsByActivityId: {} };
    const parsed = JSON.parse(raw);
    return {
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      assignmentsByActivityId:
        parsed.assignmentsByActivityId &&
        typeof parsed.assignmentsByActivityId === "object"
          ? parsed.assignmentsByActivityId
          : {},
    };
  } catch {
    return { activities: [], assignmentsByActivityId: {} };
  }
}

function persistStore(next: StoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function ActivityStoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreState>(() => loadStore());

  // helper: single write-through setter
  const setAndPersist = (updater: (prev: StoreState) => StoreState) => {
    setStore((prev) => {
      const next = updater(prev);
      persistStore(next);
      return next;
    });
  };

  // ---- actions (fill in with your existing shuffle/build logic) ----

  const actions: StoreActions = useMemo(
    () => ({
      setActivitiesFromPaste(activities) {
        setAndPersist((prev) => {
          const nextAssignments = { ...prev.assignmentsByActivityId };

          for (const activity of activities) {
            const existing = nextAssignments[activity.id];
            if (!existing) continue;

            nextAssignments[activity.id] = stableReconcileCourtsWithActivity(
              existing,
              activity
            );
          }

          return {
            ...prev,
            activities,
            assignmentsByActivityId: nextAssignments,
          };
        });
      },

      ensureAssignment(activity) {
        setAndPersist((prev) => {
          if (prev.assignmentsByActivityId[activity.id]) return prev;

          const courtIds = activity?.courtIdsToPlay;
          const courts = buildCourtsFromPlayers(
            shuffle(toSlots(activity)),
            courtIds
          );

          return {
            ...prev,
            assignmentsByActivityId: {
              ...prev.assignmentsByActivityId,
              [activity.id]: courts,
            },
          };
        });
      },

      reshuffle(activity, seedBySkill = false) {
        setAndPersist((prev) => {
          const courtIds = activity?.courtIdsToPlay;
          // IMPORTANT: shuffle real players only
          const realPlayers = toSlots(activity).filter((p) => !p.isPlaceholder);

          const orderedPlayers = seedBySkill
            ? skillOrder(realPlayers, 0.3)
            : shuffle(realPlayers);

          const courts = buildCourtsFromPlayers(orderedPlayers, courtIds);

          return {
            ...prev,
            assignmentsByActivityId: {
              ...prev.assignmentsByActivityId,
              [activity.id]: courts,
            },
          };
        });
      },

      swapPlayers({
        activityId,
        fromCourtId,
        fromSlotIndex,
        toCourtId,
        toSlotIndex,
      }) {
        setAndPersist((prev) => {
          const current = prev.assignmentsByActivityId[activityId];
          if (!current) return prev;

          // IMPORTANT: do immutable copies so React updates correctly
          const nextCourts = current.map((c) => ({
            ...c,
            slots: [...c.slots],
          }));

          const fromCourt = nextCourts.find((c) => c.id === fromCourtId);
          const toCourt = nextCourts.find((c) => c.id === toCourtId);
          if (!fromCourt || !toCourt) return prev;

          const a = fromCourt.slots[fromSlotIndex];
          const b = toCourt.slots[toSlotIndex];
          fromCourt.slots[fromSlotIndex] = b;
          toCourt.slots[toSlotIndex] = a;

          return {
            ...prev,
            assignmentsByActivityId: {
              ...prev.assignmentsByActivityId,
              [activityId]: nextCourts,
            },
          };
        });
      },

      clearAll() {
        localStorage.removeItem(STORAGE_KEY);
        setStore({ activities: [], assignmentsByActivityId: {} });
      },
    }),
    []
  );

  const value = useMemo(() => ({ ...store, ...actions }), [store, actions]);

  return (
    <ActivityStoreContext.Provider value={value}>
      {children}
    </ActivityStoreContext.Provider>
  );
}

export { ActivityStoreProvider, ActivityStoreContext };
