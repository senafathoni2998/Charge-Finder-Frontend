import { useMemo, useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";
import { UI } from "../../theme/theme";
import type { SignupFormValues } from "../../forms/schemas";
import { signupRequest } from "./signupRoute";
import { safeNextPath } from "./signupUtils";
import SignupAppBar from "./components/SignupAppBar";
import SignupBackground from "./components/SignupBackground";
import SignupFormCard from "./components/SignupFormCard";

// Signup page container. The form state lives in SignupFormCard (react-hook-form);
// this page owns the submit side-effects (API call) and navigation.
export default function ChargeFinderSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [serverError, setServerError] = useState<string | null>(null);

  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );

  // Validated by zodResolver(signupFormSchema) before this runs.
  const handleSignup = async (
    values: SignupFormValues,
    opts: { remember: boolean; image: File | null }
  ) => {
    setServerError(null);
    const result = await signupRequest({
      name: values.name,
      region: values.region,
      email: values.email,
      password: values.password,
      remember: opts.remember,
      image: opts.image,
    });
    if (result.ok) {
      navigate(nextPath);
    } else {
      setServerError(result.error);
    }
  };

  const handleNavigateToLogin = () => {
    navigate(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <CssBaseline />

      <SignupAppBar />

      <Box
        sx={{
          height: { xs: "auto", md: "calc(100dvh - 65px)" },
          position: "relative",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <SignupBackground />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "1fr",
            alignItems: "start",
            maxWidth: 520,
            mx: "auto",
          }}
        >
          <SignupFormCard
            serverError={serverError}
            onDismissError={() => setServerError(null)}
            onSubmit={handleSignup}
            onNavigateToLogin={handleNavigateToLogin}
          />
        </Box>
      </Box>
    </Box>
  );
}
