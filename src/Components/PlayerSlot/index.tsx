import invariant from "tiny-invariant";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";

import { memo, useRef, useState, useEffect } from "react";
import type { SlotProps } from "../../types";
import { createRoot } from "react-dom/client";
import DraggablePlayerPreview from "../DraggablePlayerPreview";

export const PlayerSlot = memo(function Slot({
  courtId,
  slotIndex,
  player,
  instanceId,
}: SlotProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({
          type: "player",
          instanceId,
          playerId: player.id,
          fromCourtId: courtId,
          fromSlotIndex: slotIndex,
        }),
        onDragStart: () => setIsDragging(true),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: ({ container }) => {
              const rect = container.getBoundingClientRect();
              return { x: rect.width / 2, y: 16 };
            },
            render({ container }) {
              const root = createRoot(container);
              root.render(
                <DraggablePlayerPreview player={player} slotIndex={slotIndex} />
              );

              // 2. Return cleanup
              return () => {
                root.unmount();
              };
            },
          });
        },
        onDrop: () => setIsDragging(false),
      }),

      dropTargetForElements({
        element: el,
        getIsSticky: () => true,
        getData: () => ({
          type: "slot",
          courtId,
          slotIndex,
          playerId: player.id,
        }),
        canDrop: ({ source }) =>
          source.data.instanceId === instanceId &&
          source.data.type === "player" &&
          !(
            source.data.fromCourtId === courtId &&
            source.data.fromSlotIndex === slotIndex
          ),
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: () => setIsOver(false),
      })
    );
  }, [courtId, slotIndex, player.id, instanceId, player]);

  return (
    <div
      ref={ref}
      className={[
        "select-none  p-1 transition",
        "cursor-grab active:cursor-grabbing border-2 ",
        isDragging ? "opacity-40" : "opacity-100",
        isOver
          ? " border-white/60 border-dashed rounded-full "
          : "border-transparent",
        player.isPlaceholder ? "" : "",
      ].join(" ")}
    >
      <div
        className={[
          slotIndex > 1 ? "flex-row-reverse" : "",
          "flex items-center gap-3 rounded-full",
        ].join(" ")}
      >
        {player.avatarUrl && !player.isPlaceholder ? (
          <div className="relative">
            <img
              src={player.avatarUrl}
              alt=""
              draggable={false}
              className={[
                "pointer-events-none object-cover shadow-sm border-2 rounded-full size-11 lg:size-13 col-start-1 row-start-1",
                isOver ? "scale-[1.02] border-white" : "border-slate-200",
              ].join(" ")}
            />
            <span className="absolute -bottom-1 -right-1 text-[11px] bg-white rounded-sm shadow-sm py-0.5 px-1 font-semibold leading-3.5">
              {player.skillLevel?.toFixed(1) ?? "-"}
            </span>
          </div>
        ) : (
          <div className="size-11 lg:size-13 rounded-full bg-white/30 border-white/60 border-2 flex items-center justify-center font-bold text-2xl text-white">
            ?
          </div>
        )}

        <div className="min-w-0 flex flex-col gap-0 ">
          <div
            className={[
              slotIndex > 1 ? "text-end" : "",
              "truncate text-sm lg:text-base font-light text-white ",
            ].join(" ")}
          >
            {player.firstName
              ? player.firstName.charAt(0).toUpperCase() +
                player.firstName.slice(1)
              : ""}
          </div>
          <div
            className={[
              slotIndex > 1 ? "text-end" : "",
              "truncate text-base lg:text-lg font-semibold text-white -mt-0.5",
            ].join(" ")}
          >
            {player.lastName
              ? player.lastName.charAt(0).toUpperCase() +
                player.lastName.slice(1)
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
});
