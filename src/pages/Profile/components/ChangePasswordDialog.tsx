import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { UI } from "../../../theme/theme";
import { strengthLabel, toneChipSx } from "../../../utils/validate";
import {
  changePasswordFormSchema,
  type ChangePasswordValues,
} from "../../../forms/schemas";

const EMPTY: ChangePasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
  serverError: string | null;
  onDismissError: () => void;
  onSubmit: (values: ChangePasswordValues) => void | Promise<void>;
};

// Password update dialog. Owns the form via react-hook-form + zodResolver; the
// page provides the submit handler (API call) and any server error.
export default function ChangePasswordDialog({
  open,
  onClose,
  serverError,
  onDismissError,
  onSubmit,
}: ChangePasswordDialogProps) {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  const { ref: currentRef, ...currentField } = register("currentPassword");
  const { ref: newRef, ...newField } = register("newPassword");
  const { ref: confirmRef, ...confirmField } = register("confirmPassword");

  const newPassword = watch("newPassword");
  const newPwStrength = strengthLabel(newPassword);

  useEffect(() => {
    if (!open) return;
    reset(EMPTY);
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
  }, [open, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      backgroundColor: "rgba(10,10,16,0.02)",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: UI.surface,
          border: `1px solid ${UI.border}`,
          color: UI.text,
          boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 950 }}>Change password</DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Box component="form" id="password-form" onSubmit={submit} noValidate>
          <Stack spacing={2}>
            {serverError ? (
              <Alert severity="error" onClose={onDismissError}>
                {serverError}
              </Alert>
            ) : null}
            <TextField
              label="Current password"
              inputRef={currentRef}
              {...currentField}
              autoComplete="current-password"
              fullWidth
              type={showCurrentPw ? "text" : "password"}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message ?? " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: UI.text3 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPw((value) => !value)}
                      edge="end"
                      aria-label={showCurrentPw ? "Hide password" : "Show password"}
                    >
                      {showCurrentPw ? (
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
              label="New password"
              inputRef={newRef}
              {...newField}
              autoComplete="new-password"
              fullWidth
              type={showNewPw ? "text" : "password"}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message ?? " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: UI.text3 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPw((value) => !value)}
                      edge="end"
                      aria-label={showNewPw ? "Hide password" : "Show password"}
                    >
                      {showNewPw ? (
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
            <Stack direction="row" spacing={1} alignItems="center">
              {newPassword.length > 0 ? (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Strength: ${newPwStrength.label}`}
                  sx={{
                    borderRadius: 999,
                    color: UI.text,
                    fontWeight: 900,
                    borderWidth: 1,
                    ...toneChipSx(newPwStrength.tone),
                  }}
                />
              ) : null}
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                Use 8+ characters, letters, and numbers.
              </Typography>
            </Stack>
            <TextField
              label="Confirm new password"
              inputRef={confirmRef}
              {...confirmField}
              autoComplete="new-password"
              fullWidth
              type={showConfirmPw ? "text" : "password"}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message ?? " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: UI.text3 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPw((value) => !value)}
                      edge="end"
                      aria-label={showConfirmPw ? "Hide password" : "Show password"}
                    >
                      {showConfirmPw ? (
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
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          form="password-form"
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          Update password
        </Button>
      </DialogActions>
    </Dialog>
  );
}
