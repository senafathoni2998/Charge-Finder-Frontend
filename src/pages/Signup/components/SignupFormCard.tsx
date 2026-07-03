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
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import { isValidName, strengthLabel, toneChipSx } from "../../../utils/validate";
import { signupFormSchema, type SignupFormValues } from "../../../forms/schemas";
import { tValidation } from "../../../i18n/validation";

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
  const { t } = useTranslation("signup");
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
              {t("card.title")}
            </Typography>
            <Typography sx={{ color: UI.text2, mt: 0.5 }}>
              {t("card.subtitle")}
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
                placeholder={t("fields.name.placeholder")}
                label={t("fields.name.label")}
                inputRef={nameRef}
                {...nameField}
                autoComplete="name"
                fullWidth
                error={nameInvalid}
                helperText={nameInvalid ? t("fields.name.invalid") : " "}
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
                placeholder={t("fields.region.placeholder")}
                label={t("fields.region.label")}
                inputRef={regionRef}
                {...regionField}
                autoComplete="address-level1"
                fullWidth
                error={regionInvalid}
                helperText={
                  regionInvalid ? t("fields.region.invalid") : " "
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
                  {t("photo.title")}
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
                      {photoFile ? t("photo.change") : t("photo.upload")}
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
                      {photoFile ? photoFile.name : t("photo.hint")}
                    </Typography>
                  </Stack>
                  {photoFile ? (
                    <Button
                      type="button"
                      size="small"
                      onClick={handlePhotoClear}
                      sx={{ textTransform: "none", color: UI.text2 }}
                    >
                      {t("photo.remove")}
                    </Button>
                  ) : null}
                </Stack>
              </Stack>

              <TextField
                label={t("fields.email.label")}
                placeholder={t("fields.email.placeholder")}
                inputRef={emailRef}
                {...emailField}
                autoComplete="email"
                fullWidth
                error={!!errors.email}
                helperText={tValidation(t, errors.email?.message) || " "}
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
                label={t("fields.password.label")}
                placeholder={t("fields.password.placeholder")}
                inputRef={passwordRef}
                {...passwordField}
                autoComplete="new-password"
                fullWidth
                type={showPw ? "text" : "password"}
                error={!!errors.password}
                helperText={tValidation(t, errors.password?.message) || " "}
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
                        aria-label={
                          showPw
                            ? t("fields.password.hide")
                            : t("fields.password.show")
                        }
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
                label={t("fields.confirm.label")}
                placeholder={t("fields.confirm.placeholder")}
                inputRef={confirmRef}
                {...confirmField}
                autoComplete="new-password"
                fullWidth
                type={showConfirm ? "text" : "password"}
                error={!!errors.confirm}
                helperText={tValidation(t, errors.confirm?.message) || " "}
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
                            ? t("fields.confirm.hide")
                            : t("fields.confirm.show")
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
                  label={t("strength", {
                    label: t(`strengthLabels.${pwStrength.tone}`),
                  })}
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
                      {t("rememberMe")}
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
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </Stack>

              <Divider sx={{ borderColor: UI.border2, my: 0.75 }} />

              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {t("haveAccount")}{" "}
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
                  {t("signIn")}
                </Link>
              </Typography>
            </Stack>
          </Box>

          <Typography variant="caption" sx={{ color: UI.text3 }}>
            {t("terms")}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
