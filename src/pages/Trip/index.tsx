import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../theme/theme";
import { useAppSelector } from "../../app/hooks";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import { reverseGeocode } from "../../api/geocode";
import { normalizeStop, type PlanInput, type SavedTrip } from "../../api/trips";
import type { ConnectorType } from "../../models/model";
import { useTripPlanner } from "./hooks/useTripPlanner";
import TripForm, { type PickMode, type TripFormState } from "./components/TripForm";
import TripMap, { type MapStop } from "./components/TripMap";
import TripPlanResult from "./components/TripPlanResult";
import SavedTripsList from "./components/SavedTripsList";

const EMPTY_FORM: TripFormState = {
  origin: null,
  destination: null,
  vehicleId: "",
  rangeKm: "",
  startBatteryPercent: "",
  bufferPercent: "",
  chargeToPercent: "",
  minPowerKW: "",
  maxDetourKm: "",
  efficiencyKwhPer100Km: "",
  connectorTypes: [],
};

const asNumber = (raw: string): number | undefined => {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
};

// Wraps a section in the standard card used across the app.
function TripCard({ children }: { children: ReactNode }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: UI.border2,
        backgroundColor: UI.surface,
        boxShadow: "0 10px 22px rgba(10,10,16,0.06)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</CardContent>
    </Card>
  );
}

export default function TripPlannerPage() {
  const { t } = useTranslation("trip");
  const cars = useAppSelector((state) => state.auth.cars);
  const geo = useGeoLocation();

  const {
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
  } = useTripPlanner();

  const [form, setForm] = useState<TripFormState>(EMPTY_FORM);
  const [pickMode, setPickMode] = useState<PickMode>("origin");
  const [formError, setFormError] = useState<string | null>(null);

  const patch = (p: Partial<TripFormState>) => setForm((f) => ({ ...f, ...p }));

  // Best-effort reverse geocode → attach a human label, but only if the point is
  // still the one we resolved (the user may have moved it in the meantime).
  const labelPoint = async (key: "origin" | "destination", lat: number, lng: number) => {
    const res = await reverseGeocode(lat, lng);
    if (!res.ok || !res.address) return;
    setForm((f) => {
      const point = f[key];
      if (point && point.lat === lat && point.lng === lng) {
        return { ...f, [key]: { ...point, label: res.address ?? undefined } };
      }
      return f;
    });
  };

  const handleMapClick = (lat: number, lng: number) => {
    const point = { lat, lng };
    if (pickMode === "origin") {
      patch({ origin: point });
      setPickMode("destination"); // convenience: origin then destination
    } else {
      patch({ destination: point });
    }
    void labelPoint(pickMode, lat, lng);
  };

  // Geolocation → origin. Only apply when a request the user initiated resolves.
  const geoPendingRef = useRef(false);
  const onUseMyLocation = () => {
    setFormError(null);
    geoPendingRef.current = true;
    geo.request();
  };
  useEffect(() => {
    if (geoPendingRef.current && geo.loc) {
      geoPendingRef.current = false;
      const { lat, lng } = geo.loc;
      patch({ origin: { lat, lng } });
      void labelPoint("origin", lat, lng);
    }
  }, [geo.loc]);
  useEffect(() => {
    if (geo.error) setFormError(geo.error);
  }, [geo.error]);

  const buildInput = (): PlanInput | null => {
    if (!form.origin || !form.destination) {
      setFormError(t("errors.pointsRequired"));
      return null;
    }
    if (!form.vehicleId && asNumber(form.rangeKm) === undefined) {
      setFormError(t("errors.rangeRequired"));
      return null;
    }
    setFormError(null);
    const input: PlanInput = { origin: form.origin, destination: form.destination };
    if (form.vehicleId) input.vehicleId = form.vehicleId;
    input.rangeKm = asNumber(form.rangeKm);
    input.startBatteryPercent = asNumber(form.startBatteryPercent);
    input.bufferPercent = asNumber(form.bufferPercent);
    input.chargeToPercent = asNumber(form.chargeToPercent);
    input.minPowerKW = asNumber(form.minPowerKW);
    input.maxDetourKm = asNumber(form.maxDetourKm);
    input.efficiencyKwhPer100Km = asNumber(form.efficiencyKwhPer100Km);
    if (form.connectorTypes.length > 0) input.connectorTypes = form.connectorTypes;
    return input;
  };

  const handlePlan = () => {
    const input = buildInput();
    if (input) void runPlan(input);
  };

  const handleSave = (name: string) => {
    const input = buildInput();
    if (input) void save({ ...input, name });
  };

  const handleLoad = (trip: SavedTrip) => {
    setForm({
      origin: trip.origin,
      destination: trip.destination,
      vehicleId: trip.vehicle ?? "",
      rangeKm:
        typeof trip.fullRangeKm === "number"
          ? String(Math.round(trip.fullRangeKm))
          : "",
      startBatteryPercent:
        trip.startBatteryPercent != null ? String(trip.startBatteryPercent) : "",
      bufferPercent: trip.bufferPercent != null ? String(trip.bufferPercent) : "",
      chargeToPercent:
        trip.chargeToPercent != null ? String(trip.chargeToPercent) : "",
      minPowerKW: trip.minPowerKW != null ? String(trip.minPowerKW) : "",
      maxDetourKm: trip.maxDetourKm != null ? String(trip.maxDetourKm) : "",
      efficiencyKwhPer100Km: "",
      connectorTypes: (trip.allowedConnectorTypes ?? []).filter((c): c is ConnectorType =>
        c === "CCS2" || c === "Type2" || c === "CHAdeMO"
      ),
    });
    setFormError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const mapStops: MapStop[] = useMemo(() => {
    if (!plan || !Array.isArray(plan.stops)) return [];
    return plan.stops
      .map(normalizeStop)
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({
        lat: s.lat as number,
        lng: s.lng as number,
        label: s.name ?? t("result.unnamedStation"),
      }));
  }, [plan, t]);

  return (
    <Box sx={{ minHeight: "calc(100dvh - 64px)", backgroundColor: UI.bg }}>
      <Box
        sx={{
          maxWidth: 1120,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 3.5 },
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontWeight: 950, fontSize: 26, color: UI.text }}>
              {t("header.title")}
            </Typography>
            <Typography sx={{ color: UI.text2 }}>{t("header.subtitle")}</Typography>
          </Box>

          <TripMap
            origin={form.origin}
            destination={form.destination}
            stops={mapStops}
            onMapClick={handleMapClick}
          />

          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              alignItems: "start",
            }}
          >
            <TripCard>
              <TripForm
                value={form}
                onChange={patch}
                cars={cars}
                pickMode={pickMode}
                onPickModeChange={setPickMode}
                onUseMyLocation={onUseMyLocation}
                locating={geo.loading}
                onPlan={handlePlan}
                planning={planning}
                error={formError ?? planError}
              />
            </TripCard>

            <Stack spacing={2.5}>
              <TripCard>
                {plan ? (
                  <TripPlanResult
                    plan={plan}
                    onSave={handleSave}
                    saving={saving}
                    saveError={saveError}
                    saved={saved}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: UI.text2 }}>
                    {t("result.placeholder")}
                  </Typography>
                )}
              </TripCard>

              <TripCard>
                <Stack spacing={1.5}>
                  <Typography sx={{ fontWeight: 800, color: UI.text }}>
                    {t("saved.title")}
                  </Typography>
                  <SavedTripsList
                    trips={savedTrips}
                    loading={savedLoading}
                    onLoad={handleLoad}
                    onDelete={remove}
                  />
                </Stack>
              </TripCard>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
