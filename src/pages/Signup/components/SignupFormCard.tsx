import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LocationCity } from "@mui/icons-material";
import { UI } from "../../../theme/theme";
import { isValidName, strengthLabel, toneChipSx } from "../../../utils/validate";
import { signupFormSchema, type SignupFormValues } from "../../../forms/schemas";

type SignupFormCardProps = {
  serverError: string | null;
  onDismissError: () => void;
  onSubmit: (
    values: SignupFormValues,
    opts: { remember: boolean; image: File | null },
  ) => void | Promise<void>;
  onNavigateToLogin: () => void;
};

// Renders the signup card. Owns the form via react-hook-form + zodResolver; the
// page provides the submit handler (API call + navigation) and any server error.
export default function SignupFormCard({
  serverError,
  onDismissError,
  onSubmit,
  onNavigateToLogin,
}: SignupFormCardProps) {
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoPreviewRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { name: "", region: "", email: "", password: "", confirm: "" },
    mode: "onTouched",
  });

  const { ref: nameRef, ...nameField } = register("name");
  const { ref: regionRef, ...regionField } = register("region");
  const { ref: emailRef, ...emailField } = register("email");
  const { ref: passwordRef, ...passwordField } = register("password");
  const { ref: confirmRef, ...confirmField } = register("confirm");

  // name/region are non-blocking — show a soft hint (like the legacy form) rather
  // than gating submit. password strength is derived live from the watched value.
  const nameValue = watch("name");
  const regionValue = watch("region");
  const nameInvalid = nameValue.length > 0 && !isValidName(nameValue);
  const regionInvalid = regionValue.length > 0 && !isValidName(regionValue);
  const pwStrength = strengthLabel(watch("password"));

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

  const submit = handleSubmit((values) =>
    onSubmit(values, { remember, image: photoFile }),
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: "0 18px 50px rgba(10,10,16,0.12)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: 10,
          background: UI.brandGradStrong,
        }}
      />
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontWeight: 980,
                color: UI.text,
                fontSize: 26,
                lineHeight: 1.15,
              }}
            >
              Create your account
            </Typography>
            <Typography sx={{ color: UI.text2, mt: 0.5 }}>
              Save your car profile and personalize stations.
            </Typography>
          </Box>

          {serverError ? (
            <Alert
              severity="error"
              onClose={onDismissError}
              sx={{
                borderRadius: 3,
                border: `1px solid rgba(244, 67, 54, 0.22)`,
                backgroundColor: "rgba(244, 67, 54, 0.08)",
              }}
            >
              {serverError}
            </Alert>
          ) : null}

          <Box component="form" onSubmit={submit} noValidate>
            <Stack spacing={1.5}>
              <TextField
                placeholder="Your full name"
                label="Name"
                inputRef={nameRef}
                {...nameField}
                autoComplete="name"
                fullWidth
                error={nameInvalid}
                helperText={nameInvalid ? "Please enter a valid name." : " "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: UI.text3 }} />
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
                placeholder="Your Region"
                label="Region"
                inputRef={regionRef}
                {...regionField}
                autoComplete="address-level1"
                fullWidth
                error={regionInvalid}
                helperText={
                  regionInvalid ? "Please enter a valid region." : " "
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCity sx={{ color: UI.text3 }} />
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

              <Stack spacing={1}>
                <Typography
                  sx={{
                    color: UI.text2,
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: 0.2,
                  }}
                >
                  Profile photo (optional)
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
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
                      component={"label" as React.ElementType}
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
              </Stack>

              <TextField
                label="Email"
                placeholder="name@email.com"
                inputRef={emailRef}
                {...emailField}
                autoComplete="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message ?? " "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: UI.text3 }} />
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
                label="Password"
                placeholder="At least 7 characters"
                inputRef={passwordRef}
                {...passwordField}
                autoComplete="new-password"
                fullWidth
                type={showPw ? "text" : "password"}
                error={!!errors.password}
                helperText={errors.password?.message ?? " "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />

              <TextField
                label="Confirm password"
                placeholder="Re-enter your password"
                inputRef={confirmRef}
                {...confirmField}
                autoComplete="new-password"
                fullWidth
                type={showConfirm ? "text" : "password"}
                error={!!errors.confirm}
                helperText={errors.confirm?.message ?? " "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((value) => !value)}
                        edge="end"
                        aria-label={
                          showConfirm
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirm ? (
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

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: -0.5 }}
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Strength: ${pwStrength.label}`}
                  sx={{
                    borderRadius: 999,
                    color: UI.text,
                    fontWeight: 900,
                    borderWidth: 1,
                    ...toneChipSx(pwStrength.tone),
                  }}
                />
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      name="remember"
                      value="1"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      sx={{
                        color: UI.text3,
                        "&.Mui-checked": {
                          color: "rgba(124,92,255,0.95)",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        color: UI.text2,
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      Remember me
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />

                <Box sx={{ flex: 1 }} />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    px: 2.25,
                    py: 1.1,
                    background: UI.brandGradStrong,
                    color: "white",
                    boxShadow: "0 14px 40px rgba(124,92,255,0.16)",
                  }}
                >
                  {isSubmitting ? "Creating" : "Create account"}
                </Button>
              </Stack>

              <Divider sx={{ borderColor: UI.border2, my: 0.75 }} />

              <Typography variant="body2" sx={{ color: UI.text2 }}>
                Already have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={onNavigateToLogin}
                  underline="hover"
                  sx={{
                    fontWeight: 950,
                    color: "rgba(124,92,255,0.95)",
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </Box>

          <Typography variant="caption" sx={{ color: UI.text3 }}>
            By creating an account, you agree to the demo Terms and Privacy.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
