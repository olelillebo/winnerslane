import type { SlotPlayer } from "../../types";

const DraggablePlayerPreview = ({
  player,
  slotIndex,
}: {
  player: SlotPlayer;
  slotIndex: number;
}) => {
  return (
    <div
      className={[
        slotIndex > 1 ? "flex-row-reverse pl-5" : "pr-5",
        "flex items-center gap-3 rounded-full backdrop-blur-2xl bg-white/30",
      ].join(" ")}
    >
      {player.avatarUrl && !player.isPlaceholder ? (
        <img
          src={player.avatarUrl}
          alt=""
          draggable={false}
          className={[
            "pointer-events-none object-cover shadow-sm border-2 rounded-full size-11 lg:size-13",
            "border-slate-200",
          ].join(" ")}
        />
      ) : null}

      <div className="min-w-0 flex flex-col gap-0">
        <div
          className={[
            slotIndex > 1 ? "text-end" : "",
            "truncate text-sm lg:text-base font-light text-white",
          ].join(" ")}
        >
          {player.firstName}
        </div>
        <div
          className={[
            slotIndex > 1 ? "text-end" : "",
            "truncate text-base lg:text-lg font-semibold text-white",
          ].join(" ")}
        >
          {player.lastName}
        </div>
      </div>
    </div>
  );
};

export default DraggablePlayerPreview;
