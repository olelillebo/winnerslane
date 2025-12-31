import { createContext, useEffect, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getInstanceId } from "../../Utils";
import { CourtView } from "../CourtView";
import { useActivityContext } from "../../Context/ActivityContext";

import ShuffleButton from "../ShuffleButton";
import ActivitiesMenu from "../ActivitiesMenu";

const InstanceIdContext = createContext<symbol | null>(null);

export function Activity({ activityId }: { activityId: string }) {
  const { activities, swapPlayers, ensureAssignment, assignmentsByActivityId } =
    useActivityContext();

  const activity = activities.find((a) => a.id === activityId);

  useEffect(() => {
    if (activity) ensureAssignment(activity);
  }, [activityId, activity, ensureAssignment]);

  const courts = assignmentsByActivityId[activityId] ?? [];
  const [instanceId] = useState(getInstanceId);

  // swap logic
  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.instanceId === instanceId;
      },
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const fromCourtId = source.data.fromCourtId;
        const fromSlotIndex = source.data.fromSlotIndex;
        const toCourtId = destination.data.courtId;
        const toSlotIndex = destination.data.slotIndex;

        if (typeof fromCourtId !== "string") return;
        if (typeof toCourtId !== "string") return;
        if (typeof fromSlotIndex !== "number") return;
        if (typeof toSlotIndex !== "number") return;

        swapPlayers({
          activityId,
          fromCourtId,
          fromSlotIndex,
          toCourtId,
          toSlotIndex,
        });
      },
    });
  }, [activityId, instanceId, swapPlayers]);
  return (
    <InstanceIdContext.Provider value={instanceId}>
      <div className="flex flex-col">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">
              {activity?.name}
            </h1>
            <div className="text-sm font-light text-slate-300">
              {activity?.startTime &&
                new Date(activity.startTime).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </div>
          </div>
          <div className="flex w-full sm:w-fit justify-end items-end sm:items-center gap-3">
            <ActivitiesMenu />
            <ShuffleButton activityId={activityId} />
          </div>{" "}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
          {courts?.map((court, i) => (
            <CourtView
              key={court.id}
              court={court}
              instanceId={instanceId}
              isTopCourt={i === 0}
            />
          ))}
        </div>
      </div>
    </InstanceIdContext.Provider>
  );
}
export default Activity;
