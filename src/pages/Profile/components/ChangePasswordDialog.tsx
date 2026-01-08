import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
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
import { Form } from "react-router";
import { UI } from "../../../theme/theme";
import { toneChipSx } from "../../../utils/validate";

type PasswordStrength = {
  label: string;
  tone: "weak" | "ok" | "strong";
};

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  passwordError: string | null;
  newPwIssue: string | null;
  newPwStrength: PasswordStrength;
  userId: string | null;
};

// Renders the password update dialog with inline validation feedback.
export default function ChangePasswordDialog({
  open,
  onClose,
  onSubmit,
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  passwordError,
  newPwIssue,
  newPwStrength,
  userId,
}: ChangePasswordDialogProps) {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
  }, [open]);

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
        <Form id="password-form" method="post" onSubmit={onSubmit}>
          <input type="hidden" name="intent" value="password" />
          <input type="hidden" name="userId" value={userId?.trim() || ""} />
          <Stack spacing={2}>
            {passwordError ? (
              <Alert severity="error">{passwordError}</Alert>
            ) : null}
            <TextField
              label="Current password"
              name="currentPassword"
              value={currentPassword}
              onChange={(event) => onCurrentPasswordChange(event.target.value)}
              autoComplete="current-password"
              fullWidth
              type={showCurrentPw ? "text" : "password"}
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
                      aria-label={
                        showCurrentPw ? "Hide password" : "Show password"
                      }
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            />
            <TextField
              label="New password"
              name="newPassword"
              value={newPassword}
              onChange={(event) => onNewPasswordChange(event.target.value)}
              autoComplete="new-password"
              fullWidth
              type={showNewPw ? "text" : "password"}
              error={newPassword.length > 0 && !!newPwIssue}
              helperText={newPassword.length > 0 && newPwIssue ? newPwIssue : " "}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
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
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              autoComplete="new-password"
              fullWidth
              type={showConfirmPw ? "text" : "password"}
              error={confirmPassword.length > 0 && confirmPassword !== newPassword}
              helperText={
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? "Passwords do not match."
                  : " "
              }
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
                      aria-label={
                        showConfirmPw ? "Hide password" : "Show password"
                      }
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            />
          </Stack>
        </Form>
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
