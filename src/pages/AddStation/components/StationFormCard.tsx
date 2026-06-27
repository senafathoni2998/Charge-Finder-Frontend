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
import { UI } from "../../../theme/theme";
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
  submitLabel = "Save station",
  submittingLabel = "Saving...",
}: StationFormCardProps) {
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
                Basics
              </Typography>
              <TextField
                label="Station name"
                {...textField("name")}
                placeholder="e.g. Central Plaza Fast Charge"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Address"
                {...textField("address")}
                placeholder="Street, city, region"
                error={!!errors.address}
                helperText={errors.address?.message}
                fullWidth
                sx={fieldSx}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField label="Status" select fullWidth sx={fieldSx} {...field}>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Location
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Latitude"
                  type="number"
                  {...textField("lat")}
                  error={!!errors.lat}
                  helperText={errors.lat?.message}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Longitude"
                  type="number"
                  {...textField("lng")}
                  error={!!errors.lng}
                  helperText={errors.lng?.message}
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
                  Click the map to set coordinates.
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
                  {location.locationLoading ? "Locating..." : "Use my location"}
                </Button>
              </Stack>
              {location.addressLookupLoading ? (
                <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                  Looking up address...
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
                  Connectors
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
                  Add connector
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
                          Connector {index + 1}
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
                            aria-label="Remove connector"
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
                              label="Type"
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
                          label="Power (kW)"
                          type="number"
                          {...textField(`connectors.${index}.powerKW`)}
                          fullWidth
                          sx={fieldSx}
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          label="Ports"
                          type="number"
                          {...textField(`connectors.${index}.ports`)}
                          fullWidth
                          sx={fieldSx}
                        />
                        <TextField
                          label="Available ports"
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
                <Typography sx={errorTextSx}>{connectorsError}</Typography>
              ) : null}
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Pricing
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Currency"
                  {...textField("pricing.currency")}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Per kWh"
                  type="number"
                  {...textField("pricing.perKwh")}
                  error={!!errors.pricing?.perKwh}
                  helperText={errors.pricing?.perKwh?.message}
                  fullWidth
                  sx={fieldSx}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Per minute (optional)"
                  type="number"
                  {...textField("pricing.perMinute")}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Parking fee (optional)"
                  {...textField("pricing.parkingFee")}
                  fullWidth
                  sx={fieldSx}
                />
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Amenities
              </Typography>
              <TextField
                label="Amenities"
                {...textField("amenities")}
                helperText="Comma-separated list (e.g. Restroom, Coffee, Wi-Fi)"
                fullWidth
                sx={fieldSx}
              />
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800, color: UI.text }}>
                  Photos
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
                  Add photo
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
                            Photo
                          </Typography>
                          <Box sx={{ flex: 1 }} />
                          <IconButton
                            size="small"
                            onClick={() => photos.remove(index)}
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${UI.border2}`,
                            }}
                            aria-label="Remove photo"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                          <TextField
                            label="Label"
                            {...textField(`photos.${index}.label`)}
                            fullWidth
                            sx={fieldSx}
                          />
                          <TextField
                            label="Gradient"
                            {...textField(`photos.${index}.gradient`)}
                            placeholder="linear-gradient(135deg, ...)"
                            fullWidth
                            sx={fieldSx}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                    No photos added yet.
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Notes
              </Typography>
              <TextField
                label="Notes"
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
                Cancel
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
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
