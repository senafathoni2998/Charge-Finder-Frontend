import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ElementType,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { UI } from "../../../theme/theme";
import {
  editProfileFormSchema,
  type EditProfileValues,
} from "../../../forms/schemas";

type EditProfileDialogProps = {
  open: boolean;
  onClose: () => void;
  email: string | null;
  initialName: string;
  initialRegion: string;
  serverError: string | null;
  onDismissError: () => void;
  onSubmit: (
    values: EditProfileValues,
    image: File | null,
  ) => void | Promise<void>;
};

// Profile editing dialog. Owns the form via react-hook-form + zodResolver; the
// page provides the submit handler (API call + side-effects) and any server error.
export default function EditProfileDialog({
  open,
  onClose,
  email,
  initialName,
  initialRegion,
  serverError,
  onDismissError,
  onSubmit,
}: EditProfileDialogProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoPreviewRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: { name: initialName, region: initialRegion },
  });

  const { ref: nameRef, ...nameField } = register("name");
  const { ref: regionRef, ...regionField } = register("region");

  // Re-sync the form to the current profile each time the dialog opens.
  useEffect(() => {
    if (open) reset({ name: initialName, region: initialRegion });
  }, [open, initialName, initialRegion, reset]);

  useEffect(() => {
    return () => {
      if (photoPreviewRef.current) {
        URL.revokeObjectURL(photoPreviewRef.current);
        photoPreviewRef.current = null;
      }
    };
  }, []);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (photoPreviewRef.current) {
      URL.revokeObjectURL(photoPreviewRef.current);
      photoPreviewRef.current = null;
    }
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      photoPreviewRef.current = objectUrl;
      setPhotoPreview(objectUrl);
    } else {
      setPhotoPreview(null);
    }
  };

  const handlePhotoClear = () => {
    setPhotoFile(null);
    if (photoPreviewRef.current) {
      URL.revokeObjectURL(photoPreviewRef.current);
      photoPreviewRef.current = null;
    }
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleDialogClose = () => {
    handlePhotoClear();
    onClose();
  };

  const submit = handleSubmit((values) => onSubmit(values, photoFile));

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      TransitionProps={{ onExited: handlePhotoClear }}
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
        <Box component="form" id="profile-form" onSubmit={submit} noValidate>
          <Stack spacing={2}>
            {serverError ? (
              <Alert severity="error" onClose={onDismissError}>
                {serverError}
              </Alert>
            ) : null}
            <TextField
              label="Full name"
              inputRef={nameRef}
              {...nameField}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name?.message || "Shown on your profile."}
            />
            <TextField label="Email" value={email || ""} fullWidth disabled />
            <Box>
              <Typography
                sx={{
                  color: UI.text2,
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  mb: 1,
                }}
              >
                Profile photo (optional)
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={photoPreview ?? undefined}
                  sx={{
                    width: 56,
                    height: 56,
                    background: UI.brandGrad,
                    color: "white",
                    fontWeight: 900,
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                  <Button
                    component={"label" as ElementType}
                    variant="outlined"
                    type="button"
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      alignSelf: "flex-start",
                      borderColor: UI.border2,
                      color: UI.text,
                    }}
                  >
                    {photoFile ? "Change photo" : "Upload photo"}
                    <input
                      ref={photoInputRef}
                      hidden
                      accept="image/*"
                      name="image"
                      type="file"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {photoFile ? photoFile.name : "JPG or PNG recommended."}
                  </Typography>
                </Stack>
                {photoFile ? (
                  <Button
                    type="button"
                    size="small"
                    onClick={handlePhotoClear}
                    sx={{ textTransform: "none", color: UI.text2 }}
                  >
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Box>
            <TextField
              label="Region"
              inputRef={regionRef}
              {...regionField}
              fullWidth
              placeholder="Example: Jakarta, ID"
              helperText="Used for local recommendations."
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={handleDialogClose}
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
