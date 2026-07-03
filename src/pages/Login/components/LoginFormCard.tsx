import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import { loginSchema, type LoginValues } from "../../../forms/schemas";
import { tValidation } from "../../../i18n/validation";

type LoginFormCardProps = {
  defaultEmail: string;
  defaultPassword: string;
  serverError: string | null;
  onDismissError: () => void;
  onSubmit: (values: LoginValues, remember: boolean) => void | Promise<void>;
  onForgotPassword: () => void;
  onNavigateToSignup: () => void;
};

// Renders the login card. Owns the form via react-hook-form + zodResolver; the
// page provides the submit handler (API call + navigation) and any server error.
export default function LoginFormCard({
  defaultEmail,
  defaultPassword,
  serverError,
  onDismissError,
  onSubmit,
  onForgotPassword,
  onNavigateToSignup,
}: LoginFormCardProps) {
  const { t } = useTranslation("login");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: defaultPassword },
    mode: "onTouched",
  });

  const { ref: emailRef, ...emailField } = register("email");
  const { ref: passwordRef, ...passwordField } = register("password");

  const submit = handleSubmit((values) => onSubmit(values, remember));

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
              {t("heading.title")}
            </Typography>
            <Typography sx={{ color: UI.text2, mt: 0.5 }}>
              {t("heading.subtitle")}
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
                autoComplete="current-password"
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

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: -0.5 }}
              >
                <Box sx={{ flex: 1 }} />
                <Link
                  component="button"
                  type="button"
                  onClick={onForgotPassword}
                  underline="hover"
                  sx={{ color: UI.text2, fontWeight: 800, fontSize: 13 }}
                >
                  {t("actions.forgotPassword")}
                </Link>
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
                      {t("actions.rememberMe")}
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
                  {isSubmitting ? t("actions.signingIn") : t("actions.signIn")}
                </Button>
              </Stack>

              <Box
                sx={{
                  mt: 0.25,
                  p: 1.25,
                  borderRadius: 3,
                  border: `1px dashed ${UI.border}`,
                  backgroundColor: "rgba(10,10,16,0.02)",
                }}
              >
                <Typography variant="body2" sx={{ color: UI.text2 }}>
                  {t("signup.prompt")}{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={onNavigateToSignup}
                    underline="hover"
                    sx={{
                      fontWeight: 950,
                      color: "rgba(124,92,255,0.95)",
                    }}
                  >
                    {t("signup.cta")}
                  </Link>
                </Typography>
              </Box>
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
