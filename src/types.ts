type Activity = {
  id: string;
  name: string;
  courtIdsToPlay?: string[];
  description?: string;
  startTime?: string;
  participants: Array<{
    id: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string | null;
    skillLevel?: number | null;
  }>;
};

type SlotPlayer = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  skillLevel?: number | null;
  isPlaceholder?: boolean;
};

type Court = {
  id: string;
  name: string;
  slots: SlotPlayer[]; // [A1, A2, B1, B2]
  isDisabled: boolean;
};

type SlotProps = {
  courtId: string;
  slotIndex: number;
  player: SlotPlayer;
  instanceId: symbol;
};

export type { Activity, SlotPlayer, Court, SlotProps };
