import { EllipsisVertical } from "@gravity-ui/icons";
import { Dropdown, Button, Label, Description } from "@heroui/react";
import { useActivityContext } from "../../Context/ActivityContext";
import { isActivityResponse } from "../../Utils";
import type { Activity } from "../../types";
import { useState } from "react";

const ActivitiesMenu = () => {
  const [error, setError] = useState<string | null>(null);

  const { setActivitiesFromPaste, clearAll } = useActivityContext();

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

  if (error) {
    console.error("ActivitiesMenu error:", error);
  }
  return (
    <Dropdown>
      <Button
        isIconOnly
        aria-label="More options"
        variant="ghost"
        className="text-white "
      >
        <EllipsisVertical />
      </Button>
      <Dropdown.Popover className="max-w-72.5" placement="bottom end">
        <Dropdown.Menu>
          <Dropdown.Item
            className="flex flex-col items-start gap-1"
            id="repaste-data"
            textValue="Re-Paste Data"
            onPress={handlePaste}
          >
            <Label>Re-Paste Data</Label>
          </Dropdown.Item>
          <Dropdown.Item
            className="flex flex-col items-start gap-1"
            id="clear-all"
            textValue="Clear All"
            onPress={clearAll}
          >
            <Label>Clear All</Label>
            <Description>Clear all data</Description>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default ActivitiesMenu;
