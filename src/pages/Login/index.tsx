import { useMemo, useState } from "react";
import { Box, CssBaseline, Snackbar } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { UI } from "../../theme/theme";
import type { LoginValues } from "../../forms/schemas";
import { getRememberedLoginEmail } from "./loginStorage";
import { loginRequest } from "./loginRoute";
import { safeNextPath } from "./loginUtils";
import { consumeSessionMessage } from "../../utils/session";
import LoginAppBar from "./components/LoginAppBar";
import LoginBackground from "./components/LoginBackground";
import LoginFormCard from "./components/LoginFormCard";

// Login page container. The form state lives in LoginFormCard (react-hook-form);
// this page owns the submit side-effects (API call) and navigation.
export default function ChargeFinderLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation("login");

  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(() =>
    consumeSessionMessage(),
  );
  const [defaultEmail] = useState(
    () => getRememberedLoginEmail() ?? "demo@chargefinder.com",
  );

  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams],
  );

  // Validated by zodResolver(loginSchema) before this runs.
  const handleLogin = async (values: LoginValues, remember: boolean) => {
    setServerError(null);
    const result = await loginRequest({
      email: values.email,
      password: values.password,
      remember,
    });
    if (result.ok) {
      navigate(nextPath);
    } else {
      setServerError(result.error);
    }
  };

  const handleForgotPassword = () => {
    setToast(t("toast.forgotPassword"));
  };

  const handleNavigateToSignup = () => {
    navigate(`/signup?next=${encodeURIComponent(nextPath)}`);
  };

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <CssBaseline />

      <LoginAppBar onNavigateHome={() => navigate("/")} />

      <Box
        sx={{
          width: "100%",
          height: { xs: "calc(100dvh - 65px)" },
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "center" },
          alignItems: "center",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <LoginBackground />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "1fr",
            alignItems: "start",
            width: "100%",
            maxWidth: 520,
            mx: "auto",
          }}
        >
          <LoginFormCard
            defaultEmail={defaultEmail}
            defaultPassword="demo123"
            serverError={serverError}
            onDismissError={() => setServerError(null)}
            onSubmit={handleLogin}
            onForgotPassword={handleForgotPassword}
            onNavigateToSignup={handleNavigateToSignup}
          />
        </Box>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={3200}
        onClose={() => setToast(null)}
        message={toast || ""}
      />
    </Box>
  );
}
