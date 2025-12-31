import { useContext } from "react";
import { ActivityStoreContext } from "./activityContext.tsx";

export function useActivityContext() {
  const ctx = useContext(ActivityStoreContext);
  if (!ctx)
    throw new Error(
      "useActivityContext must be used within ActivityStoreProvider"
    );
  return ctx;
}
