import { useState } from "react";
import type { Activity } from "../../types";
import { isActivityResponse } from "../../Utils";
import { useActivityContext } from "../../Context/ActivityContext";
import { Button } from "@heroui/react";

export function PasteData() {
  const [error, setError] = useState<string | null>(null);
  const { setActivitiesFromPaste } = useActivityContext();

  async function handlePaste() {
    setError(null);

    try {
      if (!navigator.clipboard?.readText) {
        throw new Error("Clipboard API not available in this browser/context.");
      }

      const text = await navigator.clipboard.readText();

      // Optional: tolerate leading/trailing whitespace
      const parsed = JSON.parse(text.trim()) as { data: Activity[] };
      if (!isActivityResponse(parsed)) {
        throw new Error("Clipboard data is not a valid activities response.");
      }

      const activitiesWithPlayers = parsed?.data
        ?.filter(
          (game) =>
            game?.participants?.length > 0 &&
            game?.description?.includes("vinnarbana")
        )
        ?.map((game) => ({
          id: game.id,
          description: game.description,
          courtIdsToPlay: game.courtIdsToPlay,
          name: game.name,
          startTime: game.startTime,
          participants: game.participants.map((p) => ({
            id: p.id,
            firstName: p.firstName,
            lastName: p.lastName,
            displayName: p.displayName,
            profileImage: p.profileImage,
            skillLevel: p.skillLevel,
          })),
        })) as Activity[];

      setActivitiesFromPaste(activitiesWithPlayers);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message ?? "Failed to paste/parse clipboard JSON.");
      } else {
        setError(String(e) || "Failed to paste/parse clipboard JSON.");
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="ghost" className="bg-white" onPress={handlePaste}>
        Paste Data
      </Button>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}
