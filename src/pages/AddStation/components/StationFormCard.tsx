import { Controller, useFieldArray, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import { tValidation } from "../../../i18n/validation";
import type { ConnectorType } from "../../../models/model";
import { stationFormSchema, type StationFormValues } from "../../../forms/schemas";
import { createDefaultConnector, createDefaultPhoto } from "../stationFormUtils";
import useStationLocationField from "../hooks/useStationLocationField";
import LocationPickerMap from "./LocationPickerMap";

type StationFormCardProps = {
  defaultValues: StationFormValues;
  connectorOptions: ConnectorType[];
  defaultConnectorType: ConnectorType;
  serverError: string | null;
  onSubmit: (values: StationFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  submittingLabel?: string;
};

const STATUS_OPTIONS: StationFormValues["status"][] = [
  "AVAILABLE",
  "BUSY",
  "OFFLINE",
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "rgba(10,10,16,0.02)",
  },
} as const;

const errorTextSx = { color: "rgba(244,67,54,0.9)", fontSize: 13 };

// Self-contained react-hook-form station form (shared by AddStation + EditStation).
// Owns the form; the page supplies defaultValues + an onSubmit side-effect.
export default function StationFormCard({
  defaultValues,
  connectorOptions,
  defaultConnectorType,
  serverError,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
}: StationFormCardProps) {
  const { t } = useTranslation("addStation");
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StationFormValues>({
    resolver: zodResolver(stationFormSchema),
    defaultValues,
  });

  const connectors = useFieldArray({ control, name: "connectors" });
  const photos = useFieldArray({ control, name: "photos" });

  const lat = watch("lat");
  const lng = watch("lng");
  const location = useStationLocationField(setValue, lat, lng);

  // Routes the register ref to MUI's inputRef (so it lands on the input, not root).
  const textField = (name: Path<StationFormValues>) => {
    const { ref, ...rest } = register(name);
    return { inputRef: ref, ...rest };
  };

  const connectorsErr = errors.connectors as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const connectorsError = connectorsErr?.root?.message ?? connectorsErr?.message;

  const resolvedSubmitLabel = submitLabel ?? t("actions.saveStation");
  const resolvedSubmittingLabel = submittingLabel ?? t("actions.saving");

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
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                {t("sections.basics")}
              </Typography>
              <TextField
                label={t("fields.name")}
                {...textField("name")}
                placeholder={t("fields.namePlaceholder")}
                error={!!errors.name}
                helperText={tValidation(t, errors.name?.message)}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label={t("fields.address")}
                {...textField("address")}
                placeholder={t("fields.addressPlaceholder")}
                error={!!errors.address}
                helperText={tValidation(t, errors.address?.message)}
                fullWidth
                sx={fieldSx}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    label={t("fields.status")}
                    select
                    fullWidth
                    sx={fieldSx}
                    {...field}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {t(`status.${option.toLowerCase()}`, { ns: "common" })}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                {t("sections.location")}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label={t("fields.latitude")}
                  type="number"
                  {...textField("lat")}
                  error={!!errors.lat}
                  helperText={tValidation(t, errors.lat?.message)}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label={t("fields.longitude")}
                  type="number"
                  {...textField("lng")}
                  error={!!errors.lng}
                  helperText={tValidation(t, errors.lng?.message)}
                  fullWidth
                  sx={fieldSx}
                />
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
              >
                <Typography sx={{ color: UI.text3, fontSize: 13 }}>
                  {t("location.hint")}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={location.onRequestLocation}
                  disabled={location.locationLoading}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                  }}
                >
                  {location.locationLoading
                    ? t("location.locating")
                    : t("location.useMyLocation")}
                </Button>
              </Stack>
              {location.addressLookupLoading ? (
                <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                  {t("location.lookingUpAddress")}
                </Typography>
              ) : null}
              {location.locationError ? (
                <Typography sx={errorTextSx}>{location.locationError}</Typography>
              ) : null}
              <LocationPickerMap
                center={location.locationCenter}
                selected={location.selectedPoint}
                onPick={location.onMapPick}
              />
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800, color: UI.text }}>
                  {t("sections.connectors")}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    connectors.append(createDefaultConnector(defaultConnectorType))
                  }
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                  }}
                >
                  {t("connectors.add")}
                </Button>
              </Stack>

              <Stack spacing={2}>
                {connectors.fields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: `1px solid ${UI.border2}`,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          sx={{ fontWeight: 700, color: UI.text2, fontSize: 14 }}
                        >
                          {t("connectors.item", { number: index + 1 })}
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        {connectors.fields.length > 1 ? (
                          <IconButton
                            size="small"
                            onClick={() => connectors.remove(index)}
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${UI.border2}`,
                            }}
                            aria-label={t("connectors.remove")}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Controller
                          name={`connectors.${index}.type`}
                          control={control}
                          render={({ field: typeField }) => (
                            <TextField
                              label={t("fields.type")}
                              select
                              fullWidth
                              sx={fieldSx}
                              {...typeField}
                            >
                              {connectorOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                        <TextField
                          label={t("fields.powerKw")}
                          type="number"
                          {...textField(`connectors.${index}.powerKW`)}
                          fullWidth
                          sx={fieldSx}
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          label={t("fields.ports")}
                          type="number"
                          {...textField(`connectors.${index}.ports`)}
                          fullWidth
                          sx={fieldSx}
                        />
                        <TextField
                          label={t("fields.availablePorts")}
                          type="number"
                          {...textField(`connectors.${index}.availablePorts`)}
                          fullWidth
                          sx={fieldSx}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
              {connectorsError ? (
                <Typography sx={errorTextSx}>
                  {tValidation(t, connectorsError)}
                </Typography>
              ) : null}
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                {t("sections.pricing")}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label={t("fields.currency")}
                  {...textField("pricing.currency")}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label={t("fields.perKwh")}
                  type="number"
                  {...textField("pricing.perKwh")}
                  error={!!errors.pricing?.perKwh}
                  helperText={tValidation(t, errors.pricing?.perKwh?.message)}
                  fullWidth
                  sx={fieldSx}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label={t("fields.perMinute")}
                  type="number"
                  {...textField("pricing.perMinute")}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label={t("fields.parkingFee")}
                  {...textField("pricing.parkingFee")}
                  fullWidth
                  sx={fieldSx}
                />
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                {t("sections.amenities")}
              </Typography>
              <TextField
                label={t("fields.amenities")}
                {...textField("amenities")}
                helperText={t("fields.amenitiesHelper")}
                fullWidth
                sx={fieldSx}
              />
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800, color: UI.text }}>
                  {t("sections.photos")}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => photos.append(createDefaultPhoto())}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                  }}
                >
                  {t("photos.add")}
                </Button>
              </Stack>
              <Stack spacing={2}>
                {photos.fields.length ? (
                  photos.fields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: `1px solid ${UI.border2}`,
                        backgroundColor: "rgba(10,10,16,0.02)",
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            sx={{ fontWeight: 700, color: UI.text2, fontSize: 14 }}
                          >
                            {t("photos.item")}
                          </Typography>
                          <Box sx={{ flex: 1 }} />
                          <IconButton
                            size="small"
                            onClick={() => photos.remove(index)}
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${UI.border2}`,
                            }}
                            aria-label={t("photos.remove")}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                          <TextField
                            label={t("fields.photoLabel")}
                            {...textField(`photos.${index}.label`)}
                            fullWidth
                            sx={fieldSx}
                          />
                          <TextField
                            label={t("fields.photoGradient")}
                            {...textField(`photos.${index}.gradient`)}
                            placeholder={t("fields.photoGradientPlaceholder")}
                            fullWidth
                            sx={fieldSx}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                    {t("photos.empty")}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                {t("sections.notes")}
              </Typography>
              <TextField
                label={t("fields.notes")}
                {...textField("notes")}
                multiline
                minRows={3}
                fullWidth
                sx={fieldSx}
              />
            </Stack>

            {serverError ? (
              <Typography sx={errorTextSx}>{serverError}</Typography>
            ) : null}

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                  backgroundColor: "rgba(10,10,16,0.01)",
                }}
              >
                {t("actions.cancel", { ns: "common" })}
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  background: UI.brandGrad,
                  boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
                }}
              >
                {isSubmitting ? resolvedSubmittingLabel : resolvedSubmitLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
