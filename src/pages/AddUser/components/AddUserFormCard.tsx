import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { UI } from "../../../theme/theme";
import {
  addUserFormSchema,
  type AddUserFormValues,
} from "../../../forms/schemas";

type AddUserFormCardProps = {
  serverError: string | null;
  onSubmit: (values: AddUserFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  submittingLabel?: string;
};

const ROLE_OPTIONS = ["admin", "user"];
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "rgba(10,10,16,0.02)",
  },
};

// Renders the user form card. Owns the form via react-hook-form + zodResolver.
export default function AddUserFormCard({
  serverError,
  onSubmit,
  onCancel,
  submitLabel = "Create user",
  submittingLabel = "Creating...",
}: AddUserFormCardProps) {
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: { name: "", email: "", role: "user", password: "", region: "" },
    mode: "onTouched",
  });

  const { ref: nameRef, ...nameField } = register("name");
  const { ref: emailRef, ...emailField } = register("email");
  const { ref: passwordRef, ...passwordField } = register("password");
  const { ref: regionRef, ...regionField } = register("region");

  const submit = handleSubmit((values) => onSubmit(values));

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
              label="Full name"
              inputRef={nameRef}
              {...nameField}
              placeholder="e.g. Nadia Putri"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={inputSx}
            />
            <TextField
              label="Email"
              type="email"
              inputRef={emailRef}
              {...emailField}
              placeholder="e.g. nadia@chargefinder.app"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={inputSx}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Role"
                  select
                  fullWidth
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  sx={inputSx}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              label="Password"
              type={showPw ? "text" : "password"}
              inputRef={passwordRef}
              {...passwordField}
              placeholder="Set a temporary password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((value) => !value)}
                      edge="end"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <VisibilityOffIcon sx={{ color: UI.text3 }} />
                      ) : (
                        <VisibilityIcon sx={{ color: UI.text3 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
            <TextField
              label="Region"
              inputRef={regionRef}
              {...regionField}
              placeholder="e.g. Jakarta, ID"
              fullWidth
              error={!!errors.region}
              helperText={errors.region?.message}
              sx={inputSx}
            />

            {serverError ? (
              <Box sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
                {serverError}
              </Box>
            ) : null}

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <Button
                variant="outlined"
                type="button"
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
