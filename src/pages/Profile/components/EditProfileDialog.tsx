import type { FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";

type EditProfileDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  nameDraft: string;
  regionDraft: string;
  profileError: string | null;
  email: string | null;
  userId: string | null;
  onNameChange: (value: string) => void;
  onRegionChange: (value: string) => void;
};

// Renders the profile editing dialog and form fields.
export default function EditProfileDialog({
  open,
  onClose,
  onSubmit,
  nameDraft,
  regionDraft,
  profileError,
  email,
  userId,
  onNameChange,
  onRegionChange,
}: EditProfileDialogProps) {
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
      <DialogTitle sx={{ fontWeight: 950 }}>Edit profile</DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Form id="profile-form" method="post" onSubmit={onSubmit}>
          <input type="hidden" name="intent" value="profile" />
          <input type="hidden" name="userId" value={userId?.trim() || ""} />
          <Stack spacing={2}>
            <TextField
              label="Full name"
              name="name"
              value={nameDraft}
              onChange={(event) => onNameChange(event.target.value)}
              fullWidth
              required
              error={!!profileError}
              helperText={profileError || "Shown on your profile."}
            />
            <TextField label="Email" value={email || ""} fullWidth disabled />
            <TextField
              label="Region"
              name="region"
              value={regionDraft}
              onChange={(event) => onRegionChange(event.target.value)}
              fullWidth
              placeholder="Example: Jakarta, ID"
              helperText="Used for local recommendations."
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
          form="profile-form"
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
