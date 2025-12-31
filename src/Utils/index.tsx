import { padelCourts } from "../courts";
import type { Activity, SlotPlayer, Court } from "../types";

function getInstanceId() {
  return Symbol("instance-id");
}

function shuffle<T>(arr: T[], rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function skillOrder(arr: SlotPlayer[], noise: number = 0.3): SlotPlayer[] {
  const scored = arr.map((p) => ({
    p,
    score: (p.skillLevel ?? 0) + (Math.random() * 2 - 1) * noise,
  }));
  scored.sort((a, b) => b.score - a.score);

  const seededPlayers = scored.map((s) => s.p).reverse(); // weak first, strong last
  return seededPlayers;
}

function toSlots(activity: Activity): SlotPlayer[] {
  return activity.participants.map((p) => {
    return {
      id: p.id,
      name: p.displayName,
      firstName: p.firstName,
      lastName: p.lastName,
      avatarUrl: p.profileImage ?? null,
      skillLevel: p.skillLevel ?? null,
      isPlaceholder: false,
    };
  });
}

function placeholderName(index: number) {
  // Player X, Player Y, Player Z, Player AA, ...
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let n = index;
  let out = "";
  while (n >= 0) {
    out = letters[n % 26] + out;
    n = Math.floor(n / 26) - 1;
  }
  return `Player ${out}`;
}

function buildCourtsFromPlayers(
  players: SlotPlayer[],
  courtIds?: string[]
): Court[] {
  const courtsWithData = padelCourts
    .filter((court) => courtIds?.includes(court.id))
    ?.sort((a, b) => {
      //reverse sort by court name
      return b.name.localeCompare(a.name);
    });

  const courtCount = Math.max(1, Math.ceil(players.length / 4));
  const totalSlots = (courtIds?.length ?? courtCount) * 4;

  const padded: SlotPlayer[] = [...players];
  const missing = totalSlots - padded.length;

  for (let i = 0; i < missing; i++) {
    padded.push({
      id: `placeholder-${i + 1}`,
      name: placeholderName(23 + i), // start at X-ish for vibes
      isPlaceholder: true,
    });
  }
  const courts: Court[] = [];
  for (let c = 0; c < (courtsWithData?.length ?? courtCount); c++) {
    const start = c * 4;
    const court = courtsWithData[c];
    const players = padded.slice(start, start + 4);
    const isDisabled = players.every((p) => p.isPlaceholder);
    courts.push({
      id: courtIds?.[c] ?? `court-${c + 1}`,
      name: court ? court.name : `Court ${c + 1}`,
      slots: players,
      isDisabled: isDisabled,
    });
  }
  return courts;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isActivity(value: unknown): value is Activity {
  if (!isObject(value)) return false;

  if (typeof value.id !== "string") return false;
  if (!Array.isArray(value.participants)) return false;
  if (typeof value.description !== "string") return false;

  return true;
}
function isActivityResponse(value: unknown): value is { data: Activity[] } {
  if (!isObject(value)) return false;
  if (!Array.isArray(value.data)) return false;
  return value.data.every(isActivity);
}

const STORAGE_KEY = "padel:activities:v1";

function loadCachedActivities(): Activity[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // optionally validate shape here (your guard)
    return Array.isArray(parsed) ? (parsed as Activity[]) : null;
  } catch {
    return null;
  }
}

function saveCachedActivities(activities: Activity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function stableReconcileCourtsWithActivity(
  existingCourts: Court[],
  activity: Activity
): Court[] {
  const courtIds = activity.courtIdsToPlay;

  // Ensure we have a court object for each courtId (keep existing where possible)
  const desiredCourts: Court[] = courtIds?.length
    ? courtIds.map((id) => {
        const found = existingCourts.find((c) => c.id === id);
        if (found) return found;

        // Create a placeholder-only court if it's new
        return buildCourtsFromPlayers([], [id])[0];
      })
    : existingCourts;

  // Clone immutably
  const nextCourts: Court[] = desiredCourts.map((c) => ({
    ...c,
    slots: c.slots.map((s) => ({ ...s })),
  }));

  // Valid players according to the NEW activity payload
  const incoming = toSlots(activity).filter((p) => !p.isPlaceholder);
  const validIds = new Set(incoming.map((p) => p.id));

  // Placeholder factory (keeps your placeholder vibe consistent)
  let placeholderCounter = 1;
  const makePlaceholder = () => ({
    id: `placeholder-removed-${placeholderCounter++}`,
    name: placeholderName(200 + placeholderCounter),
    isPlaceholder: true as const,
  });

  // 1) Remove players no longer in the activity (turn into placeholders)
  for (const court of nextCourts) {
    for (let s = 0; s < court.slots.length; s++) {
      const player = court.slots[s];
      if (!player) continue;

      if (!player.isPlaceholder && !validIds.has(player.id)) {
        court.slots[s] = makePlaceholder();
      }
    }
  }

  // 2) Recompute placed after removals
  const placedIds = new Set(
    nextCourts
      .flatMap((c) => c.slots)
      .filter((p) => !p.isPlaceholder)
      .map((p) => p.id)
  );

  // 3) New players are valid players not currently placed
  const newPlayers = incoming.filter((p) => !placedIds.has(p.id));

  // 4) Fill placeholders in order
  let i = 0;
  for (const court of nextCourts) {
    for (let s = 0; s < court.slots.length; s++) {
      if (i >= newPlayers.length) break;
      if (court.slots[s]?.isPlaceholder) {
        court.slots[s] = newPlayers[i];
        i++;
      }
    }
  }

  // 5) Update isDisabled
  for (const court of nextCourts) {
    court.isDisabled = court.slots.every((p) => p.isPlaceholder);
  }

  return nextCourts;
}

export {
  getInstanceId,
  shuffle,
  skillOrder,
  toSlots,
  placeholderName,
  buildCourtsFromPlayers,
  isActivity,
  isActivityResponse,
  loadCachedActivities,
  saveCachedActivities,
  stableReconcileCourtsWithActivity,
};
