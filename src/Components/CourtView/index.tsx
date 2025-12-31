import type { Court } from "../../types";
import { PlayerSlot } from "../PlayerSlot";

export function CourtView({
  court,
  instanceId,
  isTopCourt,
}: {
  court: Court;
  instanceId: symbol;
  isTopCourt: boolean;
}) {
  const [a1, a2, b1, b2] = court.slots;

  return (
    <div className="flex flex-col ">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xl font-semibold text-white">{court.name}</div>
      </div>
      {/* bg-[#40c281] */}
      <div
        className={[
          isTopCourt ? "border-[#D4AF37] border-2" : "border-transparent",
          "grid grid-cols-1 grid-rows-1 aspect-2/1 shadow-md bg-[#0057B8] rounded-lg  origin-center relative",
        ].join(" ")}
      >
        {isTopCourt ? (
          <div className="absolute -top-2 right-2 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-semibold text-black shadow-md">
            Winners lane
          </div>
        ) : null}
        <div className="grid grid-cols-[1fr_8px_1fr] col-start-1 row-start-1">
          <div className="flex">
            <div className="w-3/6 border-r-2 border-white/5" />
            <div className="w-7/6 grid grid-rows-2">
              <div className="border-b-2 border-white/5" />
              <div />
            </div>
          </div>

          <div className="relative h-full">
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.25)]" />
            <div className="absolute left-1/2 top-0 h-2 w-0.75 -translate-x-1/2 rounded-b bg-white" />
            <div className="absolute left-1/2 bottom-0 h-2 w-0.75 -translate-x-1/2 rounded-t bg-white" />
          </div>
          <div className="flex">
            <div className="w-7/6 grid grid-rows-2">
              <div className="border-b-2 border-white/5" />
              <div />
            </div>
            <div className="w-3/6 border-l-2 border-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-2   col-start-1 row-start-1  p-3 lg:px-5 ">
          <div className="flex h-full flex-col justify-around  pr-3">
            <PlayerSlot
              courtId={court.id}
              slotIndex={0}
              player={a1}
              instanceId={instanceId}
            />
            <PlayerSlot
              courtId={court.id}
              slotIndex={1}
              player={a2}
              instanceId={instanceId}
            />
          </div>

          <div className="flex h-full flex-col justify-around pl-3">
            <PlayerSlot
              courtId={court.id}
              slotIndex={2}
              player={b1}
              instanceId={instanceId}
            />
            <PlayerSlot
              courtId={court.id}
              slotIndex={3}
              player={b2}
              instanceId={instanceId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
