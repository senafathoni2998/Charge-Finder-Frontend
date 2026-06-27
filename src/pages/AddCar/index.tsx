import { useState } from "react";
import { Box, Stack } from "@mui/material";
import { useNavigate } from "react-router";
import { UI } from "../../theme/theme";
import { useAppSelector } from "../../app/hooks";
import type { CarFormValues } from "../../forms/schemas";
import { CONNECTOR_OPTIONS, POWER_MAX, POWER_MIN, POWER_STEP } from "./constants";
import { createCarRequest } from "./addCarRoute";
import AddCarHeader from "./components/AddCarHeader";
import AddCarFormCard from "./components/AddCarFormCard";

// Add car page container. The form state lives in AddCarFormCard
// (react-hook-form); this page owns the submit side-effect and navigation.
export default function AddCarPage() {
  const navigate = useNavigate();
  const email = useAppSelector((state) => state.auth.email) || "";
  const userId = useAppSelector((state) => state.auth.userId) || "";
  const [serverError, setServerError] = useState<string | null>(null);

  // Validated by zodResolver(carFormSchema) before this runs.
  const handleSubmit = async (values: CarFormValues) => {
    setServerError(null);
    const result = await createCarRequest({
      userId,
      email,
      name: values.name,
      connectorTypes: values.connectorTypes,
      minKW: values.minKW,
      batteryCapacity: values.batteryCapacity,
    });
    if (result.ok) {
      navigate("/profile");
    } else {
      setServerError(result.error);
    }
  };

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
          <AddCarHeader />
          <AddCarFormCard
            connectorOptions={CONNECTOR_OPTIONS}
            minPower={{ min: POWER_MIN, max: POWER_MAX, step: POWER_STEP }}
            serverError={serverError}
            onDismissError={() => setServerError(null)}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/profile")}
          />
        </Stack>
      </Box>
    </Box>
  );
}
