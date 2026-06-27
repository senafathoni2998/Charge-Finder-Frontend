import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Box, CssBaseline, Snackbar } from "@mui/material";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";
import { isValidEmail } from "../../utils/validate";
import { UI } from "../../theme/theme";
import type { LoginActionData } from "./types";
import { getRememberedLoginEmail } from "./loginStorage";
import { safeNextPath } from "./loginUtils";
import { consumeSessionMessage } from "../../utils/session";
import LoginAppBar from "./components/LoginAppBar";
import LoginBackground from "./components/LoginBackground";
import LoginFormCard from "./components/LoginFormCard";

export { loginAction } from "./loginRoute";

// Login page container that wires form state and layout components.
export default function ChargeFinderLoginPage() {
  const navigate = useNavigate();
  const actionData = useActionData() as LoginActionData | undefined;
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(
    () => getRememberedLoginEmail() ?? "demo@chargefinder.com",
  );
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(() =>
    consumeSessionMessage(),
  );

  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams],
  );
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) setError(actionData.error);
  }, [actionData]);

  // Performs client-side validation before submitting the form.
  const handleSubmit = (event: FormEvent) => {
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      event.preventDefault();
      return;
    }
    // Login only requires a non-empty password. Composition rules (length/digits)
    // belong on signup and change-password, never on login — enforcing them here
    // locks out existing users whose passwords predate those rules.
    if (!password) {
      setError("Please enter your password.");
      event.preventDefault();
      return;
    }
  };

  const handleForgotPassword = () => {
    setToast("Forgot password (demo). Wire to reset flow.");
  };

  const handleNavigateToSignup = () => {
    navigate(`/signup?next=${encodeURIComponent(nextPath)}`);
  };

  const formValues = { email, password };
  const formHandlers = {
    onEmailChange: (value: string) => setEmail(value),
    onPasswordChange: (value: string) => setPassword(value),
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
            values={formValues}
            handlers={formHandlers}
            error={error}
            onDismissError={() => setError(null)}
            onSubmit={handleSubmit}
            pwIssue={null}
            isSubmitting={isSubmitting}
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
