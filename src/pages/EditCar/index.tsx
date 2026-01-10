import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";
import { UI } from "../../theme/theme";
import { useAppSelector } from "../../app/hooks";
import type { ConnectorType } from "../../models/model";
import type { EditCarActionData } from "./types";
import { CONNECTOR_OPTIONS, POWER_MAX, POWER_MIN, POWER_STEP } from "../AddCar/constants";
import AddCarHeader from "../AddCar/components/AddCarHeader";
import AddCarFormCard from "../AddCar/components/AddCarFormCard";

export { editCarAction } from "./editCarRoute";

// Edit car page container that wires form state and layout components.
export default function EditCarPage() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData() as EditCarActionData | undefined;
  const { carId } = useParams();
  const email = useAppSelector((state) => state.auth.email) || "";
  const userId = useAppSelector((state) => state.auth.userId) || "";
  const cars = useAppSelector((state) => state.auth.cars);

  const car = useMemo(
    () => (carId ? cars.find((item) => item.id === carId) ?? null : null),
    [cars, carId]
  );

  const [carName, setCarName] = useState("");
  const [carConnectors, setCarConnectors] = useState<Set<ConnectorType>>(
    new Set()
  );
  const [carMinKW, setCarMinKW] = useState(0);
  const [carError, setCarError] = useState<string | null>(null);

  useEffect(() => {
    if (!car) return;
    setCarName(car.name || "");
    setCarConnectors(new Set(car.connectorTypes ?? []));
    setCarMinKW(Number.isFinite(car.minKW) ? car.minKW : 0);
  }, [car]);

  // Performs client-side validation before submitting the form.
  const handleSubmit = (event: FormEvent) => {
    if (!carConnectors.size) {
      event.preventDefault();
      setCarError("Select at least one connector type.");
      return;
    }
    if (carError) setCarError(null);
  };

  const handleToggleConnector = (connector: ConnectorType) => {
    setCarError(null);
    setCarConnectors((prev) => {
      const next = new Set(prev);
      if (next.has(connector)) next.delete(connector);
      else next.add(connector);
      return next;
    });
  };

  const submitError = carError || actionData?.error || null;
  const isSubmitting = navigation.state === "submitting";

  const formValues = {
    name: carName,
    connectors: carConnectors,
    minKW: carMinKW,
  };
  const formHandlers = {
    onNameChange: (value: string) => setCarName(value),
    onToggleConnector: handleToggleConnector,
    onMinKWChange: (value: number) => setCarMinKW(value),
  };

  if (!car) {
    return (
      <Box
        sx={{
          minHeight: "calc(100dvh - 64px)",
          backgroundColor: UI.bg,
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 720, mx: "auto" }}>
          <Stack spacing={2.5}>
            <AddCarHeader
              title="Edit car"
              subtitle="Update your connector types to keep station matches accurate."
            />
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                Car not found.
              </Typography>
              <Typography sx={{ color: UI.text2, mt: 0.5 }}>
                Head back to your profile to choose a different car.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/profile")}
                sx={{
                  mt: 1.5,
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                  backgroundColor: "rgba(10,10,16,0.01)",
                }}
              >
                Back to profile
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack spacing={2.5}>
          <AddCarHeader
            title="Edit car"
            subtitle="Update your connector types to keep station matches accurate."
          />
          <AddCarFormCard
            values={formValues}
            handlers={formHandlers}
            connectorOptions={CONNECTOR_OPTIONS}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/profile")}
            userId={userId}
            email={email}
            vehicleId={car.id}
            submitLabel="Update car"
            submittingLabel="Updating..."
            minPower={{ min: POWER_MIN, max: POWER_MAX, step: POWER_STEP }}
          />
        </Stack>
      </Box>
    </Box>
  );
}
