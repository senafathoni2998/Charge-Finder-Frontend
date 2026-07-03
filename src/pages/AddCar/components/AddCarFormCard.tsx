import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Card, CardContent, Divider, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { ConnectorType } from "../../../models/model";
import { carFormSchema, type CarFormValues } from "../../../forms/schemas";
import { tValidation } from "../../../i18n/validation";
import ConnectorTypePicker from "./ConnectorTypePicker";
import PowerSliderField from "./PowerSliderField";
import AddCarActions from "./AddCarActions";

type AddCarFormCardProps = {
  defaultValues?: Partial<CarFormValues>;
  connectorOptions: ConnectorType[];
  minPower: { min: number; max: number; step: number };
  serverError: string | null;
  onDismissError?: () => void;
  onSubmit: (values: CarFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  submittingLabel?: string;
};

// Shared car form card (AddCar + EditCar). Owns the form via react-hook-form +
// zodResolver; the page provides the submit handler and any server error.
export default function AddCarFormCard({
  defaultValues,
  connectorOptions,
  minPower,
  serverError,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
}: AddCarFormCardProps) {
  const { t } = useTranslation("addCar");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: "",
      connectorTypes: [],
      minKW: 0,
      batteryCapacity: "",
      ...defaultValues,
    },
  });

  const { ref: nameRef, ...nameField } = register("name");
  const { ref: batteryRef, ...batteryField } = register("batteryCapacity");

  const submit = handleSubmit((values) => onSubmit(values));

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      backgroundColor: "rgba(10,10,16,0.02)",
    },
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: "0 18px 50px rgba(10,10,16,0.10)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: 8, background: UI.brandGradStrong }} />
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Box component="form" onSubmit={submit} noValidate>
          <Stack spacing={2}>
            <TextField
              label={t("form.carName.label")}
              inputRef={nameRef}
              {...nameField}
              placeholder={t("form.carName.placeholder")}
              fullWidth
              sx={inputSx}
            />

            <Controller
              name="connectorTypes"
              control={control}
              render={({ field }) => (
                <ConnectorTypePicker
                  options={connectorOptions}
                  selected={new Set(field.value)}
                  onToggle={(connector) =>
                    field.onChange(
                      field.value.includes(connector)
                        ? field.value.filter((c) => c !== connector)
                        : [...field.value, connector],
                    )
                  }
                  error={tValidation(t, errors.connectorTypes?.message) || null}
                />
              )}
            />

            <Controller
              name="minKW"
              control={control}
              render={({ field }) => (
                <PowerSliderField
                  value={field.value}
                  onChange={field.onChange}
                  min={minPower.min}
                  max={minPower.max}
                  step={minPower.step}
                />
              )}
            />

            <TextField
              label={t("form.battery.label")}
              type="number"
              inputRef={batteryRef}
              {...batteryField}
              placeholder={t("form.battery.placeholder")}
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              sx={inputSx}
            />

            {serverError ? (
              <Box sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
                {serverError}
              </Box>
            ) : null}

            <Divider sx={{ borderColor: UI.border2 }} />

            <AddCarActions
              isSubmitting={isSubmitting}
              onCancel={onCancel}
              submitLabel={submitLabel}
              submittingLabel={submittingLabel}
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
