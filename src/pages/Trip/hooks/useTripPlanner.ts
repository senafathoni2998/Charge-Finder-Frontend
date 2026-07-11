import { useCallback, useEffect, useRef, useState } from "react";
import {
  planTrip,
  saveTrip,
  fetchMyTrips,
  deleteTrip,
  type PlanInput,
  type TripPlan,
  type SavedTrip,
} from "../../../api/trips";

/**
 * Owns the async side of the trip planner: computing a plan, saving it, and the
 * user's saved-trips list (load/delete). Form state stays in the page.
 */
export function useTripPlanner() {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadSaved = useCallback(async () => {
    setSavedLoading(true);
    const res = await fetchMyTrips();
    if (!mountedRef.current) return;
    setSavedLoading(false);
    if (res.ok) setSavedTrips(res.trips);
  }, []);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const runPlan = useCallback(async (input: PlanInput) => {
    setPlanning(true);
    setPlanError(null);
    setSaveError(null);
    setSaved(false);
    const res = await planTrip(input);
    if (!mountedRef.current) return;
    setPlanning(false);
    if (!res.ok) {
      setPlan(null);
      setPlanError(res.error ?? null);
      return;
    }
    setPlan(res.plan);
  }, []);

  const save = useCallback(
    async (input: PlanInput & { name?: string }): Promise<boolean> => {
      setSaving(true);
      setSaveError(null);
      setSaved(false);
      const res = await saveTrip(input);
      if (!mountedRef.current) return res.ok;
      setSaving(false);
      if (!res.ok) {
        setSaveError(res.error ?? null);
        return false;
      }
      if (res.plan) setPlan(res.plan);
      if (res.trip) setSavedTrips((prev) => [res.trip as SavedTrip, ...prev]);
      setSaved(true);
      return true;
    },
    []
  );

  const remove = useCallback(async (tripId: string) => {
    const res = await deleteTrip(tripId);
    if (res.ok && mountedRef.current) {
      setSavedTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    }
  }, []);

  return {
    plan,
    planning,
    planError,
    savedTrips,
    savedLoading,
    saving,
    saveError,
    saved,
    runPlan,
    save,
    remove,
  };
}
